import { createClient } from "@/lib/supabase/server";

export async function getUserHskAccess() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      userId: null,
      fullPackage: false,
      levels: new Set<number>([1]),
    };
  }

  const { data, error } = await supabase
    .from("user_hsk_access")
    .select("product_code,level")
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  const rows = data ?? [];
  const fullPackage = rows.some(
    (row) => row.product_code === "hsk_full",
  );

  const levels = new Set<number>([1]);

  for (const row of rows) {
    if (
      typeof row.level === "number" &&
      row.level >= 2 &&
      row.level <= 9
    ) {
      levels.add(row.level);
    }

    const match = /^hsk_([2-9])$/.exec(
      row.product_code ?? "",
    );

    if (match) {
      levels.add(Number(match[1]));
    }
  }

  if (fullPackage) {
    for (let level = 2; level <= 9; level += 1) {
      levels.add(level);
    }
  }

  return {
    userId: user.id,
    fullPackage,
    levels,
  };
}
