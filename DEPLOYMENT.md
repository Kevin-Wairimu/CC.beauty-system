# Deployment Guide

## Deploy to Cloudflare Pages

### Prerequisites
- A Cloudflare account with Pages enabled.
- The production API endpoint URL (e.g., `https://api.yourdomain.com`).

### Steps
1. **Add environment variable** in the Cloudflare Pages dashboard:
   - Name: `VITE_API_URL`
   - Value: your API base URL (e.g., `https://api.yourdomain.com/api`).
2. **Commit your code** (ensure `.env.production` contains only a placeholder and is not committed).
3. **Trigger a build** on Cloudflare Pages. The build command is `npm run build` and the output directory is `dist`.
4. **Verify** the deployed site loads without console logs of the API URL and that admin actions (service delete, user updates, registration) respect the new password policy.

### Notes
- Vite automatically minifies the bundle for production.
- If you need a custom base path, set `VITE_BASE_PATH` similarly and update `vite.config.js`.
- Enable Cloudflare Rate Limiting and WAF for the API endpoint for extra security.
