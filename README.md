# SELLR.ai — AI Sales Coach for Whop Sellers

Built with Next.js 14 · Supabase Auth · Anthropic Claude · Tailwind CSS

## Stack
- **Framework**: Next.js 14 App Router
- **Auth**: Supabase Google OAuth
- **AI**: Anthropic Claude (claude-opus-4-5)
- **Fonts**: Figtree + Fraunces (Google Fonts)
- **Styling**: Tailwind CSS 3 + glassmorphism

## Features
- 4 tabs: Chat · Offer Builder · Store Analyzer · Credits
- Voice input + TTS read-aloud in chat
- Settings bottom sheet with drag gesture
- Desktop phone-frame (430px) like MindCore
- Credits system with plan tiers
- Google OAuth login

---

## Deploy (from mobile, no PC needed)

### Step 1 — Supabase
1. Go to [supabase.com](https://supabase.com) → New project
2. SQL Editor → paste + run `supabase/migrations/001_schema.sql`
3. Authentication → Providers → Google → Enable
   - Get credentials from [console.cloud.google.com](https://console.cloud.google.com) → APIs → Credentials → OAuth 2.0
4. Authentication → URL Configuration → Redirect URLs → Add:
   ```
   https://YOUR-APP.vercel.app/auth/callback
   ```

### Step 2 — GitHub (from mobile browser)
1. Go to github.com → New repository → name: `sellr-ai`
2. Upload all files from this zip (drag & drop works on desktop browser)
3. Or use GitHub mobile app

### Step 3 — Vercel (from mobile browser)
1. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
2. Add these 3 Environment Variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL      = https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ...
   ANTHROPIC_API_KEY             = sk-ant-api03-...
   ```
3. Click Deploy ✅

### Step 4 — Google OAuth callback URL
In Google Cloud Console → Your OAuth Client → Authorized redirect URIs → Add:
```
https://xxxx.supabase.co/auth/v1/callback
```

---

## Local Development
```bash
npm install
cp .env.example .env.local
# Fill in the 3 env vars
npm run dev
# → http://localhost:3000
```

---

## File Structure
```
app/
  login/page.tsx          Login page
  chat/page.tsx           Main app shell (all 4 tabs)
  api/auth/google/        OAuth initiator
  auth/callback/          OAuth callback handler
  api/chat/               Claude AI endpoint
  api/offers/             Offer Builder endpoint
  api/store/              Store Analyzer endpoint
  api/feedback/           Feedback endpoint
  api/account/delete/     Account deletion
components/
  chat-view.tsx           Chat with voice input
  offers-view.tsx         Offer copy builder
  store-view.tsx          Store analyzer
  credits-view.tsx        Credits + plans
  settings-menu.tsx       Bottom sheet settings
  bottom-navigation.tsx   4-tab nav bar
  ui/                     Radix UI components
lib/
  supabase/               Client, server, middleware
  utils.ts                cn(), parseMarkdown()
  types.ts                TypeScript types
supabase/
  migrations/001_schema.sql   Full DB schema
```
