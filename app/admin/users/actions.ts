"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const VALID_PRODUCTS = [
  "hsk_2",
  "hsk_3",
  "hsk_4",
  "hsk_5",
  "hsk_6",
  "hsk_7",
  "hsk_8",
  "hsk_9",
  "hsk_full",
] as const;

type ProductCode = (typeof VALID_PRODUCTS)[number];

function readInput(formData: FormData) {
  const userId = String(formData.get("userId") ?? "").trim();
  const productCode = String(formData.get("productCode") ?? "").trim();

  if (!userId) throw new Error("User ID is required.");
  if (!VALID_PRODUCTS.includes(productCode as ProductCode)) {
    throw new Error("Invalid product.");
  }

  return { userId, productCode: productCode as ProductCode };
}

function levelFromProduct(productCode: ProductCode) {
  if (productCode === "hsk_full") return null;
  return Number(productCode.replace("hsk_", ""));
}

function refresh() {
  ["/admin", "/admin/users", "/dashboard", "/hsk/store"].forEach(
    (path) => revalidatePath(path),
  );
}

export async function grantLifetimeAccess(formData: FormData) {
  const { user } = await requireAdmin();
  const { userId, productCode } = readInput(formData);
  const admin = createSupabaseAdminClient();

  const { data: existing, error: findError } = await admin
    .from("user_hsk_access")
    .select("id")
    .eq("user_id", userId)
    .eq("product_code", productCode)
    .limit(1);

  if (findError) throw new Error(findError.message);

  if ((existing?.length ?? 0) === 0) {
    const { error } = await admin.from("user_hsk_access").insert({
      user_id: userId,
      product_code: productCode,
      level: levelFromProduct(productCode),
      lifetime: true,
      granted_at: new Date().toISOString(),
      granted_by: user.id,
      notes: "Granted manually by admin",
      source: "admin_manual",
    });

    if (error) throw new Error(error.message);
  }

  refresh();
}

export async function revokeLifetimeAccess(formData: FormData) {
  await requireAdmin();
  const { userId, productCode } = readInput(formData);
  const admin = createSupabaseAdminClient();

  const { error } = await admin
    .from("user_hsk_access")
    .delete()
    .eq("user_id", userId)
    .eq("product_code", productCode);

  if (error) throw new Error(error.message);

  refresh();
}
