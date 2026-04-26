import Link from "next/link";
import { AppTopNav } from "@/components/shell/app-top-nav";
import { AppFooter } from "@/components/shell/app-footer";

const COURSES = [
  { id: "cs-210", code: "CS 210", title: "Algorithms in Python", learners: 84, assignments: 4, language: "Python" },
  { id: "ds-101", code: "DS 101", title: "Statistics with R", learners: 62, assignments: 3, language: "R" },
];

const REVIEW_QUEUE = [
  { student: "k.tanaka", course: "CS 210", assignment: "HW-04", flag: "Trace inconsistency", level: "FLAGGED" },
  { student: "a.morel", course: "CS 210", assignment: "HW-03", flag: "Repair shallow", level: "FLAGGED" },
  { student: "s.park", course: "DS 101", assignment: "HW-02", flag: "Hotspot incomplete", level: "WATCH" },
];

export default function ProfessorDashboardPage() {
  return (
    <div className="page">
      <AppTopNav role="professor" />
      <main className="portal">
        <section className="portal-hero">
          <div className="eyebrow"><span className="eye-bar" />PROFESSOR WORKSPACE</div>
          <h1 className="hero-title">Courses, assignments, and the review queue.</h1>
          <p className="hero-body">
            Register a course, attach an assignment with the checkpoints you want, then review consistency between explanations, traces, and repairs.
          </p>
          <div className="hero-actions">
            <Link href="/professor/assignment/new" className="btn-primary">
              Create assignment
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/icons/arrow-right.svg" width={16} height={16} alt="" />
            </Link>
            <Link href="/professor/courses/new" className="btn-ghost">Register a course</Link>
          </div>
        </section>

        <section className="portal-stats">
          <div className="stat"><div className="stat-n">2</div><div className="stat-l">Active courses</div></div>
          <div className="stat"><div className="stat-n">7</div><div className="stat-l">Open assignments</div></div>
          <div className="stat"><div className="stat-n">146</div><div className="stat-l">Submissions this week</div></div>
          <div className="stat"><div className="stat-n">3</div><div className="stat-l">Review queue</div></div>
        </section>

        <section className="portal-section">
          <h2 className="portal-section-title">Courses</h2>
          <div className="portal-grid">
            {COURSES.map((c) => (
              <article key={c.id} className="portal-card">
                <div className="pc-eyebrow">
                  <span className="badge badge-mono">{c.language}</span>
                  <span className="meta-sep">·</span>
                  <span>{c.code}</span>
                </div>
                <h3 className="pc-title">{c.title}</h3>
                <div className="pc-meta">
                  <div><span className="pc-meta-l">Learners</span><span className="pc-meta-v">{c.learners}</span></div>
                  <div><span className="pc-meta-l">Assignments</span><span className="pc-meta-v">{c.assignments}</span></div>
                </div>
                <Link href={`/professor/courses/${c.id}`} className="btn-primary">
                  Open course
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/assets/icons/arrow-right.svg" width={16} height={16} alt="" />
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="portal-section">
          <h2 className="portal-section-title">Review queue</h2>
          <div className="review-table">
            <div className="rt-head">
              <span>Student</span><span>Course</span><span>Assignment</span><span>Flag</span><span>Level</span>
            </div>
            {REVIEW_QUEUE.map((r, i) => (
              <Link key={i} href={`/professor/student/${r.student}`} className="rt-row">
                <span className="mono">{r.student}</span>
                <span>{r.course}</span>
                <span>{r.assignment}</span>
                <span>{r.flag}</span>
                <span className={`rt-level rt-${r.level.toLowerCase()}`}>{r.level}</span>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <AppFooter />
    </div>
  );
}
