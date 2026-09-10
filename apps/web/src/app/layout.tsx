import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "СпортМаркет — маркетплейс спортивных событий",
  description: "Билеты на спортивные события, аренда площадок и любительские мероприятия по городам России",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <Providers>
          <Header />
          <main className="mx-auto min-h-screen max-w-7xl px-4 py-6">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
