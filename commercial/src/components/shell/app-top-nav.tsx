"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type AppTopNavProps = {
  role: "professor" | "student";
};

export function AppTopNav({ role }: AppTopNavProps) {
  const pathname = usePathname();
  const links =
    role === "professor"
      ? [
          { href: "/professor", label: "Dashboard" },
          { href: "/professor/courses", label: "Courses" },
          { href: "/professor/review", label: "Review queue" },
        ]
      : [
          { href: "/student", label: "My courses" },
          { href: "/student/results", label: "Results" },
        ];
  return (
    <header className="nav">
      <div className="nav-left">
        <Link href="/" className="brand-mark" aria-label="Code Defense Lab">CD</Link>
        <div className="brand-text">
          <div className="brand-name">Code Defense Lab</div>
          <div className="brand-tag">
            {role === "professor" ? "Professor workspace" : "Student workspace"}
          </div>
        </div>
      </div>
      <nav className="nav-right">
        {links.map((l) => {
          const active = pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href));
          return (
            <Link key={l.href} href={l.href} className={`nav-link ${active ? "active" : ""}`}>
              {l.label}
            </Link>
          );
        })}
        <Link href="/" className="nav-link">Sign out</Link>
      </nav>
    </header>
  );
}
