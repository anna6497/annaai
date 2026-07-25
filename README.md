Anna AI Direct QR Payment Fix

Included files:
- app/payment/page.tsx
- components/payment/PaymentForm.tsx
- public/payment/kbzpay-qr.png
- public/payment/promptpay-qr.png

What this fixes:
1. Payment page now reads ?product=... used by the HSK store.
2. It keeps ?hsk=... as a fallback for old links.
3. KBZPay and PromptPay QR images appear immediately on the payment page.
4. User can scan, pay, upload the slip, and submit for admin approval.

Expected product URLs:
- /payment?product=hsk_full
- /payment?product=hsk_2
- /payment?product=hsk_3
- through /payment?product=hsk_9

Install:
1. Extract the ZIP into the project root.
2. Replace the existing files.
3. Run:
   npm run type-check
   npm run build
4. Test Buy Full Package and Buy HSK 2.

Important:
The code assumes PaymentMethod uses "kpay" for KBZPay and another value
(such as "qrpay") for PromptPay. The current PaymentForm already defaulted
to "kpay", so this preserves the existing flow.
