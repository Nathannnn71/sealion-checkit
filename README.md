# Checkit ✓ (Sealion Scribe)

Checkit is a single-page web app that helps teachers create essay assignments and review submissions with an Essay Checker experience using SEA-LION AI Singapore Model which supported multiple ASEAN countries languages (English, Bahasa Melayu, Thai etc.)
Built with React + TypeScript + Vite, styled with Tailwind + shadcn/ui, and deployed to AWS S3 via a CI/CD pipeline.

✨ What It Does

📘 Assignments

Create and manage essay assignments on the Dashboard

Open an assignment to view or collect student work

📝 Essay Checker (Core Feature)

Paste essay text or upload a document (via DocumentUpload)

Preview extracted text before processing

Run analysis → structured feedback on clarity, grammar/style, suggestions

Copy feedback or return to re-edit text

Analysis is pluggable:

Connect to your own HTTP API

Or use a Supabase Edge Function (analyze-essay)

🧭 Header UX

Notifications dropdown: sample items, “Mark all read,” “Clear”

Settings dropdown: Help Center, Contact Us (placeholders)

Profile dropdown: avatar upload, edit username, logout

Profile persisted in localStorage (user_profile)

💾 Persistence (Client-only by default)

Assignments → localStorage["assignments"]

Per-assignment student data → localStorage["assignment_students_<id>"]

Profile (avatar + username) → localStorage["user_profile"]

🔍 How the Essay Checker Works

Input

Users paste text or upload a file via the UI

Text extracted client-side when possible, shown for confirmation

Analysis

On “Check,” text sent to a pluggable handler

Options:

Custom API endpoint

Supabase Edge Function (supabase/functions/analyze-essay)

UI stays unchanged regardless of backend

Output

Feedback rendered into clear sections with actionable tips

Users can copy feedback for reuse/revision

Privacy

All inputs remain in-browser unless backend is wired

With backend: only essay text + minimal context are sent

🏗 Architecture & Extensibility
Frontend

React 18 + TypeScript + Vite

TailwindCSS + shadcn/ui

React Router (SPA routing)

TanStack Query (future data fetching)



⚡ Run Locally (Windows)
# From project root
npm install
npm run dev
# Open URL printed (e.g. http://localhost:5173)


Build & Preview

npm run build
npm run preview

🚀 Deploy (High Level)

CI/CD: GitHub → AWS CodePipeline → CodeBuild → Amazon S3

Hosting: S3 Static Website Hosting serves built SPA (dist)



🛣 Roadmap

🔔 Replace demo notifications with real backend feed

📂 Persist assignments & essays to a real backend

🖼 Store avatars in cloud storage (Supabase Storage / S3)

📑 Add export (PDF/Docx) + rubric-based scoring in Essay Checker

🌍 Full internationalization via src/lib/i18n.tsx

📄 License

Proprietary. All rights reserved.
