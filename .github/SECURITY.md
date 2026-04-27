# Security Policy

## Supported Versions

This project is in pre-release MVP development. No versions are currently considered "production" for purposes of security guarantees. Security work is in progress (see `docs/commercialization/01-punch-list.md`).

## Reporting a Vulnerability

If you find a security issue — especially anything involving:

- Student PII exposure
- Sandbox escape from WebR / Pyodide
- Bypass of Supabase Row-Level Security
- Leakage of API keys (Anthropic, Stripe, Supabase service-role)
- Cross-tenant data access between instructor accounts

…please **do not open a public GitHub issue**. Instead, email the maintainer at **jewoong.moon@gmail.com** with:

1. A short description of the issue
2. Steps to reproduce
3. The affected component (file path or URL)
4. Whether the issue is currently exploitable in the deployed demo

You can expect:

- Acknowledgement within 5 business days
- A fix or mitigation timeline within 14 days for high-severity issues
- Public credit in the release notes if you wish

## Out-of-Scope

- The deployed GitHub Pages demo intentionally has no auth and uses synthetic/demo data only. Findings limited to that demo (e.g., "anyone can edit the workspace state") are tracked as P0 commercialization tasks, not new vulnerabilities — see `docs/commercialization/01-punch-list.md`.
- Denial-of-service against the demo via the public Supabase anon key.

## FERPA / Research-Pipeline Note

If a vulnerability involves the *research* pipeline (the opt-in trajectory dataset), please flag it explicitly. PII / consent-bypass issues are treated at the highest severity even if they don't compromise authentication.
