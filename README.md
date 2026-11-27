# SRIJAN: Global Review of Arts, Science & Humanities

<div align="center">
  <img src="assets/logo.png" alt="SRIJAN: Global Review of Arts, Science & Humanities Logo" width="180"/>
  <h3>International Peer-Reviewed Open Access Journal</h3>
  <p><b>ISSN: 3139-7123 (Online) • Published by SRIJANTIRTHA</b></p>
</div>

---

## 📖 Overview

**SRIJAN: Global Review of Arts, Science & Humanities** is an esteemed international, bi-annual academic journal dedicated to fostering multidisciplinary dialogue across Arts, Science, Humanities, and Interdisciplinary Studies. Operating on a **100% Diamond Open Access** model, SRIJAN: Global Review of Arts, Science & Humanities ensures that world-class research is freely accessible to scholars, educators, and the global public without paywalls or publishing fees.

## ✨ Key Highlights

- 💎 **Diamond Open Access**: Zero Article Processing Charges (APCs) or submission fees for authors.
- 🔬 **Rigorous Peer Review**: Double-blind review process upholding the highest standards of academic excellence and integrity.
- 🌐 **Modern Digital Platform**: A premium web portal built with Custom Web Components, responsive layouts, high-contrast accessibility tools, and lightning-fast asset delivery.
- 📄 **CC BY 4.0 Licensing**: Authors retain full copyright while allowing unhindered global citation and distribution.

---

## 🏛 Architecture & Tech Stack

The journal's digital repository and web portal are architected with modern vanilla web standards for uncompromised performance, SEO optimization, and institutional accessibility:

- **Frontend Core**: Vanilla HTML5, CSS3 (Custom Variables, Flexbox/CSS Grid), and Vanilla ES6 JavaScript.
- **Modular Component Design (`components.js`)**: Encapsulates global UI elements (`<srijan-header>`, `<srijan-footer>`, `<srijan-modals>`) using native Web Components (Custom Elements) for seamless multi-page maintainability.
- **Iconography**: Dynamic vector rendering powered by [Lucide Icons](https://lucide.dev/).
- **Typography**: Optimized loading of Google Fonts (*Lora* for academic serif elegance & *Inter* for crisp sans-serif UI clarity).

---

## 📂 Repository Structure

```text
srijan/
├── index.html                           # Journal Homepage (Aim & Scope, Editorial Board, Guidelines)
├── styles.css                           # Global Premium Design System & Theming
├── app.js                               # Interactive Client Logic, Modals & Toast System
├── components.js                        # Custom Web Components (Header, Footer, Modals)
├── assets/                              # Brand Assets & Logos
├── volume-1-issue-1-2026/               # Inaugural Volume 1 Issue 1 (April 2026) Archive
│   └── index.html                       # Table of Contents & Article Detail Pages
├── privacy-policy/                      # Dedicated Privacy Policy Page
├── terms-of-submission/                 # Dedicated Terms of Submission Page
└── disclaimer/                          # Dedicated Legal Disclaimer Page
```

---

## 🚀 Features & Capabilities

### 1. Advanced Accessibility Controls
Integrated navigation bar allowing users to dynamically adjust text size (`A-`, `A`, `A+`) and toggle **High Contrast Mode** for visually impaired readers or low-light environments.

### 2. Live Article Filtering & Search
Real-time client-side search across journal volumes, filtering by article titles, authors, keywords, and abstracts instantly without server roundtrips.

### 3. Integrated Submission & Reviewer Portals
Fully functional modal systems allowing aspiring authors and reviewers to submit academic manuscripts (.docx / .tex) and curriculum vitae (.pdf) directly through the browser.

---

## 📜 Editorial Policies & Governance

SRIJAN: Global Review of Arts, Science & Humanities strictly adheres to the ethical guidelines set forth by the **Committee on Publication Ethics (COPE)**. All submissions undergo automated plagiarism verification prior to entering the review pipeline. For detailed policy frameworks, refer to our dedicated legal pages:
- [Privacy Policy](./privacy-policy/index.html)
- [Terms of Submission](./terms-of-submission/index.html)
- [Disclaimer](./disclaimer/index.html)

---

<div align="center">
  <p>&copy; 2026 <b>SRIJANTIRTHA</b>. All rights reserved. Registered under Reg No: IV-1901-00880/2025.</p>
  <p>📍 <i>Headquarters: Betai, Nadia 741163, West Bengal, India</i></p>
</div>

### Manuscript submissions

The journal's public submission links open the [Tally manuscript form](https://tally.so/r/8NxPkk). Editors can find new drafts in the form's Submissions tab.

Enable Respondent email notifications in Tally and map the To field to the required author email field. This option requires Tally Pro. Self email notifications can separately alert the form owner.

To publish the journal links, upload the changed public HTML, components.js, and app.js to the existing site. Tally handles manuscript uploads and receipts independently of the journal's Supabase project.

For the Supabase mirror, connect a Tally webhook on form 8NxPkk to https://qbgubcicjqkgowxgrmmp.supabase.co/functions/v1/srijan-tally. Set its signing secret to the same value as TALLY_SIGNING_SECRET in Supabase Edge Function Secrets. RESEND_API_KEY and STUDIO_NOTIFICATION_FROM configure the automated author receipt. When using Resend for the receipt, leave Tally's own respondent receipt disabled to avoid duplicate emails.

The webhook copies PDF, DOCX, DOC, or TEX files up to 25 MB to the private srijan-manuscripts bucket and writes a row in srijan_submissions. Configure the Tally upload field to match those formats and limits. Unsupported extensions or files reported above the limit stay in Tally, and their submission details still sync. Tally retries failed deliveries. The Tally submission ID deduplicates the Supabase record, and the receipt is recorded after Resend accepts it.

The srijan-manuscripts function handles editor downloads and status emails. Register each intended journal editor by adding their Supabase Auth user UUID to public.srijan_editors. Use the admin dashboard version that invokes the function when changing status.
