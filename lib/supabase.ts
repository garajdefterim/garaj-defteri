import {
  createClient,
  type SupportedStorage,
} from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Supabase ortam değişkenleri bulunamadı."
  );
}

const BENI_HATIRLA_KEY =
  "garaj-defteri-beni-hatirla";

export const HATIRLANAN_EMAIL_KEY =
  "garaj-defteri-hatirlanan-email";

function tarayiciHazirMi() {
  return typeof window !== "undefined";
}

export function beniHatirlaTercihiniOku() {
  if (!tarayiciHazirMi()) {
    return false;
  }

  return (
    localStorage.getItem(BENI_HATIRLA_KEY) ===
    "true"
  );
}

export function beniHatirlaAyarla(
  beniHatirla: boolean
) {
  if (!tarayiciHazirMi()) {
    return;
  }

  localStorage.setItem(
    BENI_HATIRLA_KEY,
    beniHatirla ? "true" : "false"
  );
}

/*
 * Supabase auth verisi için storage seçimi:
 * - Beni hatırla açık  -> localStorage
 * - Beni hatırla kapalı -> sessionStorage
 *
 * getItem iki depoyu da okuyabilir. Böylece kullanıcı tercihi
 * değiştiğinde veya önceki sürümden kalan session olduğunda
 * oturum aniden kaybolmaz.
 */
const authStorage: SupportedStorage = {
  getItem(key) {
    if (!tarayiciHazirMi()) {
      return null;
    }

    const kalici =
      localStorage.getItem(key);

    const oturumluk =
      sessionStorage.getItem(key);

    if (beniHatirlaTercihiniOku()) {
      return kalici ?? oturumluk;
    }

    return oturumluk ?? kalici;
  },

  setItem(key, value) {
    if (!tarayiciHazirMi()) {
      return;
    }

    if (beniHatirlaTercihiniOku()) {
      localStorage.setItem(key, value);
      sessionStorage.removeItem(key);
      return;
    }

    sessionStorage.setItem(key, value);
    localStorage.removeItem(key);
  },

  removeItem(key) {
    if (!tarayiciHazirMi()) {
      return;
    }

    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  },
};

export const supabase = createClient(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: "implicit",
      storage: authStorage,
    },
  }
);
