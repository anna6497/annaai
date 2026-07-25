export type PaymentStatus =
  | "pending"
  | "approved"
  | "rejected";

export function paymentStatusLabel(status: PaymentStatus) {
  switch (status) {
    case "approved":
      return "Approved";
    case "rejected":
      return "Rejected";
    default:
      return "Pending";
  }
}

export function paymentStatusClass(status: PaymentStatus) {
  switch (status) {
    case "approved":
      return "bg-emerald-500/15 text-emerald-200";
    case "rejected":
      return "bg-rose-500/15 text-rose-200";
    default:
      return "bg-amber-500/15 text-amber-200";
  }
}
