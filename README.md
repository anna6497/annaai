# Anna AI Final Type Fixes

Copy all ZIP contents into the project root and replace matching files.

Then run:

```powershell
node scripts/apply-final-type-fixes.mjs
npm run type-check
```

Full replacements included:

- `app/admin/actions.ts`
- `app/admin/page.tsx`
- `lib/load-hanzi-data.ts`

The patch script safely updates these existing full files without removing their UI or business logic:

- `app/hsk/flashcards/[level]/FlashcardsClient.tsx`
- `app/hsk/writing/[level]/WritingClient.tsx`
- `app/hsk/writing/[level]/lessons/page.tsx`
- `components.example/FlashcardsDataExample.tsx`
