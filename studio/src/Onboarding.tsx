/**
 * Code Defense Lab — landing-page onboarding video.
 *
 * 30 seconds @ 30fps = 900 frames. One MP4 rendered to
 * ../public/videos/onboarding.mp4 by `npm run render`.
 *
 * Composition timeline:
 *   0 –  90  Title:   "AI use is allowed. Understanding is required."
 *  90 – 750  Six checkpoint slides @ 110 frames (~3.7s) each
 * 750 – 900  Outro:   "Ready to defend?"
 */

import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const ONBOARDING_FPS = 30;
export const ONBOARDING_DURATION_FRAMES = 900;

const STEPS = [
  { num: "1", label: "Submit",  helper: "Paste the code you want to defend",        accent: "#38bdf8" },
  { num: "2", label: "Explain", helper: "Explain the lines that matter most",       accent: "#a78bfa" },
  { num: "3", label: "Predict", helper: "Predict what the code will do",            accent: "#34d399" },
  { num: "4", label: "Adapt",   helper: "Change the code for a new situation",      accent: "#fbbf24" },
  { num: "5", label: "Fix",     helper: "Diagnose and repair a broken version",     accent: "#f87171" },
  { num: "6", label: "Reflect", helper: "See where understanding lined up",         accent: "#22d3ee" },
] as const;

const TITLE_DURATION = 90;
const STEP_DURATION = 110;
const OUTRO_DURATION = 60;

export const Onboarding: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0b1220", fontFamily: "Inter, system-ui, sans-serif" }}>
      <Backdrop />

      <Sequence from={0} durationInFrames={TITLE_DURATION}>
        <TitleSlide />
      </Sequence>

      {STEPS.map((step, i) => (
        <Sequence
          key={step.num}
          from={TITLE_DURATION + i * STEP_DURATION}
          durationInFrames={STEP_DURATION}
        >
          <CheckpointSlide step={step} index={i} />
        </Sequence>
      ))}

      <Sequence from={TITLE_DURATION + STEPS.length * STEP_DURATION} durationInFrames={OUTRO_DURATION}>
        <OutroSlide />
      </Sequence>

      <Watermark />
    </AbsoluteFill>
  );
};

// -- Backdrop -----------------------------------------------------------------

const Backdrop: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(60% 60% at 50% 40%, rgba(56, 189, 248, 0.08) 0%, rgba(11, 18, 32, 0) 60%)",
      }}
    />
  );
};

// -- Title --------------------------------------------------------------------

const TitleSlide: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fade = spring({ frame, fps, config: { damping: 200 } });
  const liftY = interpolate(fade, [0, 1], [24, 0]);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity: fade,
        transform: `translateY(${liftY}px)`,
        textAlign: "center",
        padding: 64,
      }}
    >
      <div
        style={{
          fontFamily: "JetBrains Mono, ui-monospace, monospace",
          fontSize: 24,
          letterSpacing: "0.32em",
          textTransform: "uppercase",
          color: "#7dd3fc",
          marginBottom: 28,
        }}
      >
        Code Defense Lab
      </div>
      <h1
        style={{
          fontFamily: "Space Grotesk, Inter, sans-serif",
          fontSize: 96,
          fontWeight: 700,
          color: "#f8fafc",
          margin: 0,
          letterSpacing: "-0.02em",
          lineHeight: 1.1,
          maxWidth: 1500,
        }}
      >
        AI use is allowed.
        <br />
        <span style={{ color: "#38bdf8" }}>Understanding is required.</span>
      </h1>
      <p
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: 32,
          color: "#cbd5e1",
          marginTop: 36,
          maxWidth: 1200,
          lineHeight: 1.4,
        }}
      >
        Six short checkpoints help students defend the code they submit — even when AI helped write it.
      </p>
    </AbsoluteFill>
  );
};

// -- Checkpoint slide ---------------------------------------------------------

type Step = (typeof STEPS)[number];

const CheckpointSlide: React.FC<{ step: Step; index: number }> = ({ step, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 18 } });
  const slideX = interpolate(enter, [0, 1], [-60, 0]);
  const opacity = interpolate(enter, [0, 1], [0, 1]);

  return (
    <AbsoluteFill style={{ padding: "120px 140px", justifyContent: "center" }}>
      <ProgressDots active={index + 1} />

      <div style={{ display: "flex", alignItems: "center", gap: 64, transform: `translateX(${slideX}px)`, opacity }}>
        <div
          style={{
            width: 220,
            height: 220,
            borderRadius: "50%",
            background: step.accent,
            color: "#0b1220",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "JetBrains Mono, ui-monospace, monospace",
            fontWeight: 800,
            fontSize: 140,
            boxShadow: `0 12px 60px ${step.accent}55`,
            flexShrink: 0,
          }}
        >
          {step.num}
        </div>

        <div style={{ flex: 1 }}>
          <div
            style={{
              fontFamily: "JetBrains Mono, ui-monospace, monospace",
              fontSize: 22,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: "#94a3b8",
              marginBottom: 12,
            }}
          >
            Step {step.num} of 6
          </div>
          <div
            style={{
              fontFamily: "Space Grotesk, Inter, sans-serif",
              fontSize: 132,
              fontWeight: 700,
              color: "#f8fafc",
              letterSpacing: "-0.02em",
              lineHeight: 1,
              marginBottom: 28,
            }}
          >
            {step.label}
          </div>
          <div
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 38,
              color: "#cbd5e1",
              lineHeight: 1.4,
              maxWidth: 1100,
            }}
          >
            {step.helper}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// -- Progress dots (the journey strip in miniature) ---------------------------

const ProgressDots: React.FC<{ active: number }> = ({ active }) => {
  return (
    <div
      style={{
        position: "absolute",
        top: 88,
        left: 140,
        right: 140,
        display: "flex",
        gap: 14,
      }}
    >
      {STEPS.map((s, i) => {
        const isActive = i + 1 === active;
        const isDone = i + 1 < active;
        return (
          <div
            key={s.num}
            style={{
              flex: 1,
              height: 6,
              borderRadius: 999,
              background: isActive
                ? s.accent
                : isDone
                  ? "rgba(248, 250, 252, 0.45)"
                  : "rgba(148, 163, 184, 0.18)",
              transition: "background 200ms ease",
            }}
          />
        );
      })}
    </div>
  );
};

// -- Outro --------------------------------------------------------------------

const OutroSlide: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 200 } });
  const opacity = interpolate(enter, [0, 1], [0, 1]);

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity, textAlign: "center" }}>
      <h2
        style={{
          fontFamily: "Space Grotesk, Inter, sans-serif",
          fontSize: 120,
          fontWeight: 700,
          color: "#f8fafc",
          margin: 0,
          letterSpacing: "-0.02em",
        }}
      >
        Ready to defend?
      </h2>
      <p
        style={{
          fontFamily: "JetBrains Mono, ui-monospace, monospace",
          fontSize: 28,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "#7dd3fc",
          marginTop: 32,
        }}
      >
        github.com/Educatian/code-defense-lab-mvp
      </p>
    </AbsoluteFill>
  );
};

// -- Watermark ----------------------------------------------------------------

const Watermark: React.FC = () => {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 48,
        right: 64,
        fontFamily: "JetBrains Mono, ui-monospace, monospace",
        fontSize: 18,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: "rgba(148, 163, 184, 0.55)",
      }}
    >
      Code Defense Lab
    </div>
  );
};
