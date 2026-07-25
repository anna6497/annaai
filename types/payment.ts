export type PaymentMethod = "kpay" | "qr_pay";
export type PaymentStatus = "pending" | "approved" | "rejected";

export interface PaymentProduct {
  code: string;
  title: string;
  description: string;
  level: number | null;
  priceMmk: number;
  priceThb: number;
  originalPriceMmk: number | null;
  originalPriceThb: number | null;
  active: boolean;
}

export interface PaymentRequestRow {
  id: string;
  user_id: string;
  product_code: string;
  product_title: string;
  amount_mmk: number;
  payment_method: PaymentMethod;
  status: PaymentStatus;
  slip_path: string;
  admin_note: string | null;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  user_email?: string | null;
  slip_signed_url?: string | null;
}
