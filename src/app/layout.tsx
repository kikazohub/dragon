import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { getSession } from "@/lib/auth";
import { getDragonByUser } from "@/lib/data";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dragon — cría a tu dragón imaginario",
  description:
    "Crea tu huevo, eclosiona, cuida y entrena a tu dragón imaginario. Con los días se vuelve más fuerte y conversa contigo conociendo tu historia.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const user = session ? { id: session.userId } : null;
  const dragon = user ? getDragonByUser(user.id) : null;

  return (
    <html lang="es" className={`${geistSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Nav dragon={dragon} />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
        <footer className="border-t border-white/5 py-6 text-center text-xs text-zinc-600">
          🐉 Tu dragón crece con los días. Vuelve mañana.
        </footer>
      </body>
    </html>
  );
}