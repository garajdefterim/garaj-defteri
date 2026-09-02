export const dynamic = "force-dynamic";
export const metadata = {
  title: "Kullanım Koşulları",
  description: "Garaj Defterim Kullanım Koşulları.",
};

export default function KullanimKosullariPage() {
  return (
    <main className="legal-page">
      <section className="legal-card">
        <span className="legal-kicker">GARAJ DEFTERİM</span>

        <h1>Kullanım Koşulları</h1>

        <p className="legal-date">Son güncelleme: 2 Eylül 2026</p>

        <p>
          Garaj Defterim hizmetini kullanarak aşağıdaki kullanım koşullarını
          kabul etmiş olursunuz. Hizmeti kullanmadan önce bu koşulları
          dikkatlice okumanızı öneririz.
        </p>

        <h2>Hizmetin Amacı</h2>

        <p>
          Garaj Defterim; kullanıcıların araç bilgilerini, bakım kayıtlarını,
          muayene, sigorta, seyrüsefer ve diğer önemli tarihlerini düzenli
          şekilde kaydetmesine ve takip etmesine yardımcı olan dijital bir
          araç takip hizmetidir.
        </p>

        <h2>Kullanıcı Sorumluluğu</h2>

        <p>
          Hesabınıza eklediğiniz araç, bakım, tarih ve diğer bilgilerin doğru
          ve güncel tutulması sizin sorumluluğunuzdadır. Hesap bilgilerinizin
          güvenliğini korumak ve hesabınızın yetkisiz kullanımını önlemek için
          gerekli özeni göstermeniz gerekir.
        </p>

        <h2>Hatırlatmalar ve Bildirimler</h2>

        <p>
          Garaj Defterim tarafından sunulan muayene, sigorta, seyrüsefer,
          bakım ve benzeri hatırlatmalar kullanıcıya yardımcı olmak amacıyla
          sağlanan bilgilendirme hizmetleridir.
        </p>

        <p>
          Bildirimlerin ulaşmaması, gecikmesi veya kullanıcı tarafından
          girilen bilgilerin hatalı olması nedeniyle resmî yükümlülüklerin
          yerine getirilmemesinden Garaj Defterim sorumlu tutulamaz.
        </p>

        <h2>Resmî Bilgiler</h2>

        <p>
          Platform üzerinde gösterilen tarihler ve hatırlatmalar resmî kurum
          kayıtlarının yerine geçmez. Muayene ve diğer yasal işlemler için
          ilgili kurumların güncel kayıtları, mevzuatı ve duyuruları esas
          alınmalıdır.
        </p>

        <h2>Hizmetin Kullanımı</h2>

        <p>
          Garaj Defterim yalnızca hukuka uygun amaçlarla kullanılabilir.
          Hizmetin güvenliğini bozacak, diğer kullanıcıların kullanımını
          engelleyecek veya sistemlere yetkisiz erişim sağlamaya yönelik
          faaliyetlerde bulunulamaz.
        </p>

        <h2>Hizmet Değişiklikleri</h2>

        <p>
          Garaj Defterim'in özellikleri; güvenlik, teknik gereklilikler,
          mevzuat değişiklikleri veya hizmet kalitesini geliştirmek amacıyla
          zaman içerisinde değiştirilebilir veya güncellenebilir.
        </p>

        <h2>Kullanım Koşullarındaki Değişiklikler</h2>

        <p>
          Bu kullanım koşulları gerektiğinde güncellenebilir. Güncel koşullar
          bu sayfada yayımlanır ve son güncelleme tarihi sayfanın üst
          bölümünde belirtilir.
        </p>

        <h2>İletişim</h2>

        <p>
          Kullanım koşulları veya Garaj Defterim hizmetiyle ilgili soru ve
          talepleriniz için{" "}
          <a href="/destek">destek merkezimiz</a> üzerinden bizimle iletişime
          geçebilirsiniz.
        </p>
      </section>
    </main>
  );
}
