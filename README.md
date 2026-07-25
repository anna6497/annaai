# Anna AI Admin Portal V2 Patch

This ZIP uses your existing tables:

- `profiles`
- `payment_requests`
- `payment_requests_admin`
- `user_hsk_access`

It does **not** require `review_payment_request()`.

## Install

1. Extract this ZIP into the Anna AI project root.
2. Allow it to replace files with the same paths.
3. Confirm `.env.local` contains your existing Supabase URL, anon key, and service-role key used by `lib/supabase/admin.ts`.
4. Run:

```bash
npm run type-check
npm run build
```

## Routes

- `/admin` — summary dashboard
- `/admin/payments` — payment approval/rejection
- `/admin/users` — manual lifetime access management

## Approval behavior

Approve & Unlock directly:

1. updates `payment_requests` to `approved`;
2. inserts a lifetime row into `user_hsk_access`;
3. uses `product_code = hsk_full` and `level = null` for the full package;
4. uses `product_code = hsk_2 ... hsk_9` and matching numeric `level` for individual levels.

No SQL migration is included because the required tables and admin view already exist in your Supabase project.
