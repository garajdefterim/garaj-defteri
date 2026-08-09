import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Garaj Defteri",
  description: "Araçlarınızı, bakımlarınızı ve önemli tarihlerinizi yönetin.",
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

      <body>{children}</body>
    </html>
  );
}