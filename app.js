const studentRows = [
  {
    name: "Alex Chen",
    provenance: "AI Assisted",
    tests: "98%",
    hotspot: "90",
    trace: "40",
    mutation: "55%",
    repair: "35%",
    consistency: "45%",
    status: "Flagged",
    view: "professor-student-detail",
  },
  {
    name: "Jamie Smith",
    provenance: "Self Written",
    tests: "88%",
    hotspot: "92",
    trace: "90",
    mutation: "85%",
    repair: "95%",
    consistency: "93%",
    status: "Clean",
    view: "professor-dashboard",
  },
  {
    name: "Morgan Lee",
    provenance: "External Examples",
    tests: "92%",
    hotspot: "85",
    trace: "75",
    mutation: "60%",
    repair: "45%",
    consistency: "68%",
    status: "Stable",
    view: "professor-dashboard",
  },
  {
    name: "Leo Kurosawa",
    provenance: "Self Written",
    tests: "89%",
    hotspot: "87",
    trace: "82",
    mutation: "78%",
    repair: "74%",
    consistency: "84%",
    status: "Clean",
    view: "professor-dashboard",
  },
];

const views = Array.from(document.querySelectorAll(".view"));
const navButtons = Array.from(document.querySelectorAll("[data-view-target]"));
const sideLinks = Array.from(document.querySelectorAll(".side-link"));
const tableBody = document.getElementById("student-table-body");
const submitButton = document.getElementById("submit-assessment");

function statusClass(status) {
  if (status === "Clean") return "status-clean";
  if (status === "Stable") return "status-stable";
  return "status-flag";
}

function renderTable() {
  if (!tableBody) return;

  while (tableBody.firstChild) tableBody.removeChild(tableBody.firstChild);

  studentRows.forEach((student) => {
    const tr = document.createElement("tr");
    tr.dataset.viewTarget = student.view;

    const nameCell = document.createElement("td");
    const nameStrong = document.createElement("strong");
    nameStrong.textContent = student.name;
    const nameSmall = document.createElement("small");
    nameSmall.textContent =
      student.view === "professor-student-detail"
        ? "Highest priority review"
        : "Normal review path";
    nameCell.append(nameStrong, document.createElement("br"), nameSmall);

    const cells = [
      student.provenance,
      student.tests,
      student.hotspot,
      student.trace,
      student.mutation,
      student.repair,
    ].map((value) => {
      const td = document.createElement("td");
      td.textContent = value;
      return td;
    });

    const consistencyCell = document.createElement("td");
    const consistencyStrong = document.createElement("strong");
    consistencyStrong.textContent = student.consistency;
    consistencyCell.appendChild(consistencyStrong);

    const statusCell = document.createElement("td");
    const statusSpan = document.createElement("span");
    statusSpan.className = statusClass(student.status);
    statusSpan.textContent = student.status;
    statusCell.appendChild(statusSpan);

    tr.append(nameCell, ...cells, consistencyCell, statusCell);
    tr.addEventListener("click", () => {
      activateView(tr.dataset.viewTarget);
    });
    tableBody.appendChild(tr);
  });
}

function activateView(target) {
  views.forEach((view) => {
    view.classList.toggle("is-active", view.dataset.view === target);
  });

  sideLinks.forEach((link) => {
    link.classList.toggle("is-active", link.dataset.viewTarget === target);
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
}

navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const pageTarget = button.dataset.pageTarget;
    if (pageTarget) {
      window.location.href = pageTarget;
      return;
    }
    activateView(button.dataset.viewTarget);
  });
});

if (submitButton) {
  submitButton.addEventListener("click", () => {
    const provenance = document.querySelector('input[name="provenance"]:checked');
    const selected = provenance ? provenance.value : "Written mostly by myself";
    const note = document.querySelector(".mini-note");
    if (note) {
      note.textContent = `Submission recorded with provenance: ${selected}. Hotspot questions are now unlocked.`;
    }
    const pageTarget = submitButton.dataset.pageTarget ?? "/pages/hotspot-questions.html";
    window.location.href = pageTarget;
  });
}

renderTable();
activateView("landing");
