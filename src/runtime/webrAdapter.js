/**
 * WebR adapter — runs R 4.x in a Web Worker via WebAssembly.
 *
 * Loaded from the official CDN (https://webr.r-wasm.org/) with the PostMessage
 * channel so the page works on plain static hosts (no COOP/COEP needed).
 *
 * Plot capture strategy:
 *   We open the SVG graphics device before evaluation, then call dev.off() to
 *   flush. The captured SVG string is delivered to onPlot as { mime: 'image/svg+xml' }.
 *   This works for base R graphics, lattice, AND ggplot2 (after print()).
 *
 * The init step preloads ggplot2 + the tidyverse-light essentials. This is a
 * one-time cost (~10–30s on first Run) so the student sees a "Booting R…" notice.
 */

const WEBR_VERSION = "0.5.4";
const WEBR_CDN = `https://webr.r-wasm.org/v${WEBR_VERSION}/webr.mjs`;

export async function createWebRAdapter() {
  const { WebR, ChannelType } = await import(/* @vite-ignore */ WEBR_CDN);

  // ChannelType.PostMessage avoids SharedArrayBuffer requirements (no COOP/COEP
  // headers needed), so the runtime works on plain static hosts (GitHub Pages,
  // Vercel without headers). MUST be the enum value, not a string — passing a
  // string like "post-message" silently falls through to the default channel
  // and the worker init then fails on hosts without crossOriginIsolated.
  const webR = new WebR({ channelType: ChannelType.PostMessage });

  await webR.init();

  // Try to load ggplot2 silently; fall back to base graphics if unavailable.
  try {
    await webR.installPackages(["ggplot2"], { quiet: true });
    await webR.evalR("suppressMessages(library(ggplot2))");
  } catch {
    // ggplot2 is optional — base R plotting still works.
  }

  async function run({ code, onStdout, onStderr, onPlot }) {
    const shelter = await new webR.Shelter();
    const plotPath = `/tmp/webr-plot-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.svg`;
    let svgOpened = false;

    try {
      // Open the SVG graphics device BEFORE captureR so the user code's line
      // numbers in any error message reflect the user's own code (not a
      // wrapper). Plots written between svg(...) and the closing dev.off()
      // land in plotPath on the WebR filesystem.
      try {
        await webR.evalRVoid(`svg(${JSON.stringify(plotPath)}, width = 7, height = 5)`);
        svgOpened = true;
      } catch (devErr) {
        // If we can't even open a graphics device, surface a hint but keep
        // running — the student should still see text output.
        onStderr?.(
          `Note: could not open the plot device (${devErr?.message || devErr}). Text output will still appear; plots may not.\n`,
        );
      }

      const captured = await shelter.captureR(code, {
        withAutoprint: true,
        captureStreams: true,
      });

      for (const line of captured.output) {
        if (line.type === "stdout") onStdout?.(line.data + "\n");
        else if (line.type === "stderr") onStderr?.(line.data + "\n");
      }

      // Read the SVG file from the WebR FS, if present.
      if (svgOpened) {
        try {
          const bytes = await webR.FS.readFile(plotPath);
          if (bytes && bytes.byteLength > 0) {
            const svgText = new TextDecoder().decode(bytes);
            // Heuristic: empty SVG (no plot drawn) is just headers.
            if (svgText.includes("<g") || svgText.includes("<rect") || svgText.includes("<circle")) {
              onPlot?.({
                mime: "image/svg+xml",
                data: svgText,
                alt: "R plot output",
              });
            }
          }
        } catch {
          // No plot was drawn — that's fine.
        }
      }

      return {
        ok: true,
        result: stringifyR(captured.result),
      };
    } catch (err) {
      onStderr?.(`Error: ${err?.message || String(err)}\n`);
      return { ok: false, error: err?.message || String(err) };
    } finally {
      // Close the device ONLY if it's still open. If user code already called
      // dev.off(), `length(dev.list())` will be 0 and we silently skip — no
      // confusing "cannot shut down null device" warning to the student.
      if (svgOpened) {
        try {
          await webR.evalRVoid("if (length(dev.list()) > 0) invisible(dev.off())");
        } catch {
          // Device-cleanup failure is not actionable for the student.
        }
        // Best-effort cleanup of the temp SVG file.
        try { await webR.FS.unlink(plotPath); } catch { /* ignore */ }
      }
      await shelter.purge();
    }
  }

  return { language: "r", run };
}

function stringifyR(value) {
  if (value == null) return "";
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}
