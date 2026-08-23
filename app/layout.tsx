import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Garaj Defteri",
    template: "%s | Garaj Defteri",
  },
  description:
    "Araçlarınızı, bakım kayıtlarınızı ve önemli tarihlerinizi tek panelden yönetin.",
  applicationName: "Garaj Defteri",
  keywords: [
    "araç takibi",
    "bakım takibi",
    "muayene",
    "sigorta",
    "seyrüsefer",
    "Garaj Defteri",
  ],
  authors: [{ name: "Garaj Defteri" }],
  creator: "Garaj Defteri",
  publisher: "Garaj Defteri",
  robots: {
    index: true,
    follow: true,
  },
};

const temaScripti = `
(function () {
  try {
    var tema = localStorage.getItem("garaj-defteri-tema");

    if (tema !== "acik" && tema !== "koyu") {
      tema = "acik";
    }

    document.documentElement.setAttribute("data-theme", tema);
  } catch (e) {
    document.documentElement.setAttribute("data-theme", "acik");
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: temaScripti,
          }}
        />
      </head>

      <body
        style={{
          fontFamily:
            "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif",
        }}
      >
        {children}
      </body>
    </html>
  );
}