import { Inter, Noto_Sans_Kannada } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import Navbar from "@/components/Navbar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const notoKannada = Noto_Sans_Kannada({
  variable: "--font-noto-kannada",
  subsets: ["kannada"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata = {
  title: "MEDNOVA | Rural Healthcare Triage & Referral Network",
  description: "Bilingual clinical decision support system and real-time hospital route optimizer for frontline ASHA workers and PHCs.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${notoKannada.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans" suppressHydrationWarning>
        <LanguageProvider>
          <Navbar />
          <main className="flex-1 flex flex-col">
            {children}
          </main>
        </LanguageProvider>
      </body>
    </html>
  );
}
