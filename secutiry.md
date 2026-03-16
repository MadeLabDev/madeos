# Next.js v16 Security Checklist (Full Version)
## 1. Authentication & Password Security
- Use Argon2id or bcrypt for password hashing.
- Enforce strong password policies.
- Implement rate limiting and account lockout.
- Use JWT with short expiration times (if used).
- Store refresh tokens securely (HttpOnly + Secure cookies).
## 2. API & Backend Protection
- Validate all request inputs with Zod or Yup.
- Sanitize user input to prevent XSS and injection.
- Use middleware to protect API routes.
- Never trust client-side validation alone.
## 3. Session & Cookie Security
- Always enable HttpOnly, Secure, and SameSite cookies.
- Rotate session tokens frequently.
- Use NextAuth or custom auth with strong session management.
## 4. HTTPS & Transport Layer Security
- Enable HTTPS everywhere.
- Use HSTS headers.
- Reject insecure HTTP requests.
## 5. XSS Prevention
- Escape all dynamic content.
- Avoid dangerouslySetInnerHTML unless sanitized.
- Use Content-Security-Policy (CSP).
## 6. CSRF Protection
- Use framework-provided CSRF tokens if using cookies.
- Use SameSite=Lax or Strict cookies.
- Avoid storing tokens in localStorage.
## 7. API Rate Limiting & Abuse Protection
- Use rate limiting on login, signup, and API endpoints.
- Use IP blocking and bot protection when needed.
## 8. File Upload Security
- Validate file types and sizes.
- Virus-scan uploaded files.
- Store uploads outside the web root.
## 9. Database & ORM Security
- Use parameterized queries.
- Protect against SQL Injection.
- Encrypt sensitive data at rest.
## 10. Secrets Management
- Store secrets in environment variables only.
- Rotate API keys regularly.
- Do not expose env vars to the client accidentally.
## 11. Logging & Monitoring
- Log authentication events, errors, and access attempts.
- Do NOT log passwords or sensitive data.
- Monitor anomalies and block suspicious activity.
## 12. Deployment & Infrastructure
- Use minimal Docker images (if applicable).
- Disable directory listing.
- Use Web Application Firewall (WAF).
## 13. Supply Chain & Dependency Security
- Run `npm audit` regularly.
- Pin package versions.
- Avoid abandoned libraries.
## 14. Build-Time & Runtime Security
- Use Next.js Middleware for security filters.
- Disable experimental features you don’t use.
- Minify and obfuscate production builds.
## 15. Security Headers
- Set the following headers:
- Content-Security-Policy
- Strict-Transport-Security
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy
## 16. Edge & Serverless Considerations
- Validate inputs at the edge.
- Restrict API access by region/IP if needed.
## 17. Backup & Recovery
- Automated backups with encryption.
- Backup secrets separately.
- Test disaster-recovery procedures.
## 18. Regular Security Audits
- Perform penetration testing.
- Automate dependency vulnerability scans.