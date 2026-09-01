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

    const beniHatirla = beniHatirlaTercihiniOku();

    const anaDepo = beniHatirla
      ? localStorage
      : sessionStorage;

    const yedekDepo = beniHatirla
      ? sessionStorage
      : localStorage;

    return anaDepo.getItem(key) ?? yedekDepo.getItem(key);
  },

  setItem(key, value) {
    if (!tarayiciHazirMi()) {
      return;
    }

    const beniHatirla = beniHatirlaTercihiniOku();

    const anaDepo = beniHatirla
      ? localStorage
      : sessionStorage;

    const digerDepo = beniHatirla
      ? sessionStorage
      : localStorage;

    anaDepo.setItem(key, value);

    // Aynı Supabase auth kaydının iki depoda birden kalmasını engelle.
    digerDepo.removeItem(key);
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
      flowType: "pkce",
      storage: authStorage,
    },
  }
);
