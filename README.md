Anna AI payment product code fix

Problem:
The store links used:
- hsk-full-package
- hsk-2 ... hsk-9

But lib/payment-products.ts defines:
- hsk_full
- hsk_2 ... hsk_9

Included files:
- components/hsk/HskStoreGrid.tsx
- lib/payment-products.ts

Installation:
1. Extract this ZIP into the project root.
2. Replace the existing files.
3. Run:
   npm run type-check
   npm run build
4. Test:
   /payment?product=hsk_full
   /payment?product=hsk_2

No database changes are required for this fix.
