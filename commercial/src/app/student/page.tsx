import Link from "next/link";
import { AppTopNav } from "@/components/shell/app-top-nav";
import { AppFooter } from "@/components/shell/app-footer";

const ENROLLED_COURSES = [
  {
    id: "cs-210",
    code: "CS 210",
    title: "Algorithms in Python",
    instructor: "Dr. Han",
    language: "Python",
    pending: 1,
    next: "HW-04 · Rolling anomalies",
    due: "Friday",
  },
  {
    id: "ds-101",
    code: "DS 101",
    title: "Statistics with R",
    instructor: "Prof. Lin",
    language: "R",
    pending: 0,
    next: "HW-03 · Linear regression",
    due: "Submitted",
  },
];

export default function StudentPortalPage() {
  return (
    <div className="page">
      <AppTopNav role="student" />
      <main className="portal">
        <section className="portal-hero">
          <div className="eyebrow"><span className="eye-bar" />STUDENT WORKSPACE</div>
          <h1 className="hero-title">Enrolled courses.</h1>
          <p className="hero-body">
            Open a course to see assignments. Code Defense Lab always starts from a course — never directly inside a task — so you can see what&apos;s due and what&apos;s already defended.
          </p>
        </section>

        <section className="portal-grid">
          {ENROLLED_COURSES.map((c) => (
            <article key={c.id} className="portal-card">
              <div className="pc-eyebrow">
                <span className="badge badge-mono">{c.language}</span>
                <span className="meta-sep">·</span>
                <span>{c.code}</span>
              </div>
              <h2 className="pc-title">{c.title}</h2>
              <p className="pc-instructor">{c.instructor}</p>
              <div className="pc-meta">
                <div>
                  <span className="pc-meta-l">Next assignment</span>
                  <span className="pc-meta-v">{c.next}</span>
                </div>
                <div>
                  <span className="pc-meta-l">Due</span>
                  <span className="pc-meta-v">{c.due}</span>
                </div>
                <div>
                  <span className="pc-meta-l">Pending defenses</span>
                  <span className="pc-meta-v">{c.pending}</span>
                </div>
              </div>
              <Link href={`/student/${c.id}`} className="btn-primary">
                Open course
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/assets/icons/arrow-right.svg" width={16} height={16} alt="" />
              </Link>
            </article>
          ))}
        </section>
      </main>
      <AppFooter />
    </div>
  );
}
