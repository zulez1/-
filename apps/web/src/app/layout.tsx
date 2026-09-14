import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Header } from "@/components/Header";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "СпортМаркет — маркетплейс спортивных событий",
  description: "Билеты на спортивные события, аренда площадок и любительские мероприятия по городам России",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={inter.variable}>
      <body className="font-sans">
        <Providers>
          <Header />
          <main className="mx-auto min-h-screen max-w-7xl px-4 py-6">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
