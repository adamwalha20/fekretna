import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Cairo } from 'next/font/google';
import './globals.css';
import { I18nProvider } from '@/lib/i18n/context';
import { ThemeProvider } from '@/lib/theme/context';

const plusJakarta = Plus_Jakarta_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

const cairo = Cairo({
  variable: '--font-arabic',
  subsets: ['arabic', 'latin'],
  weight: ['500', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Fekretna | من فكرة لفريق — Trouve ton associé et bâtis ta startup',
  description:
    'Fekretna aide les étudiants universitaires et jeunes entrepreneurs tunisiens à trouver des compétences complémentaires, former leur équipe et créer leur startup.',
  keywords: [
    'startup Tunisie',
    'cofondateur Sfax',
    'associé Tunisie',
    'étudiants entrepreneurs',
    'Fekretna',
    'من فكرة لفريق',
  ],
  openGraph: {
    title: 'Fekretna — De ton idée à ton équipe',
    description: 'Trouve les bonnes personnes pour construire ton prochain projet ou lancer ta startup en Tunisie.',
    locale: 'fr_TN',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      className={`${plusJakarta.variable} ${cairo.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans bg-[var(--background)] text-[var(--foreground)] selection:bg-cyan-500 selection:text-slate-900 transition-colors duration-200">
        <ThemeProvider>
          <I18nProvider initialLocale="fr">
            {children}
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
