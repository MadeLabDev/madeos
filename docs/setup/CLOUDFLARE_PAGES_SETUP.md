# Cloudflare Pages Setup for MADE OS (Next.js)

## ✅ Quick Start - 3 bước duy nhất

### 1️⃣ **Connect GitHub Repository (1 lần)**
- Vào https://pages.cloudflare.com/
- Click **"Connect to Git"**
- Chọn GitHub account → tìm repo `MadeLabDev/madeapp`
- Click **"Begin setup"**

### 2️⃣ **Cấu hình Build (trong Cloudflare Pages UI)**
Nhập các thông tin sau:
```
Framework preset: Next.js
Build command: yarn build
Build output directory: .next
Node.js version: 20.x (hoặc cao hơn)
```

**Environment Variables:**
```
DATABASE_URL=<your-database-url>
NEXTAUTH_SECRET=<your-secret>
NEXTAUTH_URL=https://<your-domain>
NEXT_PUBLIC_PUSHER_KEY=<pusher-key>
PUSHER_APP_ID=<pusher-app-id>
PUSHER_SECRET=<pusher-secret>
... (tất cả các biến từ .env.local)
```

### 3️⃣ **Deploy**
- Click **"Save and Deploy"**
- Cloudflare tự động build & deploy
- Mỗi lần push lên `main` hoặc `madeos` branch sẽ tự động deploy

---

## 📋 Thực hiện Deploy

### **Option A: Deploy từ Dashboard Cloudflare (Khuyến nghị)**

1. Truy cập: https://dash.cloudflare.com/
2. Chọn **"Pages"** → **"Connect to Git"**
3. Authorize GitHub
4. Select repository: `MadeLabDev/madeapp`
5. Configure build settings (như bên trên)
6. Deploy ✅

### **Option B: Deploy từ CLI (Advanced)**

```bash
# 1. Login vào Cloudflare
npx wrangler login

# 2. Deploy Pages project
npx wrangler pages deploy .next

# Hoặc cho Next.js auto-detection:
npm install -g @cloudflare/next-on-pages
npx next-on-pages

# 3. Deploy
npx wrangler pages deploy .next
```

---

## 🔧 Cloudflare Pages vs Vercel

| Feature | Cloudflare Pages | Vercel |
|---------|------------------|--------|
| **Next.js Support** | ✅ Full | ✅ Full |
| **Free Tier** | ✅ Unlimited bandwidth | ❌ Limited |
| **Build Minutes** | ✅ 500/month free | ❌ 6000/month (paid) |
| **Preview Deploys** | ✅ Yes | ✅ Yes (limited free) |
| **Edge Functions** | ✅ Cloudflare Workers | ✅ Vercel Functions |
| **Global Edge Network** | ✅ 300+ cities | ✅ 100+ regions |
| **Analytics** | ✅ Web Analytics | ⚠️ Limited free |
| **Cost** | 🏆 Miễn phí mạnh | 💰 ~$20-100/month |

---

## ⚙️ Next.js Configuration for Cloudflare Pages

File `next.config.ts` của bạn đã sẵn sàng ✅

Những gì cần verify:
- ✅ `images.unoptimized: true` (Cloudflare optimize images tự động)
- ✅ `experimental.serverActions.bodySizeLimit` (tối ưu cho large payloads)
- ✅ Prisma setup ready

---

## 🚀 Automatic Deployments

### Deploy tự động khi push code:

**Production (main branch):**
```bash
git push origin main
```

**Preview (PR branches):**
```bash
git push origin feature/xyz
```
→ Cloudflare tự động tạo preview URL

---

## 📊 Monitoring & Analytics

Sau khi deploy:
1. Vào Cloudflare dashboard → Pages
2. Chọn project `madeapp`
3. Tab **"Analytics"** → xem traffic, build logs, errors

---

## 🔐 Environment Variables Setup

**Trong Cloudflare Pages UI:**
1. Project → **Settings** → **Environment variables**
2. Add các biến từ `.env.local` (không commit `.env` files!)
3. Nhập giá trị cho production, preview, development environments

**Required variables:**
```
DATABASE_URL              # MySQL connection string
NEXTAUTH_SECRET          # JWT secret (generate: openssl rand -base64 32)
NEXTAUTH_URL             # https://your-domain.com
NEXT_PUBLIC_*            # Client-side public variables
```

---

## 🐛 Troubleshooting

### Build fails with "DATABASE_URL not found"
→ Set environment variables trong Cloudflare Pages UI

### Pages showing 404 errors
→ Ensure `_next` static files are serving correctly
→ Check build output directory is `.next`

### Server Actions not working
→ Verify `NEXTAUTH_SECRET` is set
→ Check database connection from Cloudflare edge

### Slow deployments
→ Check build logs in Cloudflare dashboard
→ Reduce build time: `yarn build` completes locally?

---

## 📝 Summary: What to do now

✅ **Step 1**: Go to https://pages.cloudflare.com/  
✅ **Step 2**: Connect your GitHub repo  
✅ **Step 3**: Configure build & environment variables  
✅ **Step 4**: Click Deploy  
✅ **Step 5**: Your app is live on Cloudflare Edge! 🎉

No more `npx wrangler deploy` needed for full-stack apps!
