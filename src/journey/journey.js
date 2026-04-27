/**
 * Student-facing journey strip — the "you are here" map.
 *
 * Why this exists: the LXD audit (docs/learning-design/02-lxd-cycle.md) flagged
 * that students lose track of where they are across the 6 checkpoints. The
 * sidebar is hidden on mobile, the in-page progress bar only shows numeric %,
 * and the official checkpoint names ("Hotspot", "Mutation", "Provenance Check")
 * are unfamiliar jargon that doesn't help orientation.
 *
 * This strip:
 *   - is a single horizontal row with 6 stops, plain-language verbs only
 *   - shows where you are (current), what you finished (done), what's next (locked-ish)
 *   - is keyboard- and screen-reader-friendly (ordered list, aria-current="step")
 *   - auto-mounts on any page that has <div id="cdl-journey-mount"></div>
 *
 * Plain-language labels (set once here, used everywhere). The "official"
 * jargon stays in code/state for backwards compatibility — students never see it.
 */

export const JOURNEY = [
  {
    key: "submission",
    plain: "Submit",
    helper: "Paste the code you want to defend",
    pagePath: "./student-submission.html",
  },
  {
    key: "hotspot",
    plain: "Explain",
    helper: "Explain the lines that matter most",
    pagePath: "./hotspot-questions.html",
  },
  {
    key: "trace",
    plain: "Predict",
    helper: "Predict what the code will do",
    pagePath: "./trace-mode-task.html",
  },
  {
    key: "mutation",
    plain: "Adapt",
    helper: "Change the code for a new situation",
    pagePath: "./mutation-task.html",
  },
  {
    key: "repair",
    plain: "Fix",
    helper: "Diagnose and repair a broken version",
    pagePath: "./repair-mode-task.html",
  },
  {
    key: "result",
    plain: "Reflect",
    helper: "See where understanding lined up",
    pagePath: "./student-result.html",
  },
];

/**
 * Mounts the journey strip into <div id="cdl-journey-mount"></div>.
 *
 * @param {object} opts
 * @param {string} opts.activeKey  - JOURNEY[].key for the current page
 * @param {string[]=} opts.completedKeys - keys the student has finished
 */
export function mountJourneyStrip({ activeKey, completedKeys = [] } = {}) {
  const mount = document.getElementById("cdl-journey-mount");
  if (!mount || mount.dataset.cdlJourneyMounted) return;
  mount.dataset.cdlJourneyMounted = "1";

  const wrap = document.createElement("nav");
  wrap.className = "cdl-journey";
  wrap.setAttribute("aria-label", "Assessment journey");

  const ol = document.createElement("ol");
  ol.className = "cdl-journey__list";

  JOURNEY.forEach((stop, idx) => {
    const li = document.createElement("li");
    const isActive = stop.key === activeKey;
    const isDone = completedKeys.includes(stop.key) && !isActive;

    li.className = [
      "cdl-journey__item",
      isActive ? "cdl-journey__item--active" : "",
      isDone ? "cdl-journey__item--done" : "",
    ]
      .filter(Boolean)
      .join(" ");

    if (isActive) li.setAttribute("aria-current", "step");

    const link = document.createElement("a");
    link.href = stop.pagePath;
    link.className = "cdl-journey__link";

    const num = document.createElement("span");
    num.className = "cdl-journey__num";
    num.setAttribute("aria-hidden", "true");
    num.textContent = String(idx + 1);

    const labelWrap = document.createElement("span");
    labelWrap.className = "cdl-journey__label-wrap";

    const label = document.createElement("span");
    label.className = "cdl-journey__label";
    label.textContent = stop.plain;

    const hint = document.createElement("span");
    hint.className = "cdl-journey__hint";
    hint.textContent = stop.helper;

    labelWrap.append(label, hint);

    // Visually hidden status for screen readers, e.g. "step 2 of 6, in progress"
    const sr = document.createElement("span");
    sr.className = "cdl-sr-only";
    sr.textContent = ` Step ${idx + 1} of ${JOURNEY.length}, ${
      isActive ? "in progress" : isDone ? "done" : "not started"
    }.`;

    link.append(num, labelWrap, sr);
    li.append(link);
    ol.append(li);
  });

  wrap.append(ol);
  mount.append(wrap);
}

/** Look up the plain-language label for a stage key. */
export function plainLabelFor(stageKey) {
  return JOURNEY.find((s) => s.key === stageKey)?.plain || stageKey;
}
