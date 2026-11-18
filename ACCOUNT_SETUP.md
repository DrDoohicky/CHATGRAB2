# ChatGrab private accounts setup
1. Create a Supabase project. In Authentication settings enable email/password signups and email confirmation, configure Site URL and redirect URL to the ChatGrab deployment.
2. In SQL Editor execute supabase/schema.sql (owner scoped RLS). Verify policies before inviting users.
3. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY as Vercel environment variables for the desired environments (publishable / anon key, never service-role key).
4. Redeploy, register two separate test users, verify A's records cannot be retrieved by B through the API and UI, then test sign-out, password reset, browser refresh and mobile sign-in.
5. Guest browser-local data is never silently migrated. Export a backup before clearing browser storage. Add an explicit import-to-account flow with confirmation for any migration.
6. Production readiness: add abuse rate limiting, retention/deletion controls, backup, account deletion, privacy policy, security review, and explicit opt-in for AI transmission.
Current profile uses auth.user_metadata. Do not describe sign-up or cloud sync as available until Supabase is configured and end-to-end tests pass.
