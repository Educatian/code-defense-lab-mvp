import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig(({ command }) => ({
  base: command === "build" ? "/code-defense-lab-mvp/" : "/",
  server: {
    host: "127.0.0.1",
    port: 4173,
  },
  preview: {
    host: "127.0.0.1",
    port: 4173,
  },
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
        catalog: resolve(__dirname, "catalog.html"),
        landing: resolve(__dirname, "pages/landing-page.html"),
        landingDesktop: resolve(__dirname, "pages/landing-page-desktop.html"),
        professorDashboard: resolve(__dirname, "pages/professor-dashboard.html"),
        professorDashboardDesktop: resolve(__dirname, "pages/professor-dashboard-desktop.html"),
        createAssignment: resolve(__dirname, "pages/create-assignment.html"),
        professorStudentDetail: resolve(__dirname, "pages/professor-student-detail.html"),
        studentPortal: resolve(__dirname, "pages/student-portal.html"),
        studentSubmission: resolve(__dirname, "pages/student-submission.html"),
        hotspotQuestions: resolve(__dirname, "pages/hotspot-questions.html"),
        traceMode: resolve(__dirname, "pages/trace-mode-task.html"),
        mutationTask: resolve(__dirname, "pages/mutation-task.html"),
        repairMode: resolve(__dirname, "pages/repair-mode-task.html"),
        studentResult: resolve(__dirname, "pages/student-result.html"),
      },
    },
  },
}));
