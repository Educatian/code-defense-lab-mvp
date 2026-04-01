import "./shared.css";

const pageGroups = [
  {
    title: "Hubs",
    links: [
      { href: "/catalog.html", label: "Catalog" },
      { href: "/index.html", label: "Role Login Landing" },
      { href: "/pages/landing-page.html", label: "Landing" },
      { href: "/pages/landing-page-desktop.html", label: "Landing Desktop" },
    ],
  },
  {
    title: "Professor",
    links: [
      { href: "/pages/professor-dashboard.html", label: "Professor Dashboard" },
      { href: "/pages/professor-dashboard-desktop.html", label: "Professor Dashboard Desktop" },
      { href: "/pages/create-assignment.html", label: "Create Assignment" },
      { href: "/pages/professor-student-detail.html", label: "Professor Student Detail" },
    ],
  },
  {
    title: "Student Flow",
    links: [
      { href: "/pages/student-portal.html", label: "Student Portal" },
      { href: "/pages/student-submission.html", label: "Student Submission" },
      { href: "/pages/hotspot-questions.html", label: "Hotspot Questions" },
      { href: "/pages/trace-mode-task.html", label: "Trace Mode Task" },
      { href: "/pages/mutation-task.html", label: "Mutation Task" },
      { href: "/pages/repair-mode-task.html", label: "Repair Mode Task" },
      { href: "/pages/student-result.html", label: "Student Result" },
    ],
  },
];

const orderedFlow = [
  "/catalog.html",
  "/index.html",
  "/pages/landing-page.html",
  "/pages/professor-dashboard.html",
  "/pages/create-assignment.html",
  "/pages/student-portal.html",
  "/pages/student-submission.html",
  "/pages/hotspot-questions.html",
  "/pages/trace-mode-task.html",
  "/pages/mutation-task.html",
  "/pages/repair-mode-task.html",
  "/pages/student-result.html",
  "/pages/professor-student-detail.html",
  "/pages/professor-dashboard-desktop.html",
  "/pages/landing-page-desktop.html",
];

const pageMeta = {
  "/catalog.html": {
    stage: "Map",
    purpose: "Choose the view you want to inspect and understand how the whole experience is sequenced.",
    evidence: "UI coverage across professor and student states.",
    next: "Open the landing page or jump into the student path.",
  },
  "/index.html": {
    stage: "Role entry",
    purpose: "Start from a real landing page and choose whether you are entering as professor or learner.",
    evidence: "Clear mode split before the workflow begins.",
    next: "Professors go to course setup. Learners go to enrolled courses.",
  },
  "/pages/landing-page.html": {
    stage: "Orientation",
    purpose: "Frame the product as understanding-first, not anti-AI policing.",
    evidence: "Clear promise and mental model for both roles.",
    next: "Move into the professor or student workflow.",
  },
  "/pages/landing-page-desktop.html": {
    stage: "Orientation",
    purpose: "Present the same thesis with a more editorial desktop-first composition.",
    evidence: "Narrative framing plus product atmosphere.",
    next: "Move into professor oversight or student submission.",
  },
  "/pages/professor-dashboard.html": {
    stage: "Instructor signal",
    purpose: "Let instructors register courses and assignments before reviewing consistency, not just correctness.",
    evidence: "Course registry, assignment launch controls, and flagged students.",
    next: "Open the detailed builder or inspect a suspicious student.",
  },
  "/pages/professor-dashboard-desktop.html": {
    stage: "Instructor signal",
    purpose: "Offer a denser desktop control room for scanning the cohort quickly.",
    evidence: "Priority queue, anomaly scan, assignment context.",
    next: "Drill into student evidence or publish a new lab.",
  },
  "/pages/create-assignment.html": {
    stage: "Assessment design",
    purpose: "Configure the course context and the assignment so the learning checkpoints match the concept being taught.",
    evidence: "Course metadata, prompt, hidden tests, and enabled checkpoints.",
    next: "Publish and send learners into the course portal.",
  },
  "/pages/student-portal.html": {
    stage: "Learner orientation",
    purpose: "Let students start from enrolled courses and intentionally choose a homework before submitting code.",
    evidence: "Course context, assignment choice, and a draft workspace.",
    next: "Open a specific homework and submit the code to defend.",
  },
  "/pages/student-submission.html": {
    stage: "1. Commit",
    purpose: "Students submit code and declare provenance before deeper reasoning begins.",
    evidence: "Initial solution plus honesty about how it was produced.",
    next: "Explain the few lines that actually carry the logic.",
  },
  "/pages/hotspot-questions.html": {
    stage: "2. Explain",
    purpose: "Convert code ownership into explanation of critical decisions and edges.",
    evidence: "Line-level rationale and edge-case awareness.",
    next: "Trace execution without relying on runtime output.",
  },
  "/pages/trace-mode-task.html": {
    stage: "3. Predict",
    purpose: "Force mental simulation of state transitions before the machine confirms anything.",
    evidence: "State deltas, map contents, and final output prediction.",
    next: "Adapt the code when the task changes.",
  },
  "/pages/mutation-task.html": {
    stage: "4. Adapt",
    purpose: "Check whether the student can generalize the solution to a changed constraint.",
    evidence: "A concrete patch under a what-if scenario.",
    next: "Repair a broken sibling of the same logic.",
  },
  "/pages/repair-mode-task.html": {
    stage: "5. Repair",
    purpose: "Measure genuine code reading by making the student diagnose and fix a bug.",
    evidence: "Targeted correction and explanation of failure mode.",
    next: "Review the consistency report that compares all signals.",
  },
  "/pages/student-result.html": {
    stage: "6. Reflect",
    purpose: "Turn the pipeline into feedback about where understanding broke down.",
    evidence: "Consistency score and mismatch diagnosis.",
    next: "Hand off to instructor review or oral defense.",
  },
  "/pages/professor-student-detail.html": {
    stage: "Instructor review",
    purpose: "Help instructors verify whether low consistency is a teachable gap or an authenticity problem.",
    evidence: "Submission, trace failures, mutation failures, and oral-defense prompts.",
    next: "Return to the dashboard with a clear intervention decision.",
  },
};

