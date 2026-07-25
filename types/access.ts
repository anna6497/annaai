export type HskProductCode =
  | "hsk_1_free" | "hsk_2" | "hsk_3" | "hsk_4" | "hsk_5"
  | "hsk_6" | "hsk_7" | "hsk_8" | "hsk_9" | "hsk_full";

export interface HskProduct {
  code: HskProductCode;
  level: number | null;
  name: string;
  description: string;
  priceMmk: number;
  originalPriceMmk: number | null;
  lifetime: boolean;
  isFree: boolean;
  active: boolean;
}

export interface UserHskAccess {
  id: string;
  user_id: string;
  product_code: HskProductCode;
  level: number | null;
  lifetime: boolean;
  granted_at: string;
}

export interface VoiceTrialStatus {
  startedAt: string | null;
  expiresAt: string | null;
  secondsLimit: number;
  secondsUsed: number;
  secondsRemaining: number;
  expired: boolean;
  exhausted: boolean;
  available: boolean;
}
