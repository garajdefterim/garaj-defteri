import { NextResponse } from "next/server";

export const runtime = "nodejs";

type DestekPayload = {
  adSoyad?: unknown;
  email?: unknown;
  konu?: unknown;
  mesaj?: unknown;
  website?: unknown;
};

const DESTEK_ALICI = "garajdefterim@gmail.com";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function metinDegeri(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function htmlEscape(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function satirlariHtmlYap(value: string) {
  return htmlEscape(value).replace(/\n/g, "<br />");
}

export async function POST(request: Request) {
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    const emailFrom =
      process.env.EMAIL_FROM?.trim() || "bildirim@garajdefterim.com";

    if (!resendApiKey) {
      console.error("Destek formu: RESEND_API_KEY bulunamadı.");

      return NextResponse.json(
        {
          success: false,
          message: "Destek servisi şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.",
        },
        { status: 503 }
      );
    }

    let body: DestekPayload;

    try {
      body = (await request.json()) as DestekPayload;
    } catch {
      return NextResponse.json(
        { success: false, message: "Geçersiz form verisi." },
        { status: 400 }
      );
    }

    const adSoyad = metinDegeri(body.adSoyad);
    const email = metinDegeri(body.email).toLowerCase();
    const konu = metinDegeri(body.konu);
    const mesaj = metinDegeri(body.mesaj);
    const website = metinDegeri(body.website);

    // Basit bot tuzağı. Gerçek kullanıcı bu alanı görmez.
    if (website) {
      return NextResponse.json({ success: true });
    }

    if (adSoyad.length < 2 || adSoyad.length > 80) {
      return NextResponse.json(
        { success: false, message: "Lütfen geçerli bir ad soyad girin." },
        { status: 400 }
      );
    }

    if (
      !EMAIL_REGEX.test(email) ||
      email.length < 5 ||
      email.length > 160
    ) {
      return NextResponse.json(
        { success: false, message: "Lütfen geçerli bir e-posta adresi girin." },
        { status: 400 }
      );
    }

    if (konu.length < 3 || konu.length > 120) {
      return NextResponse.json(
        { success: false, message: "Lütfen destek konusunu seçin." },
        { status: 400 }
      );
    }

    if (mesaj.length < 10 || mesaj.length > 4000) {
      return NextResponse.json(
        {
          success: false,
          message: "Mesajınız 10 ile 4000 karakter arasında olmalıdır.",
        },
        { status: 400 }
      );
    }

    const guvenliAdSoyad = htmlEscape(adSoyad);
    const guvenliEmail = htmlEscape(email);
    const guvenliKonu = htmlEscape(konu);
    const guvenliMesaj = satirlariHtmlYap(mesaj);

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `Garaj Defterim Destek <${emailFrom}>`,
        to: [DESTEK_ALICI],
        reply_to: email,
        subject: `Garaj Defterim Destek - ${konu}`,
        html: `
          <!doctype html>
          <html lang="tr">
            <body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f4f7fb;padding:28px 12px;">
                <tr>
                  <td align="center">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:640px;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
                      <tr>
                        <td style="padding:22px 26px;background:#0f172a;color:#ffffff;">
                          <div style="font-size:12px;font-weight:700;letter-spacing:1.2px;color:#93c5fd;">GARAJ DEFTERİM</div>
                          <div style="margin-top:6px;font-size:22px;font-weight:700;">Yeni Destek Talebi</div>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:26px;">
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td style="padding:0 0 8px;color:#64748b;font-size:12px;font-weight:700;">AD SOYAD</td>
                            </tr>
                            <tr>
                              <td style="padding:0 0 18px;font-size:15px;font-weight:600;">${guvenliAdSoyad}</td>
                            </tr>
                            <tr>
                              <td style="padding:0 0 8px;color:#64748b;font-size:12px;font-weight:700;">E-POSTA</td>
                            </tr>
                            <tr>
                              <td style="padding:0 0 18px;font-size:15px;"><a href="mailto:${guvenliEmail}" style="color:#2563eb;text-decoration:none;">${guvenliEmail}</a></td>
                            </tr>
                            <tr>
                              <td style="padding:0 0 8px;color:#64748b;font-size:12px;font-weight:700;">KONU</td>
                            </tr>
                            <tr>
                              <td style="padding:0 0 22px;font-size:15px;font-weight:600;">${guvenliKonu}</td>
                            </tr>
                            <tr>
                              <td style="padding:18px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;font-size:14px;line-height:1.7;">${guvenliMesaj}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:16px 26px;border-top:1px solid #e2e8f0;color:#64748b;font-size:11px;line-height:1.6;">
                          Bu ileti Garaj Defterim destek formu üzerinden gönderilmiştir. Bu e-postaya yanıt verdiğinizde kullanıcının adresine cevap gönderilir.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
          </html>
        `,
      }),
    });

    const resendData = await resendResponse.json().catch(() => null);

    if (!resendResponse.ok) {
      console.error("Destek formu Resend hatası:", resendData);

      return NextResponse.json(
        {
          success: false,
          message: "Destek talebiniz gönderilemedi. Lütfen kısa süre sonra tekrar deneyin.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Destek formu beklenmeyen hata:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.",
      },
      { status: 500 }
    );
  }
}
