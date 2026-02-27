# Supabase auth setup

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a project.
2. In **Project Settings → API**, copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

## 2. Environment variables

Copy `.env.example` to `.env` and set:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 3. Run the database migration

In **Supabase Dashboard → SQL Editor**, run the contents of:

`supabase/migrations/001_profiles_roles.sql`

This creates the `profiles` table (with `role`: `user` | `admin`) and a trigger so new sign-ups get a profile with role `user` only.

## 4. Auth settings (optional)

In **Authentication → Providers → Email**:

- Enable **Email**.
- Optionally enable **Confirm email** so users must confirm before signing in.

## 5. Create an admin user

Admins are **not** created by sign-up. You must promote a user to admin in the database:

1. Sign up a normal user (or use an existing one).
2. In **Supabase Dashboard → Table Editor → profiles**, find that user and set `role` to `admin`.

Or run in SQL Editor:

```sql
update public.profiles set role = 'admin' where email = 'your-admin@example.com';
```

## 6. Admin login URL

- **User** login/sign-up: `/login` and `/signup` (linked from the main site).
- **Admin** login: **`/x7k9-admin`** — this URL is **not** linked from the public site so crawlers/robots won’t discover it. Only share it with admins. You can change the path in `src/config/admin.ts`.

## 7. Run the app

```bash
npm install
npm run dev
```

Then open `/login` or `/signup` to register as a user, or `/x7k9-admin` to sign in as an admin (after promoting a user to admin as in step 5).
