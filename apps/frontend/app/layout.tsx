import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "VedaAI | AI Assessment Creator",
  description: "Create, generate, format, and download academic question papers and assessments using AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth" suppressHydrationWarning>
      <body
        className={`${outfit.variable} antialiased bg-slate-950 text-slate-100 min-h-screen flex flex-col`}
      >
        {/* Subtle background glow effect */}
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-500/10 via-transparent to-transparent pointer-events-none -z-10" />
        <div className="absolute top-[20%] right-[10%] w-[300px] h-[300px] bg-violet-600/10 blur-[120px] rounded-full pointer-events-none -z-10" />
        <div className="absolute top-[60%] left-[5%] w-[400px] h-[400px] bg-blue-600/5 blur-[150px] rounded-full pointer-events-none -z-10" />
        
        {/* Main Content */}
        <main className="flex-grow flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
