import { createClient } from "@/lib/supabase/server";

import type {
  HskLevel,
} from "@/types/hsk-vocabulary";

export type ServerHskAccessResult = {
  allowed: boolean;

  reason:
    | "free"
    | "authenticated"
    | "purchase_required";
};

export type HskAccessMap =
  Record<
    HskLevel,
    boolean
  >;

const HSK_LEVELS: HskLevel[] = [
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
];

export async function getServerHskAccess(
  level: HskLevel,
): Promise<ServerHskAccessResult> {
  /*
   * HSK 1 is always free.
   */
  if (level === 1) {
    return {
      allowed: true,
      reason: "free",
    };
  }

  const supabase =
    await createClient();

  const {
    data: {
      user,
    },
  } =
    await supabase.auth.getUser();

  if (!user) {
    return {
      allowed: false,
      reason: "authenticated",
    };
  }

  const {
    data,
    error,
  } = await supabase
    .from(
      "user_hsk_access",
    )
    .select(
      "product_code,level,lifetime",
    )
    .eq(
      "user_id",
      user.id,
    )
    .or(
      `product_code.eq.hsk_full,product_code.eq.hsk_${level},level.eq.${level}`,
    )
    .limit(1);

  if (error) {
    console.error(
      "HSK access check failed:",
      error,
    );

    return {
      allowed: false,
      reason:
        "purchase_required",
    };
  }

  const allowed =
    (data?.length ?? 0) >
    0;

  return {
    allowed,

    reason: allowed
      ? "free"
      : "purchase_required",
  };
}

/*
 * Get access status for
 * HSK 1–9 in ONE database query.
 *
 * Used by level selection pages.
 */
export async function getServerHskAccessMap(): Promise<HskAccessMap> {
  const result: HskAccessMap = {
    1: true,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false,
    7: false,
    8: false,
    9: false,
  };

  const supabase =
    await createClient();

  const {
    data: {
      user,
    },
  } =
    await supabase.auth.getUser();

  /*
   * Logged-out users:
   * only HSK 1 is available.
   */
  if (!user) {
    return result;
  }

  const {
    data,
    error,
  } = await supabase
    .from(
      "user_hsk_access",
    )
    .select(
      "product_code,level,lifetime",
    )
    .eq(
      "user_id",
      user.id,
    );

  if (error) {
    console.error(
      "HSK access map check failed:",
      error,
    );

    return result;
  }

  const rows =
    data ?? [];

  /*
   * Full package unlocks
   * HSK 2–9.
   */
  const hasFullPackage =
    rows.some(
      (row) =>
        row.product_code ===
        "hsk_full",
    );

  if (hasFullPackage) {
    for (
      const level of
      HSK_LEVELS
    ) {
      result[level] =
        true;
    }

    return result;
  }

  /*
   * Individual level access.
   */
  for (
    const level of
    HSK_LEVELS
  ) {
    if (level === 1) {
      continue;
    }

    result[level] =
      rows.some(
        (row) => {
          const rowLevel =
            Number(
              row.level,
            );

          return (
            row.product_code ===
              `hsk_${level}` ||
            rowLevel ===
              level
          );
        },
      );
  }

  return result;
}