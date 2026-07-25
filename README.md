Anna AI Payment Selector + THB Display Patch

Included:
- components/payment/PaymentMethodSelector.tsx
- components/payment/PaymentForm.tsx
- types/payment.ts
- lib/payment-products.ts

Changes:
- Payment selector shows text/radio only; QR images are removed from the top cards.
- The selected QR image appears only in the Scan QR section.
- KBZPay displays MMK.
- QR Pay displays THB.
- QR image and amount change automatically when the user switches methods.
- Existing slip upload and Supabase payment request flow are preserved.

Default THB prices:
- One HSK level: 100 THB
- HSK 2–9 Full Package: 250 THB
- Full Package original price: 800 THB

You can change these values in lib/payment-products.ts.

Install:
1. Extract into the project root and replace existing files.
2. Run:
   npm run type-check
   npm run build

Note:
The database continues storing amount_mmk as the canonical amount, so no database
migration is required.
