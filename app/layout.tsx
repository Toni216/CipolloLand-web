import type { Metadata } from "next";
import { Bebas_Neue, Special_Elite, Barlow_Condensed, Barlow } from "next/font/google";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  weight: "400",
  variable: "--font-bebas",
  subsets: ["latin"],
});

const specialElite = Special_Elite({
  weight: "400",
  variable: "--font-special-elite",
  subsets: ["latin"],
});

const barlowCondensed = Barlow_Condensed({
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
});

const barlow = Barlow({
  weight: ["300", "400", "500"],
  variable: "--font-barlow",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CipolloLand",
  description: "Servidor de Minecraft roleplay · Temporada 3: Apocalipsis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${bebasNeue.variable} ${specialElite.variable} ${barlowCondensed.variable} ${barlow.variable}`}
    >
      <body>
        {children}
      </body>
    </html>
  );
}