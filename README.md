# Spreadsheet Expense Tracker

Use a Google Sheet as a lightweight database to track daily expenses with category detection, budgeting stats, and a minimal glassmorphic UI. Ideal for personal finance when a full backend feels like overkill.

<img width="497" height="811" alt="Screenshot 2025-11-04 at 21 12 41" src="https://github.com/user-attachments/assets/965447bd-9552-4d1d-92e0-aaef9084d0ac" />


## Table of Contents

1. Overview
2. Features
3. Tech Stack
4. Architecture & Data Flow
5. Quick Start
6. Spreadsheet Preparation
7. Google Service Account Auth
8. Environment Variables
9. API Routes
10. React Query & Caching
11. Fuzzy Category Matching
12. Deployment (Netlify)
13. Troubleshooting
14. Contributing / Extending
15. References

---

## 1. Overview

This application treats a Google Spreadsheet as the source of truth for:

- Expense categories (names + optional colors)
- Monthly expense rows (category, amount, description)
- Budget summary values

No external database is required; Google Sheets + a service account powers read/write operations via Next.js API routes.

## 2. Features

- Add expenses with category, amount, and description
- Auto-fills emoji icon (first emoji extracted from category name)
- Budget overview (necessities vs wants)
- Unverified item workflow (process & delete)
- Category similarity detection using internal Levenshtein implementation
- Glassmorphic card UI (blur + semi-transparent panels)
- React Query caching + explicit invalidation (`unverified`, `api/budget`)
- Works entirely with a single Google Sheet document

## 3. Tech Stack

- Next.js 15 (App/Pages hybrid, API routes for serverless functions)
- React 18 + TypeScript 5
- Chakra UI 2 (component styling + responsive primitives)
- React Query 5 (`@tanstack/react-query`) for client-side caching
- SWR (legacy usage in some hooks; consider consolidating)
- Google Sheets API via `googleapis` + `google-auth-library`
- pnpm workspace tooling

## 4. Architecture & Data Flow

High-level flow:

1. User enters expense (amount + description) and selects a category.
2. Client calls `POST /api/track` which appends a row to the latest (rightmost) month sheet.
3. React Query invalidates relevant caches to refresh budget + unverified views.
4. Budget stats aggregate totals from categorized rows.

Sheet layout expectations:

- Sheet 1: `Data` (Column A: category names, Column B: optional color value)
- Subsequent sheets: monthly sheets (e.g. `January 2025`) with rows `[Category, Amount, Description]` starting at A/B/C.

If you change structure, adjust `sheetRange` and parsing logic in `src/pages/api/track.ts` and related endpoints.

## 5. Quick Start

```bash
# Prefer pnpm
pnpm install
pnpm dev

# If needed
npm install && npm run dev
yarn install && yarn dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 6. Spreadsheet Preparation

[Example spreadsheet](https://docs.google.com/spreadsheets/d/1o8PrpO-ye_H_Cdfe0HDQAf3VfY1kKZSm4uWx4ODNTeg/edit?usp=sharing)

1. Create a sheet named `Data` (must be first / leftmost).
2. Column A: category names (e.g. `💻 Tech`, `🍔 Food`).
3. Column B: optional color codes (hex or recognized style value).
4. Add monthly sheets manually (e.g. `January 2025`, `February 2025`). The app writes to the last (rightmost) sheet.
5. Ensure consistent casing/spelling to improve matching quality.

Example structure:

```
Data            |  (A: Name) (B: Color)
January 2025    |  (A: Category) (B: Amount) (C: Description)
February 2025   |  ...
```

## 7. Google Service Account Auth

Create a Google Cloud Project → Enable Sheets API → Create Service Account → Generate JSON key.

Minimal steps:

1. Open Google Cloud Console → New Project.
2. APIs & Services → Enable `Google Sheets API`.
3. Credentials → Create Service Account → Download JSON Key.
4. Share your target spreadsheet with the `client_email` from the key.

Retain only:

- `client_email`
- `private_key` (must preserve line breaks, use quoted string in `.env`).

## 8. Environment Variables

Create `.env` in project root:

```
CLIENT_EMAIL=your-service-account@project-id.iam.gserviceaccount.com
PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nABC...XYZ=\n-----END PRIVATE KEY-----\n"
SPREADSHEET_ID="<spreadsheet id>"
```

Notes:

- Spreadsheet ID is the middle segment of the sheet URL.
- Private key must be quoted and newlines encoded as `\n`.
- Replace escaped newlines at runtime (see `apiServer.ts` implementation).

## 9. API Routes (src/pages/api)

| Route              | Method     | Purpose                                         |
| ------------------ | ---------- | ----------------------------------------------- |
| `track.ts`         | POST       | Append single expense row to active month sheet |
| `trackbulk.ts`     | POST       | Append multiple expenses in one request         |
| `trackexternal.ts` | POST       | External tracking endpoint variant              |
| `budget.ts`        | GET        | Aggregate budget + category totals              |
| `data.ts`          | GET        | Fetch raw sheet category + color metadata       |
| `unverified.ts`    | GET/DELETE | Manage unverified expense entries               |

Adjust logic here if you change sheet layout or add new computed fields.

## 10. React Query & Caching

Primary query keys:

- `unverified` → Unverified expense list.
- `api/budget` → Aggregated budget metrics.

Invalidated on:

- Successful expense deletion (`mutation.onSuccess`, `onSettled`).
- (Consider invalidating after adding a new expense for live budget refresh.)

## 11. Fuzzy Category Matching

Originally relied on a deprecated external string similarity library. Replaced with an internal Levenshtein-based scoring function (`misc.ts`) to suggest closest category matches. This avoids extra dependencies and deprecation risk.

## 12. Deployment (Netlify)

Recommendations:

- Use Netlify Next.js plugin (`@netlify/plugin-nextjs`).
- Ensure Node version ≥ 22 (see `package.json` engines field) or adjust build image.
- Do not use static export (`next export`) because API routes must remain serverless functions.
- Set environment variables via Netlify UI (no surrounding quotes needed except for multi-line private key which should remain escaped).

Build command example:

```
pnpm build
```

Publish directory: (handled by Next.js plugin; typically `.next`)

## 13. Troubleshooting

| Issue                   | Cause                                 | Fix                                                 |
| ----------------------- | ------------------------------------- | --------------------------------------------------- |
| 401 / permission error  | Sheet not shared with service account | Share spreadsheet with `client_email`               |
| Private key parse error | Missing quotes or raw newlines        | Wrap key in quotes; encode newlines as `\n`         |
| Empty budget view       | No monthly sheet or wrong sheet order | Ensure at least one month sheet exists after `Data` |
| API route 404 on deploy | Static export performed               | Use standard `next build` only                      |
| NaN progress circle     | Division by zero (0 total)            | Guard with `total > 0 ? ... : 0`                    |

## 14. Contributing / Extending

Ideas:

- Add authentication layer (e.g. NextAuth) for multi-user segregation.
- Bulk import from CSV.
- Persist category emojis separately.
- Add charts for monthly trends.
- Consolidate SWR fully into React Query.

Development tips:

- Keep components small (`TrackSection`, `TrackerTitle`).
- Type props interfaces explicitly.
- Invalidate React Query keys after mutations for accurate UI.

## 15. References

- Blog: [How to Use Google Sheets As a Database For Your Business](https://blog.coupler.io/how-to-use-google-sheets-as-database/#Use_Google_Sheets_as_a_database_for_a_website)
- Google Sheets API Docs
- Next.js Documentation
