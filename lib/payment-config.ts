export const PAYMENT_CONFIG = {
  kpay: {
    label: "KPay",
    accountName:
      process.env.NEXT_PUBLIC_KPAY_ACCOUNT_NAME ?? "Anna AI",
    accountNumber:
      process.env.NEXT_PUBLIC_KPAY_ACCOUNT_NUMBER ?? "09XXXXXXXXX",
    qrImage: "/payments/kbzpay-qr.png",
  },

  qr_pay: {
    label: "QR Pay",
    accountName:
      process.env.NEXT_PUBLIC_QR_PAY_ACCOUNT_NAME ?? "Anna AI",
    accountNumber:
      process.env.NEXT_PUBLIC_QR_PAY_ACCOUNT_NUMBER ?? "PromptPay QR",
    qrImage: "/payments/promptpay-qr.png",
  },
} as const;
