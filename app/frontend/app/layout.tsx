import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Shell } from "@/src/components/layout/shell";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WorkNet - Réseau Professionnel",
  description: "Connectez-vous avec vos collègues et collaborez efficacement",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning ici est nécessaire pour le script de thème
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script
          id="theme-strategy"
          dangerouslySetInnerHTML={{
            __html: `(function(){
              try {
                var t = localStorage.getItem('theme');
                var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (t === 'dark' || (!t && prefersDark)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            })();`,
          }}
        />
        {/* Préférer l'installation npm de Flowbite pour éviter les conflits DOM en SSR */}
      </head>
      <body
        suppressHydrationWarning
        className={`${inter.variable} ${geistMono.variable} antialiased bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200`}
      >
        <Providers>
          {/* Si l'erreur "bis_skin_checked" persiste sur /profile, 
              vérifie le composant Shell ou ProfilePage directement */}
          <Shell>
            {children}
          </Shell>
        </Providers>
        <Toaster position="top-right" richColors />

        {/* Script Flowbite à la fin pour ne pas bloquer l'hydratation initiale */}
        <script async src="https://cdn.jsdelivr.net/npm/flowbite@2.5.2/dist/flowbite.min.js"></script>
      </body>
    </html>
  );
}