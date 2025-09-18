# Website Link
http://sealion-checkit-website.s3-website-us-east-1.amazonaws.com/

# ✅ Checkit (Sealion Scribe)

**Checkit** is a single-page web app that helps teachers **create essay assignments** and **review submissions** with an **Essay Checker experience powered by SEA-LION AI (Singapore Model)**.
Supports multiple ASEAN languages: **English, Bahasa Melayu, Thai, and more.**

🔧 **Tech Stack**: React + TypeScript + Vite · TailwindCSS + shadcn/ui · AWS S3 (CI/CD)

---

# How to Use

1. Login using your custom email and password.
   - Alternatively, you can link your Google/Facebook Accounts
   - Do not that these login configurations are NOT saved
  
2. Select a pre-existing assignment.
   - You can create new assignments by clicking the "Add Assignment" button

4. You may do 1 of 2 things:
   (a) Click a student profile to access their essay and feedback.
   (b) Upload an essay

5. Click the "Analyze Essay" button to start marking essays!

---

## 🏗 Architecture & Extensibility

**Frontend**

* React 18 + TypeScript + Vite
* TailwindCSS + shadcn/ui
* React Router (SPA routing)
* TanStack Query (future data fetching)

---

## 🚀 Deployment

* **CI/CD**: GitHub → AWS CodePipeline → CodeBuild → Amazon S3
* **Hosting**: S3 Static Website Hosting serves built SPA (`dist`)
