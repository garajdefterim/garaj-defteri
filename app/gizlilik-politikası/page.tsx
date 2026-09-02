export const dynamic = "force-dynamic";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gizlilik Politikas\u0131",
  description: "Garaj Defterim Gizlilik Politikas\u0131.",
};

export default function GizlilikPolitikasiPage() {
  return (
    <main className="legal-page">
      <section className="legal-card">
        <span className="legal-kicker">GARAJ DEFTERIM</span>

        <h1>{"Gizlilik Politikas\u0131"}</h1>

        <p className="legal-date">{"Son g\u00fcncelleme: 2 Eyl\u00fcl 2026"}</p>

        <p>
          {"Garaj Defterim olarak kullan\u0131c\u0131lar\u0131m\u0131z\u0131n gizlili\u011fine \u00f6nem veriyoruz. Bu Gizlilik Politikas\u0131, hizmetimizi kullan\u0131rken sa\u011flad\u0131\u011f\u0131n\u0131z bilgilerin hangi ama\u00e7larla i\u015flendi\u011fini ve korundu\u011funu genel olarak a\u00e7\u0131klar."}
        </p>

        <h2>{"Toplanan Bilgiler"}</h2>
        <p>
          {"Hesap olu\u015fturma ve hizmetin kullan\u0131m\u0131 s\u0131ras\u0131nda e-posta adresi, profil tercihleri, ara\u00e7 bilgileri, plaka, marka, model, bak\u0131m kay\u0131tlar\u0131 ve kullan\u0131c\u0131 taraf\u0131ndan girilen \u00f6nemli tarihler i\u015flenebilir."}
        </p>

        <h2>{"Bilgilerin Kullan\u0131m Amac\u0131"}</h2>
        <p>
          {"Toplanan bilgiler; hesab\u0131n\u0131z\u0131n \u00e7al\u0131\u015ft\u0131r\u0131lmas\u0131, ara\u00e7 kay\u0131tlar\u0131n\u0131z\u0131n saklanmas\u0131, se\u00e7ti\u011finiz bildirimlerin g\u00f6nderilmesi, hizmet g\u00fcvenli\u011finin sa\u011flanmas\u0131, destek taleplerinin yan\u0131tlanmas\u0131 ve hizmetin geli\u015ftirilmesi amac\u0131yla kullan\u0131labilir."}
        </p>

        <h2>{"Hizmet Sa\u011flay\u0131c\u0131lar\u0131"}</h2>
        <p>
          {"Garaj Defterim'in \u00e7al\u0131\u015fabilmesi i\u00e7in bar\u0131nd\u0131rma, kimlik do\u011frulama, veri saklama, g\u00fcvenlik ve e-posta g\u00f6nderimi gibi teknik hizmetlerden yararlan\u0131labilir. Bilgiler yaln\u0131zca hizmetin sunulmas\u0131 i\u00e7in gerekli oldu\u011fu \u00f6l\u00e7\u00fcde i\u015flenir."}
        </p>

        <h2>{"Bilgi G\u00fcvenli\u011fi"}</h2>
        <p>
          {"Kullan\u0131c\u0131 bilgilerinin korunmas\u0131 i\u00e7in makul teknik ve organizasyonel g\u00fcvenlik \u00f6nlemleri uygulan\u0131r. Bununla birlikte internet \u00fczerinden ger\u00e7ekle\u015ftirilen hi\u00e7bir veri aktar\u0131m veya saklama y\u00f6nteminin mutlak g\u00fcvenlik sa\u011flad\u0131\u011f\u0131 garanti edilemez."}
        </p>

        <h2>{"Kullan\u0131c\u0131 Tercihleri"}</h2>
        <p>
          {"Tema ve oturum tercihi gibi baz\u0131 ayarlar, hizmeti daha kullan\u0131\u015fl\u0131 hale getirmek amac\u0131yla taray\u0131c\u0131n\u0131zda saklanabilir."}
        </p>

        <h2>{"Politika De\u011fi\u015fiklikleri"}</h2>
        <p>
          {"Bu Gizlilik Politikas\u0131 gerekti\u011finde g\u00fcncellenebilir. G\u00fcncel politika bu sayfada yay\u0131mlan\u0131r ve son g\u00fcncelleme tarihi sayfan\u0131n \u00fcst b\u00f6l\u00fcm\u00fcnde belirtilir."}
        </p>

        <h2>{"\u0130leti\u015fim"}</h2>
        <p>
          {"Gizlilik politikam\u0131z veya ki\u015fisel bilgilerinizle ilgili soru ve talepleriniz i\u00e7in "}
          <a href="/destek">{"destek merkezimiz"}</a>
          {" \u00fczerinden bizimle ileti\u015fime ge\u00e7ebilirsiniz."}
        </p>
      </section>
    </main>
  );
}