function normalizePath(pathname) {
  if (!pathname || pathname === "/") return "/index.html";
  return pathname.endsWith("/") ? `${pathname}index.html` : pathname;
}

function findLabel(pathname) {
  for (const group of pageGroups) {
    for (const link of group.links) {
      if (link.href === pathname) return link.label;
    }
  }
  return pathname.split("/").pop() ?? "Page";
}

function getMeta(pathname) {
  return (
    pageMeta[pathname] ?? {
      stage: "Page",
      purpose: "Review the current screen in context of the wider assessment flow.",
      evidence: "UI-specific state and actions.",
      next: "Use the links below to move to the next mode.",
    }
  );
}

function renderLinks(currentPath) {
  return pageGroups
    .map(
      (group) => `
        <section class="cdl-shell-section">
          <h2>${group.title}</h2>
          <div class="cdl-shell-links">
            ${group.links
              .map((link) => {
                const isActive = link.href === currentPath ? "is-active" : "";
                return `
                  <a href="${link.href}" class="${isActive}">
                    <span>${link.label}</span>
                    <code>${link.href.replace("/", "") || "index.html"}</code>
                  </a>
                `;
              })
              .join("")}
          </div>
        </section>
      `
    )
    .join("");
}

function renderFlow(currentPath) {
  const currentIndex = orderedFlow.indexOf(currentPath);
  const prev = currentIndex > 0 ? orderedFlow[currentIndex - 1] : null;
  const next = currentIndex >= 0 && currentIndex < orderedFlow.length - 1 ? orderedFlow[currentIndex + 1] : null;

  return `
    <div class="cdl-shell-flow">
      ${prev ? `<a href="${prev}">&larr; ${findLabel(prev)}</a>` : `<a href="/catalog.html">&larr; Catalog</a>`}
      ${next ? `<a href="${next}">${findLabel(next)} &rarr;</a>` : `<a href="/index.html">Connected MVP &rarr;</a>`}
    </div>
  `;
}

function mountShell() {
  const currentPath = normalizePath(window.location.pathname);
  if (currentPath !== "/catalog.html") return;
  const meta = getMeta(currentPath);

  const shell = document.createElement("aside");
  shell.className = "cdl-shell-nav";
  shell.innerHTML = `
    <div class="cdl-shell-inner">
      <div class="cdl-shell-top">
        <div>
          <div class="cdl-shell-badge">Page Router</div>
          <strong>${findLabel(currentPath)}</strong>
          <span>Every screen is linked as one learning journey.</span>
        </div>
        <button class="cdl-shell-toggle" type="button" aria-label="Toggle page router">-</button>
      </div>
      <section class="cdl-shell-meta">
        <h2>Learning continuity</h2>
        <div class="cdl-shell-meta-grid">
          <div class="cdl-shell-meta-card">
            <strong>${meta.stage}</strong>
            <p>${meta.purpose}</p>
          </div>
          <div class="cdl-shell-meta-card">
            <strong>Evidence produced</strong>
            <p>${meta.evidence}</p>
          </div>
          <div class="cdl-shell-meta-card">
            <strong>Next step</strong>
            <p>${meta.next}</p>
          </div>
        </div>
      </section>
      <div class="cdl-shell-sections">
        ${renderLinks(currentPath)}
      </div>
      ${renderFlow(currentPath)}
    </div>
  `;

  const toggle = shell.querySelector(".cdl-shell-toggle");
  toggle?.addEventListener("click", () => {
    shell.classList.toggle("is-collapsed");
    toggle.textContent = shell.classList.contains("is-collapsed") ? "+" : "−";
  });

  document.body.append(shell);
}

mountShell();
