import { createClient, type SupportedStorage } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase ortam değişkenleri bulunamadı.");
}

const BENI_HATIRLA_KEY = "garaj-defteri-beni-hatirla";

function tarayiciHazirMi() {
  return typeof window !== "undefined";
}

export function beniHatirlaTercihiniOku() {
  if (!tarayiciHazirMi()) {
    return false;
  }

  return localStorage.getItem(BENI_HATIRLA_KEY) === "true";
}

export function beniHatirlaAyarla(beniHatirla: boolean) {
  if (!tarayiciHazirMi()) {
    return;
  }

  localStorage.setItem(
    BENI_HATIRLA_KEY,
    beniHatirla ? "true" : "false"
  );
}

const authStorage: SupportedStorage = {
  getItem(key) {
    if (!tarayiciHazirMi()) {
      return null;
    }

    return beniHatirlaTercihiniOku()
      ? localStorage.getItem(key)
      : sessionStorage.getItem(key);
  },

  setItem(key, value) {
    if (!tarayiciHazirMi()) {
      return;
    }

    if (beniHatirlaTercihiniOku()) {
      localStorage.setItem(key, value);
      sessionStorage.removeItem(key);
    } else {
      sessionStorage.setItem(key, value);
      localStorage.removeItem(key);
    }
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
