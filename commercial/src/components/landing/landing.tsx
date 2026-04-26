"use client";

import { useEffect, useRef, useState } from "react";

type Role = "prof" | "learner";
type Lang = "py" | "r";

// ─────────────────────────────────────────────────────────────────
// Sample homework code — Python + R. Code Defense Lab teaches Python and R only.
// ─────────────────────────────────────────────────────────────────
type HotspotOption = { id: string; text: string };
type Hotspot = {
  line: number;
  label: string;
  prompt: string;
  correct: string;
  options: HotspotOption[];
};
type CodeRow = { n: number; t: string; hotspot?: string };
type Sample = {
  label: string;
  file: string;
  sibling: string;
  code: CodeRow[];
  hotspots: Record<string, Hotspot>;
};

const SAMPLES: Record<Lang, Sample> = {
  py: {
    label: "PYTHON",
    file: "anomaly.py",
    sibling: "test_anomaly.py",
    code: [
      { n: 1, t: "def find_anomalies(series, window=7):" },
      { n: 2, t: '    """Return indices where rolling z-score > 2.5."""' },
      { n: 3, t: "    out = []" },
      { n: 4, t: "    for i in range(window, len(series)):" },
      { n: 5, t: "        w = series[i-window:i]", hotspot: "h1" },
      { n: 6, t: "        mu = sum(w) / window" },
      { n: 7, t: "        sd = (sum((x-mu)**2 for x in w) / window) ** 0.5", hotspot: "h2" },
      { n: 8, t: "        if sd == 0:" },
      { n: 9, t: "            continue" },
      { n: 10, t: "        z = (series[i] - mu) / sd", hotspot: "h3" },
      { n: 11, t: "        if abs(z) > 2.5:" },
      { n: 12, t: "            out.append(i)" },
      { n: 13, t: "    return out" },
    ],
    hotspots: {
      h1: {
        line: 5,
        label: "Window slice",
        prompt: "Why does the slice end at i (exclusive) instead of i+1?",
        correct: "exclude_current",
        options: [
          { id: "exclude_current", text: "To exclude the point being tested from its own baseline." },
          { id: "speed", text: "Slicing with i+1 would be slower." },
          { id: "off_by_one", text: "It's an off-by-one bug — should be i+1." },
        ],
      },
      h2: {
        line: 7,
        label: "Std deviation",
        prompt: "This computes the population std (÷ window). What changes if you switch to sample std (÷ window-1)?",
        correct: "wider",
        options: [
          { id: "wider", text: "z-scores shrink slightly — fewer points cross 2.5 in small windows." },
          { id: "same", text: "Nothing meaningful changes for any window size." },
          { id: "broken", text: "It would raise ZeroDivisionError on most inputs." },
        ],
      },
      h3: {
        line: 10,
        label: "Z-score test",
        prompt: "Will this flag a sudden flat-line (constant value) as an anomaly?",
        correct: "no",
        options: [
          { id: "no", text: "No — constant input gives sd=0 and the loop continues." },
          { id: "yes", text: "Yes — a flat-line is the textbook anomaly case." },
          { id: "depends", text: "Only if the flat value is far from zero." },
        ],
      },
    },
  },
  r: {
    label: "R",
    file: "anomaly.R",
    sibling: "test_anomaly.R",
    code: [
      { n: 1, t: "find_anomalies <- function(series, window = 7) {" },
      { n: 2, t: "  # Return indices where rolling z-score > 2.5" },
      { n: 3, t: "  out <- integer(0)" },
      { n: 4, t: "  for (i in (window + 1):length(series)) {" },
      { n: 5, t: "    w  <- series[(i - window):(i - 1)]", hotspot: "h1" },
      { n: 6, t: "    mu <- mean(w)" },
      { n: 7, t: "    sd <- sd(w)", hotspot: "h2" },
      { n: 8, t: "    if (is.na(sd) || sd == 0) next" },
      { n: 9, t: "    z  <- (series[i] - mu) / sd", hotspot: "h3" },
      { n: 10, t: "    if (abs(z) > 2.5) {" },
      { n: 11, t: "      out <- c(out, i)" },
      { n: 12, t: "    }" },
      { n: 13, t: "  }" },
      { n: 14, t: "  out" },
      { n: 15, t: "}" },
    ],
    hotspots: {
      h1: {
        line: 5,
        label: "Window slice",
        prompt: "Why is the slice (i - window):(i - 1) instead of (i - window):i?",
        correct: "exclude_current",
        options: [
          { id: "exclude_current", text: "To exclude the point being tested from its own baseline window." },
          { id: "r_indexing", text: "R is 1-indexed — the form (i - window):i would crash." },
          { id: "off_by_one", text: "It's an off-by-one bug — should include i." },
        ],
      },
      h2: {
        line: 7,
        label: "sd() in R",
        prompt: "Base R's sd() uses n - 1 (sample std). What does this imply versus a population std?",
        correct: "smaller_z",
        options: [
          { id: "smaller_z", text: "sd is slightly larger, so |z| is slightly smaller — fewer points exceed 2.5 in small windows." },
          { id: "identical", text: "Nothing — sd() and population std return the same value." },
          { id: "errors", text: "sd() throws on numeric vectors of length < 30." },
        ],
      },
      h3: {
        line: 9,
        label: "NA handling",
        prompt: "What happens if series contains an NA inside the rolling window?",
        correct: "na_propagates",
        options: [
          { id: "na_propagates", text: "mean(w) and sd(w) return NA, the next() guard skips that index." },
          { id: "silent_skip", text: "Base R silently drops NAs from mean/sd by default." },
          { id: "crash", text: "It raises an error and aborts the loop." },
        ],
      },
    },
  },
};

