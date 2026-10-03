# CaterHub setup

Stack: React + Vite website · **Supabase** (login, database, photo storage). There is no separate API server any more: the website talks to Supabase directly, and Row Level Security in the database decides who can do what.

## 1. Database (once)
Supabase Dashboard > SQL Editor > run, in order:
1. `supabase/migrations/001_caterhub_schema.sql`
2. `supabase/migrations/003_supabase_auth.sql`
3. `supabase/migrations/004_signup_contact_fields.sql`   (saves the customer phone number and the caterer contact name from the new sign-up form)

The old API-server script now lives in `supabase/legacy/` and is not needed.

003 creates the `profiles` table, the sign-up trigger, the security rules, and two storage buckets
(`id-verification` private, `caterer-photos` public). It is safe to run more than once.

## 2. Supabase Auth settings (Dashboard > Authentication)
1. **Sign In / Providers > Email**: make sure Email is enabled. Turn **Confirm email OFF** if you want people to get in right after sign-up (recommended while you test). If you leave it ON, users must click the email link before their first login.
2. **Email Templates > Reset Password**: replace the body so it shows the 6-digit code the app asks for:

       <h2>Reset your CaterHub password</h2>
       <p>Your code is: <strong>{{ .Token }}</strong></p>

3. Supabase's built-in email sender is limited to a few emails per hour. Before launch set up **Project Settings > Authentication > SMTP** (Gmail with an App Password works).

## 3. Website settings
`.env` (local) and **Vercel > Project > Settings > Environment Variables**:

    VITE_SUPABASE_URL=https://djjvoqdwcaybpnrdepru.supabase.co
    VITE_SUPABASE_ANON_KEY=sb_publishable_...

These are public keys. Never put the `service_role` / secret key in the website. After changing variables on Vercel, redeploy.

## 4. Run it
    npm install
    npm run dev        # http://localhost:5173

## What each kind of account can do
- **Customer**: sign up / log in, browse caterers, send inquiries (login required), see "My inquiries".
- **Caterer**: sign up with a business profile, log in to the **dashboard** to edit the profile, add / edit / delete **packages**, upload photos, manage customer inquiries. A listing goes live once it has a description (20+ characters), a location and one package.
- **Forgot password**: a 6-digit code is emailed (see step 2.2).

## Reviewing ID photos
ID photos are in Supabase > Storage > `id-verification` (one folder per user id). Only the owner and project admins can open them. Set a person's `id_status` to `approved` / `rejected` in Table Editor > `profiles`, and set `verified = true` on their row in `caterers` to show the verified badge.

## Not carried over from the old server
- Inquiry **email notifications** to caterers (they still see every inquiry in the dashboard). This needs a Supabase Edge Function or a database webhook if you want it back.
