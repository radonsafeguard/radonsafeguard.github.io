# Staff portal (internal / not published)

These pages are the **staff demo portal** (customers, estimates, invoices, reports, login).

## Why this folder?

- The public marketing site must not link to or advertise a login.
- On **GitHub Pages**, folders that start with `_` are **not published** when Jekyll builds the site (this repo no longer uses `.nojekyll` for that reason).
- Files stay in git so we can build a real authenticated portal later.

## Pages

| File | Purpose |
|------|---------|
| `login.html` | Demo login (still client-side only — not secure) |
| `customers.html` | Customer list (localStorage) |
| `estimates.html` | Estimates (localStorage) |
| `invoices.html` | Invoices (localStorage) |
| `reports.html` | Reports |

## Local use only

Open in a browser from disk, for example:

`_portal/login.html`

Paths to CSS/images point one level up (`../css`, `../images`).

**Do not** move these files back to the site root or link them from public pages until real authentication is implemented.

## Later (real security)

Replace demo login + localStorage with a backend (e.g. Supabase Auth + database).