// ─────────────────────────────────────────────────────────────────
// Syntax-highlight a single line of Python or R
// ─────────────────────────────────────────────────────────────────
function highlightCode(line: string, lang: Lang): string {
  const kwSet = lang === "r"
    ? /\b(function|for|in|if|else|next|return|TRUE|FALSE|NA|NULL|c|mean|sd|length|integer|is\.na|abs)\b/g
    : /\b(def|return|for|in|if|continue|range|len|sum|abs|True|False|None)\b/g;
  const strings = /(""".*?"""|".*?"|'.*?')/g;
  const numbers = /\b(\d+(\.\d+)?)\b/g;
  const comments = /(#.*)$/g;
  let rest = line;
  const cm = rest.match(comments);
  let comment = "";
  if (cm) {
    const idx = rest.indexOf(cm[0]);
    comment = rest.slice(idx);
    rest = rest.slice(0, idx);
  }
  const stringMap: string[] = [];
  rest = rest.replace(strings, (m) => {
    stringMap.push(m);
    return `S${stringMap.length - 1}`;
  });
  let html = rest
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(kwSet, '<span class="tok-kw">$1</span>')
    .replace(numbers, '<span class="tok-num">$1</span>');
  if (lang === "r") {
    html = html.replace(/&lt;-/g, '<span class="tok-op">&lt;-</span>');
  }
  html = html.replace(/S(\d+)/g, (_, i) => `<span class="tok-str">${stringMap[+i]}</span>`);
  if (comment) html += `<span class="tok-cm">${comment}</span>`;
  return html;
}

// ─────────────────────────────────────────────────────────────────
// Animated Walkthrough — auto-plays the full pipeline
// ─────────────────────────────────────────────────────────────────
type WalkStep = { id: number; label: string; title: string; body: string; duration: number };
const WALK_STEPS: WalkStep[] = [
  {
    id: 1,
    label: "Submit",
    title: "Student pastes AI-assisted code",
    body: "The submission ships with provenance — Was this written by you, by AI, or co-edited? — so the assessment can adapt.",
    duration: 4200,
  },
  {
    id: 2,
    label: "Hotspot",
    title: "System maps fragile lines",
    body: "Three hotspots get pinned: the slice boundary, the std-dev choice, and the z-score test. Each one becomes a checkpoint.",
    duration: 4400,
  },
  {
    id: 3,
    label: "Trace",
    title: "Learner predicts variable values",
    body: "Before running the code, the learner walks through one iteration of the loop and types what mu, sd, and z should be.",
    duration: 4600,
  },
  {
    id: 4,
    label: "Mutate",
    title: "Adapt to a new spec",
    body: "What if the threshold drops to 1.8? What if the window shrinks? Small mutations test whether the model in the head was real.",
    duration: 4400,
  },
  {
    id: 5,
    label: "Repair",
    title: "A seeded bug appears",
    body: "The system swaps one line for a buggy variant and asks the learner to find and fix it — without help.",
    duration: 4600,
  },
  {
    id: 6,
    label: "Review",
    title: "Professor sees a consistency map",
    body: "Strong correctness paired with weak trace? That's flagged. The professor reviews evidence side by side, not just a single score.",
    duration: 4400,
  },
];

function Walkthrough() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef(0);

  useEffect(() => {
    if (!playing) {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      return;
    }
    startRef.current = performance.now();
    const tick = (t: number) => {
      const dur = WALK_STEPS[step].duration;
      const p = (t - startRef.current) / dur;
      if (p >= 1) {
        setStep((s) => (s + 1) % WALK_STEPS.length);
        setProgress(0);
        return;
      }
      setProgress(p);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [step, playing]);

  function jump(i: number) {
    setStep(i);
    setProgress(0);
    startRef.current = performance.now();
  }

  const cur = WALK_STEPS[step];

  return (
    <section className="walk">
      <div className="walk-head">
        <div className="walk-head-left">
          <div className="eyebrow"><span className="eye-bar" />SEE IT IN ACTION</div>
          <h2 className="walk-title">A 90-second tour of one defense.</h2>
          <p className="walk-sub">
            Watch a single homework move through every checkpoint. Click any step to jump in. Or play the demo below and try it yourself.
          </p>
        </div>
        <div className="walk-controls">
          <button className="walk-play" onClick={() => setPlaying((p) => !p)} aria-label={playing ? "Pause" : "Play"}>
            {playing ? (
              <svg width="14" height="14" viewBox="0 0 14 14"><rect x="3" y="2" width="3" height="10" fill="currentColor"/><rect x="8" y="2" width="3" height="10" fill="currentColor"/></svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 14 14"><path d="M3 2 L11 7 L3 12 Z" fill="currentColor"/></svg>
            )}
            {playing ? "Pause" : "Play"}
          </button>
          <span className="walk-step-count">Step {step + 1} of {WALK_STEPS.length}</span>
        </div>
      </div>

      <div className="walk-rail">
        {WALK_STEPS.map((s, i) => {
          const isActive = i === step;
          const isPast = i < step;
          return (
            <button key={s.id} className={`wr-step ${isActive ? "active" : ""} ${isPast ? "past" : ""}`} onClick={() => jump(i)}>
              <span className="wr-num">{String(s.id).padStart(2, "0")}</span>
              <span className="wr-label">{s.label}</span>
              {isActive && (
                <span className="wr-bar"><span className="wr-bar-fill" style={{ transform: `scaleX(${progress})` }} /></span>
              )}
            </button>
          );
        })}
      </div>

      <div className="walk-stage">
        <div className="walk-canvas">
          <WalkScene step={step} progress={progress} />
        </div>
        <div className="walk-copy">
          <div className="wc-eyebrow">STEP {String(cur.id).padStart(2, "0")} · {cur.label.toUpperCase()}</div>
          <h3 className="wc-title">{cur.title}</h3>
          <p className="wc-body">{cur.body}</p>
          <div className="wc-meta">
            <span className="wc-meta-dot" />
            <span>auto-advancing in {Math.max(0, ((cur.duration / 1000) * (1 - progress))).toFixed(1)}s</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function WalkScene({ step, progress }: { step: number; progress: number }) {
  if (step === 0) {
    const fullCode = "def find_anomalies(series, window=7):\n    out = []\n    for i in range(window, len(series)):\n        w = series[i-window:i]\n        mu = sum(w) / window\n        sd = (sum((x-mu)**2 for x in w)/window)**0.5\n        if sd == 0: continue\n        z = (series[i] - mu) / sd\n        if abs(z) > 2.5:\n            out.append(i)\n    return out";
    const chars = Math.floor(fullCode.length * Math.min(1, progress * 1.4));
    const shown = fullCode.slice(0, chars);
    return (
      <div className="ws ws-submit">
        <div className="ws-window">
          <div className="ws-titlebar">
            <span className="ws-dot r" /><span className="ws-dot y" /><span className="ws-dot g" />
            <span className="ws-filename">anomaly.py</span>
            <span className="ws-prov">PROVENANCE: AI-ASSISTED</span>
          </div>
          <pre className="ws-code">{shown}<span className="ws-caret">▍</span></pre>
        </div>
        <div className="ws-submit-bar">
          <span className="ws-submit-label">Submit homework</span>
          <span className="ws-submit-fill" style={{ width: `${Math.min(100, progress * 110)}%` }} />
        </div>
      </div>
    );
  }
  if (step === 1) {
    const lines = [
      "for i in range(window, len(series)):",
      "    w = series[i-window:i]",
      "    mu = sum(w) / window",
      "    sd = (sum((x-mu)**2 for x in w)/window)**0.5",
      "    if sd == 0: continue",
      "    z = (series[i] - mu) / sd",
      "    if abs(z) > 2.5:",
    ];
    const pins = [
      { line: 1, n: 1, t: 0.15 },
      { line: 3, n: 2, t: 0.45 },
      { line: 5, n: 3, t: 0.75 },
    ];
    return (
      <div className="ws ws-hotspot">
        <div className="ws-window">
          <div className="ws-titlebar">
            <span className="ws-dot r" /><span className="ws-dot y" /><span className="ws-dot g" />
            <span className="ws-filename">anomaly.py · 3 hotspots detected</span>
          </div>
          <div className="ws-codelines">
            {lines.map((l, i) => {
              const pin = pins.find((p) => p.line === i);
              const visible = !!(pin && progress >= pin.t);
              return (
                <div key={i} className={`ws-codeline ${visible ? "is-pinned" : ""}`}>
                  <span className="ws-ln">{i + 4}</span>
                  <span className="ws-lc">{l}</span>
                  {pin && <span className={`ws-pin ${visible ? "drop" : ""}`}>{pin.n}</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
  if (step === 2) {
    const traceVars = [
      { name: "i", val: "10", reveal: 0.20, expected: "10" },
      { name: "w", val: "[3,5,7,4,6,5,4]", reveal: 0.35, expected: "[3,5,7,4,6,5,4]" },
      { name: "mu", val: "4.857", reveal: 0.55, expected: "4.857" },
      { name: "sd", val: "1.345", reveal: 0.72, expected: "1.345" },
      { name: "z", val: "5.31", reveal: 0.88, expected: "5.31", flag: true },
    ];
    return (
      <div className="ws ws-trace">
        <div className="ws-trace-header">
          <span className="ws-trace-eyebrow">PREDICT THE VALUES — ITERATION i = 10</span>
          <span className="ws-trace-input">series = [2,4,3,5,4,6,5,4,7,3, <strong>12</strong>]</span>
        </div>
        <div className="ws-trace-table">
          {traceVars.map((v) => {
            const shown = progress >= v.reveal;
            return (
              <div key={v.name} className={`ws-trace-row ${shown ? "filled" : ""} ${v.flag && shown ? "is-flag" : ""}`}>
                <span className="ws-trace-var">{v.name}</span>
                <span className="ws-trace-eq">=</span>
                <span className="ws-trace-val">
                  {shown ? v.val : <span className="ws-trace-placeholder">??</span>}
                </span>
                {shown && <span className="ws-trace-tick">{v.flag ? "ANOMALY" : "✓"}</span>}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  if (step === 3) {
    const t = 2.5 - 0.7 * Math.min(1, progress);
    const dataset = [2.1, 1.4, 3.2, 5.3, 1.9, 0.8, 2.6, 4.1, 1.5, 3.8];
    return (
      <div className="ws ws-mutate">
        <div className="ws-mutate-prompt">
          <span className="ws-trace-eyebrow">MUTATION · IF THRESHOLD CHANGES</span>
          <div className="ws-mutate-spec">
            <span>abs(z) &gt; </span>
            <span className="ws-mutate-num">{t.toFixed(2)}</span>
          </div>
        </div>
        <div className="ws-mutate-bars">
          {dataset.map((v, i) => {
            const flagged = v > t;
            return (
              <div key={i} className={`ws-mutate-bar ${flagged ? "flag" : ""}`}>
                <div className="ws-mutate-fill" style={{ height: `${Math.min(100, v * 18)}%` }} />
                <div className="ws-mutate-z">{v.toFixed(1)}</div>
              </div>
            );
          })}
          <div className="ws-mutate-line" style={{ bottom: `${Math.min(96, t * 18)}%` }}>
            <span className="ws-mutate-line-label">z = {t.toFixed(2)}</span>
          </div>
        </div>
        <div className="ws-mutate-counter">
          <span className="ws-trace-tick">{dataset.filter((v) => v > t).length} anomalies flagged</span>
        </div>
      </div>
    );
  }
  if (step === 4) {
    const phase = progress < 0.55 ? "bug" : "fix";
    return (
      <div className="ws ws-repair">
        <div className="ws-window">
          <div className="ws-titlebar">
            <span className="ws-dot r" /><span className="ws-dot y" /><span className="ws-dot g" />
            <span className="ws-filename">anomaly.py · seeded bug</span>
            <span className={`ws-repair-status ${phase}`}>
              {phase === "bug" ? "● BUG INTRODUCED" : "✓ LEARNER FIX"}
            </span>
          </div>
          <div className="ws-codelines">
            <div className="ws-codeline"><span className="ws-ln">4</span><span className="ws-lc">for i in range(window, len(series)):</span></div>
            <div className={`ws-codeline ${phase === "bug" ? "is-bug" : "is-fixed"}`}>
              <span className="ws-ln">5</span>
              <span className="ws-lc">
                {phase === "bug" ? (
                  <>    w = series[i-window:i<span className="ws-bug-glyph">+1</span>]</>
                ) : (
                  <>    w = series[i-window:i]</>
                )}
              </span>
              <span className="ws-codeline-pill">{phase === "bug" ? "WHY IS THIS WRONG?" : "FIXED — INDEX EXCLUDES SELF"}</span>
            </div>
            <div className="ws-codeline"><span className="ws-ln">6</span><span className="ws-lc">    mu = sum(w) / window</span></div>
            <div className="ws-codeline"><span className="ws-ln">7</span><span className="ws-lc">    sd = (sum((x-mu)**2 for x in w)/window)**0.5</span></div>
          </div>
        </div>
        <div className="ws-repair-explain">
          <span className="ws-trace-eyebrow">LEARNER EXPLANATION</span>
          <div className="ws-repair-text">
            {phase === "bug"
              ? <span className="ws-typing">Including the current point in its own baseline biases the mean toward zero…<span className="ws-caret">▍</span></span>
              : <span>Including the current point in its own baseline biases the mean toward zero, which suppresses the z-score of real anomalies. Slice must end at <code>i</code>, exclusive.</span>}
          </div>
        </div>
      </div>
    );
  }
  if (step === 5) {
    const students = ["j.alvarez", "k.tanaka", "m.okafor", "s.park", "r.bauer", "l.cheng", "d.silva", "a.morel", "t.huang", "n.gomes"];
    const seed = (i: number, j: number) => ((i * 7 + j * 13 + 11) % 17) / 17;
    const cols = ["Correct", "Hotspot", "Trace", "Mutate", "Repair"];
    return (
      <div className="ws ws-review">
        <div className="ws-review-header">
          <span className="ws-trace-eyebrow">CONSISTENCY MAP · CS 210 · HW-04</span>
          <span className="ws-review-flag">2 inconsistencies flagged</span>
        </div>
        <div className="ws-review-table">
          <div className="ws-review-cols">
            <span />
            {cols.map((c) => <span key={c} className="ws-review-col">{c}</span>)}
          </div>
          {students.map((s, i) => (
            <div key={s} className="ws-review-row">
              <span className="ws-review-name">{s}</span>
              {cols.map((_, j) => {
                const v = seed(i, j);
                const cellOn = progress > 0.05 + (i * 0.06);
                const flag = i === 1 && j === 2;
                const flag2 = i === 7 && j === 4;
                const isFlag = (flag || flag2) && cellOn;
                let bg: string;
                if (!cellOn) bg = "transparent";
                else if (isFlag) bg = "var(--cdl-red)";
                else if (v > 0.7) bg = "var(--cdl-blue-60)";
                else if (v > 0.4) bg = "var(--cdl-blue-40)";
                else bg = "var(--cdl-blue-20)";
                return (
                  <span
                    key={j}
                    className={`ws-review-cell ${cellOn ? "on" : ""} ${isFlag ? "flag" : ""}`}
                    style={{ background: bg, transitionDelay: `${i * 30}ms` }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────
// Top nav
// ─────────────────────────────────────────────────────────────────
function TopNav({ role, setRole }: { role: Role; setRole: (r: Role) => void }) {
  return (
    <header className="nav">
      <div className="nav-left">
        <div className="brand-mark">CD</div>
        <div className="brand-text">
          <div className="brand-name">Code Defense Lab</div>
          <div className="brand-tag">AI use is allowed. Understanding is required.</div>
        </div>
      </div>
      <nav className="nav-right">
        <a href="#workspace" className={`nav-link ${role === "prof" ? "active" : ""}`} onClick={(e) => { e.preventDefault(); setRole("prof"); }}>
          Professor Workspace
        </a>
        <a href="#workspace" className={`nav-link ${role === "learner" ? "active" : ""}`} onClick={(e) => { e.preventDefault(); setRole("learner"); }}>
          Student Workspace
        </a>
        <a href="#results" className="nav-link">Results</a>
        <a href="#" className="nav-link nav-search" aria-label="Search">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/icons/search.svg" width={16} height={16} alt="" />
        </a>
      </nav>
    </header>
  );
}

// ─────────────────────────────────────────────────────────────────
// Live Defense Demo — the centerpiece interactive module
// ─────────────────────────────────────────────────────────────────
function DefenseDemo() {
  const [lang, setLang] = useState<Lang>("py");
  const sample = SAMPLES[lang];
  const HOTSPOTS = sample.hotspots;
  const [activeHot, setActiveHot] = useState("h1");
  const [answered, setAnswered] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setActiveHot("h1");
    setAnswered({});
    setRevealed({});
  }, [lang]);

  const hot = HOTSPOTS[activeHot];
  const picked = answered[activeHot];
  const isCorrect = picked === hot.correct;
  const allDone = Object.keys(HOTSPOTS).every((k) => revealed[k]);

  function pick(optId: string) {
    setAnswered({ ...answered, [activeHot]: optId });
  }
  function submit() {
    if (!picked) return;
    setRevealed({ ...revealed, [activeHot]: true });
    setTimeout(() => {
      const next = Object.keys(HOTSPOTS).find((k) => !revealed[k] && k !== activeHot);
      if (next) setActiveHot(next);
    }, 900);
  }
  function reset() {
    setAnswered({});
    setRevealed({});
    setActiveHot("h1");
  }

  const score = Object.entries(answered).filter(([k, v]) => revealed[k] && v === HOTSPOTS[k].correct).length;
  const total = Object.keys(HOTSPOTS).length;

  return (
    <section className="defense">
      <div className="defense-langbar">
        <span className="eyebrow-tiny">SUPPORTED LANGUAGES — PYTHON · R</span>
        <div className="lang-switch" role="tablist">
          <button role="tab" aria-selected={lang === "py"} className={`lang-btn ${lang === "py" ? "active" : ""}`} onClick={() => setLang("py")}>
            <span className="lang-glyph">.py</span> Python
          </button>
          <button role="tab" aria-selected={lang === "r"} className={`lang-btn ${lang === "r" ? "active" : ""}`} onClick={() => setLang("r")}>
            <span className="lang-glyph">.R</span> R
          </button>
        </div>
      </div>
      <div className="defense-frame">
        <div className="code-pane">
          <div className="code-header">
            <div className="code-tabs">
              <span className="code-tab active">{sample.file}</span>
              <span className="code-tab">{sample.sibling}</span>
            </div>
            <div className="code-meta">
              <span className="badge badge-mono">{sample.label}</span>
              <span className="meta-sep">·</span>
              <span>HW-04 · Week 6</span>
            </div>
          </div>
          <div className="code-body">
            {sample.code.map((row) => {
              const isHotspot = !!row.hotspot;
              const isActive = row.hotspot === activeHot;
              const isRevealed = !!(row.hotspot && revealed[row.hotspot]);
              const wasCorrect = !!(row.hotspot && answered[row.hotspot] === HOTSPOTS[row.hotspot]?.correct);
              return (
                <div
                  key={row.n}
                  className={`code-row ${isHotspot ? "has-hotspot" : ""} ${isActive ? "is-active" : ""} ${isRevealed ? (wasCorrect ? "is-correct" : "is-wrong") : ""}`}
                  onClick={() => isHotspot && row.hotspot && setActiveHot(row.hotspot)}
                >
                  <span className="ln">{String(row.n).padStart(2, " ")}</span>
                  <span className="lc" dangerouslySetInnerHTML={{ __html: highlightCode(row.t, lang) }} />
                  {isHotspot && row.hotspot && (
                    <span className="hot-pin" aria-label={`hotspot ${row.hotspot}`}>
                      {isRevealed ? (wasCorrect ? "✓" : "✕") : Object.keys(HOTSPOTS).indexOf(row.hotspot) + 1}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          <div className="code-footer">
            <div className="status-dot" />
            <span>Tracing local var <span className="mono">w</span>, <span className="mono">mu</span>, <span className="mono">sd</span>, <span className="mono">z</span></span>
            <span className="footer-spacer" />
            <span className="score-pill">{score}/{total} defended</span>
          </div>
        </div>

        <div className="defense-pane">
          <div className="defense-header">
            <span className="eyebrow-tiny">DEFEND HOTSPOT {Object.keys(HOTSPOTS).indexOf(activeHot) + 1} · {sample.label}</span>
            <span className="defense-line">Line {hot.line} · {hot.label}</span>
          </div>

          <div className="defense-prompt">{hot.prompt}</div>

          <div className="defense-options">
            {hot.options.map((opt) => {
              const sel = picked === opt.id;
              const reveal = revealed[activeHot];
              const correct = opt.id === hot.correct;
              let cls = "opt";
              if (sel && !reveal) cls += " sel";
              if (reveal && correct) cls += " reveal-correct";
              if (reveal && sel && !correct) cls += " reveal-wrong";
              if (reveal && !correct && !sel) cls += " reveal-dim";
              return (
                <button key={opt.id} className={cls} disabled={revealed[activeHot]} onClick={() => pick(opt.id)}>
                  <span className="opt-radio" />
                  <span className="opt-text">{opt.text}</span>
                  {reveal && correct && <span className="opt-tag">CORRECT</span>}
                  {reveal && sel && !correct && <span className="opt-tag wrong">YOUR PICK</span>}
                </button>
              );
            })}
          </div>

          {revealed[activeHot] && (
            <div className={`feedback ${isCorrect ? "fb-ok" : "fb-no"}`}>
              <strong>{isCorrect ? "Defended." : "Not yet."}</strong>{" "}
              {isCorrect
                ? "Your reasoning matches the trace. Moving to the next hotspot."
                : "Re-trace the variable through the loop and try the next hotspot."}
            </div>
          )}

          <div className="defense-actions">
            {!revealed[activeHot] ? (
              <button className="btn-primary" disabled={!picked} onClick={submit}>
                Submit defense
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/assets/icons/arrow-right.svg" width={16} height={16} alt="" />
              </button>
            ) : allDone ? (
              <button className="btn-primary" onClick={reset}>
                Restart trace
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/assets/icons/restart.svg" width={16} height={16} alt="" />
              </button>
            ) : (
              <button className="btn-primary" onClick={() => {
                const next = Object.keys(HOTSPOTS).find((k) => !revealed[k]);
                if (next) setActiveHot(next);
              }}>
                Next hotspot
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/assets/icons/arrow-right.svg" width={16} height={16} alt="" />
              </button>
            )}
            <button className="btn-ghost" onClick={reset}>Reset</button>
          </div>

          <div className="defense-meter">
            {Object.keys(HOTSPOTS).map((k, i) => (
              <span
                key={k}
                className={`meter-cell ${k === activeHot ? "is-active" : ""} ${revealed[k] ? (answered[k] === HOTSPOTS[k].correct ? "is-correct" : "is-wrong") : ""}`}
                onClick={() => setActiveHot(k)}
              >
                {i + 1}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────
// Hero
// ─────────────────────────────────────────────────────────────────
function Hero({ role, setRole }: { role: Role; setRole: (r: Role) => void }) {
  return (
    <section className="hero">
      <div className="hero-left">
        <div className="eyebrow">
          <span className="eye-bar" />
          AI-ERA ASSESSMENT
        </div>
        <h1 className="hero-title">
          Assess <em>understanding,</em><br />not just code output.
        </h1>
        <p className="hero-body">
          Code Defense Lab helps instructors evaluate whether learners can <strong>explain, trace, adapt, and repair</strong> AI-assisted code in <strong>Python and R</strong>. Professors launch course-based assessments. Learners enter a specific homework and defend the logic — step by step.
        </p>

        <div className="role-switch" role="tablist" aria-label="Role">
          <button role="tab" aria-selected={role === "prof"} className={`role-btn ${role === "prof" ? "active" : ""}`} onClick={() => setRole("prof")}>
            <span className="role-dot" />
            I&apos;m a Professor
          </button>
          <button role="tab" aria-selected={role === "learner"} className={`role-btn ${role === "learner" ? "active" : ""}`} onClick={() => setRole("learner")}>
            <span className="role-dot" />
            I&apos;m a Student
          </button>
        </div>

        <div className="hero-actions">
          <button className="btn-primary btn-lg">
            {role === "prof" ? "Enter professor workspace" : "Enter student workspace"}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/icons/arrow-right.svg" width={16} height={16} alt="" />
          </button>
          <button className="btn-ghost btn-lg">See a sample defense</button>
        </div>

        <div className="hero-stats">
          <Stat n={2841} label="Defenses today" />
          <Stat n={186} label="Active courses" />
          <Stat n={94} label="Avg. minutes / submission" suffix="m" small />
        </div>
      </div>

      <div className="hero-right">
        <RoleCards role={role} setRole={setRole} />
      </div>
    </section>
  );
}

function Stat({ n, label, suffix, small }: { n: number; label: string; suffix?: string; small?: boolean }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const dur = 900;
    const from = 0;
    function step(t: number) {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(from + (n - from) * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [n]);
  return (
    <div className={`stat ${small ? "small" : ""}`}>
      <div className="stat-n">
        {val.toLocaleString()}
        {suffix && <span className="stat-suffix">{suffix}</span>}
      </div>
      <div className="stat-l">{label}</div>
    </div>
  );
}

function RoleCards({ role, setRole }: { role: Role; setRole: (r: Role) => void }) {
  const cards: Record<Role, { eyebrow: string; title: string; body: string; cta: string; meta: string[] }> = {
    prof: {
      eyebrow: "PROFESSOR",
      title: "Register courses and launch assignments",
      body: "Build a course space, attach homework, enable hotspot, trace, mutation, and repair, then review consistency by student.",
      cta: "Enter professor workspace →",
      meta: ["3 courses", "12 assignments", "284 submissions"],
    },
    learner: {
      eyebrow: "LEARNER",
      title: "Open a course and defend a homework",
      body: "See enrolled courses, choose the exact assignment, paste your code, and continue into explanation, trace, adaptation, and repair.",
      cta: "Enter student workspace →",
      meta: ["2 enrolled", "1 due Friday", "7 defenses logged"],
    },
  };
  const order: Role[] = role === "prof" ? ["prof", "learner"] : ["learner", "prof"];
  return (
    <div className="role-cards">
      {order.map((k) => {
        const c = cards[k];
        const active = k === role;
        return (
          <article key={k} className={`role-card ${active ? "active" : ""}`} onClick={() => setRole(k)}>
            <div className="rc-eyebrow">{c.eyebrow}</div>
            <h3 className="rc-title">{c.title}</h3>
            <p className="rc-body">{c.body}</p>
            <div className="rc-meta">
              {c.meta.map((m) => <span key={m} className="rc-chip">{m}</span>)}
            </div>
            <a href="#" className="rc-cta">{c.cta}</a>
            {active && <div className="rc-active-bar" />}
          </article>
        );
      })}
      <Pipeline />
    </div>
  );
}

const PIPELINE_STEPS = [
  { id: 1, fn: "choose_role()", desc: "Pick Professor or Student to enter the right workspace." },
  { id: 2, fn: "open_course()", desc: "Both roles start at the course list — never directly inside a task." },
  { id: 3, fn: "select_homework()", desc: "Choose the specific assignment to launch or defend." },
  { id: 4, fn: "submit_code()", desc: "Paste AI-assisted Python or R code. The system parses lines and locates hotspots." },
  { id: 5, fn: "explain_predict_adapt_repair()", desc: "Four-stage trace: explain logic, predict outputs, adapt to a new spec, repair a seeded bug." },
  { id: 6, fn: "review_consistency()", desc: "Professor reviews if explanations match traces — logs inconsistencies for follow-up." },
];

function Pipeline() {
  const [active, setActive] = useState(1);
  return (
    <div className="pipeline" role="tablist">
      <div className="pl-header">
        <span className="pl-prompt">$</span>
        <span className="pl-cmd">code-defense --pipeline</span>
        <span className="pl-cursor">▍</span>
      </div>
      <ol className="pl-list">
        {PIPELINE_STEPS.map((s) => {
          const isActive = s.id === active;
          return (
            <li key={s.id} className={`pl-row ${isActive ? "active" : ""}`}>
              <button
                className="pl-row-btn"
                onMouseEnter={() => setActive(s.id)}
                onFocus={() => setActive(s.id)}
                onClick={() => setActive(s.id)}
              >
                <span className="pl-num">{s.id}.</span>
                <span className="pl-fn">{s.fn}</span>
              </button>
              <div className="pl-desc-wrap" style={{ maxHeight: isActive ? 80 : 0 }}>
                <div className="pl-desc">{s.desc}</div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function HowItWorks() {
  const cards = [
    {
      eyebrow: "PROFESSOR JOURNEY",
      title: "Course creation before evaluation",
      body: "Professors begin from their dashboard, register a course, then attach assignments with the desired understanding checks.",
      bullets: ["Hotspot mapping", "Trace mode (Python & R)", "Mutation prompts", "Repair tasks"],
    },
    {
      eyebrow: "LEARNER JOURNEY",
      title: "Course first, homework second, code third",
      body: "Learners no longer land directly inside a task. They first see enrolled courses, then move into a specific homework, then paste their code.",
      bullets: ["Enrolled courses", "Homework brief", "Paste code", "Defend in 4 stages"],
    },
    {
      eyebrow: "ASSESSMENT LOGIC",
      title: "One pipeline, two role-specific entries",
      body: "The whole system is now easier to understand because instructor setup and learner execution each start from the right place.",
      bullets: ["Role gate", "Course → HW → code", "Inconsistency log", "Cohort heatmap"],
    },
  ];
  return (
    <section className="how">
      <div className="how-head">
        <div className="eyebrow"><span className="eye-bar" />HOW IT WORKS</div>
        <h2 className="how-title">A pipeline that doesn&apos;t skip the thinking.</h2>
      </div>
      <div className="how-grid">
        {cards.map((c) => (
          <article key={c.title} className="how-card">
            <div className="hc-eyebrow">{c.eyebrow}</div>
            <h3 className="hc-title">{c.title}</h3>
            <p className="hc-body">{c.body}</p>
            <ul className="hc-bullets">
              {c.bullets.map((b) => (
                <li key={b}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/assets/icons/checkmark.svg" width={16} height={16} alt="" />
                  {b}
                </li>
              ))}
            </ul>
            <a href="#" className="hc-cta">
              Read more
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/icons/arrow-right.svg" width={16} height={16} alt="" />
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}

const TICKER_INIT = [
  { t: "10:42:18", role: "STUDENT", msg: "j.alvarez defended HW-04 hotspot 2 — correct" },
  { t: "10:42:09", role: "PROFESSOR", msg: "Dr. Han attached HW-05 to CS 210" },
  { t: "10:41:51", role: "STUDENT", msg: "k.tanaka inconsistency flagged on HW-03" },
  { t: "10:41:33", role: "STUDENT", msg: "m.okafor completed repair stage in 4m 12s" },
  { t: "10:41:14", role: "PROFESSOR", msg: "Prof. Lin reviewed 18 submissions in DS 101" },
  { t: "10:40:58", role: "STUDENT", msg: "s.park trace mismatch on rolling window" },
];

function Ticker() {
  const [items, setItems] = useState(TICKER_INIT);
  useEffect(() => {
    const id = setInterval(() => {
      setItems((cur) => {
        const head = cur[0];
        const ts = new Date();
        const newT = ts.toTimeString().slice(0, 8);
        return [...cur.slice(1), { ...head, t: newT }];
      });
    }, 2400);
    return () => clearInterval(id);
  }, []);
  return (
    <section className="ticker">
      <div className="ticker-head">
        <div className="eyebrow"><span className="eye-bar" />LIVE ACTIVITY</div>
        <span className="ticker-pulse">
          <span className="pulse-dot" /> 12 sessions active right now
        </span>
      </div>
      <div className="ticker-list">
        {items.map((it, i) => (
          <div key={i} className="ticker-row">
            <span className="tk-time">{it.t}</span>
            <span className={`tk-role tk-${it.role.toLowerCase()}`}>{it.role}</span>
            <span className="tk-msg">{it.msg}</span>
            <span className="tk-arrow">›</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="cta">
      <div className="cta-grid">
        <div className="cta-left">
          <div className="eyebrow eyebrow-light"><span className="eye-bar light" />GET STARTED</div>
          <h2 className="cta-title">
            AI use is allowed.<br />Understanding is required.
          </h2>
          <p className="cta-body">
            Run your first defense in under five minutes. No accounts to provision — paste a single homework and walk a learner through the full four-stage trace.
          </p>
        </div>
        <div className="cta-right">
          <button className="btn-primary btn-lg btn-on-dark">
            Launch a sample course
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/icons/arrow-right.svg" width={16} height={16} alt="" />
          </button>
          <button className="btn-ghost btn-lg btn-ghost-on-dark">
            Read the assessment rubric
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/icons/launch.svg" width={16} height={16} alt="" />
          </button>
          <ul className="cta-checks">
            {/* eslint-disable @next/next/no-img-element */}
            <li><img src="/assets/icons/checkmark.svg" width={16} height={16} alt="" /> Built for Python and R coursework</li>
            <li><img src="/assets/icons/checkmark.svg" width={16} height={16} alt="" /> LMS export (Canvas, Moodle, Blackboard)</li>
            <li><img src="/assets/icons/checkmark.svg" width={16} height={16} alt="" /> Hosted by your institution or by us</li>
            {/* eslint-enable @next/next/no-img-element */}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="ft-left">
        <div className="brand-mark sm">CD</div>
        <span>Code Defense Lab · v0.4.2 · 2026</span>
      </div>
      <div className="ft-right">
        <a href="#">Docs</a>
        <a href="#">Rubric</a>
        <a href="#">Privacy</a>
        <a href="#">Status</a>
      </div>
    </footer>
  );
}

export default function Landing() {
  const [role, setRole] = useState<Role>("prof");
  return (
    <div className="page">
      <TopNav role={role} setRole={setRole} />
      <Hero role={role} setRole={setRole} />
      <Walkthrough />
      <DefenseDemo />
      <HowItWorks />
      <Ticker />
      <CTA />
      <Footer />
    </div>
  );
}
