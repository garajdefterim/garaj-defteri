export const metadata = {
  title: "Hakkımızda",
  description: "Garaj Defterim hakkında bilgi edinin.",
};

export default function HakkimizdaPage() {
  return (
    <main className="legal-page">
      <section className="legal-card">
        <span className="legal-kicker">GARAJ DEFTERİM</span>

        <h1>Hakkımızda</h1>

        <p>
          Garaj Defterim, araç sahiplerinin araç bilgilerini, bakım geçmişini
          ve önemli tarihlerini tek bir yerde düzenli biçimde takip edebilmesi
          için geliştirilmiş dijital bir araç takip platformudur.
        </p>

        <p>
          Amacımız; muayene, sigorta, seyrüsefer ve periyodik bakım gibi araç
          sahipleri için önemli süreçlerin takibini kolaylaştırmak, kayıtların
          düzenli tutulmasına yardımcı olmak ve günlük araç yönetimini daha
          pratik hale getirmektir.
        </p>

        <p>
          Garaj Defterim, kullanıcıların kendi araçlarına ait bilgileri
          yönetebildiği kişisel bir takip hizmetidir. Platformda gösterilen
          hatırlatmalar bilgilendirme amacı taşır. Resmî işlem ve tarihler için
          ilgili kurumların güncel duyurularının kontrol edilmesi gerekir.
        </p>

        <p>
          Soru, öneri veya destek talepleriniz için{" "}
          <a href="/destek">destek merkezimizi</a> kullanabilirsiniz.
        </p>
      </section>
    </main>
  );
}
