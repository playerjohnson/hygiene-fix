import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HygieneFix — Food Hygiene Rating Recovery",
  description:
    "Check your food hygiene rating, understand your scores, and get a personalised action plan to improve. Trusted by UK food businesses.",
  keywords: [
    "food hygiene rating",
    "improve food hygiene rating",
    "food hygiene rating 1",
    "food hygiene rating 2",
    "food hygiene score",
    "FHRS improvement",
    "food safety consultant",
    "re-inspection",
    "Safer Food Better Business",
  ],
  openGraph: {
    title: "HygieneFix — Food Hygiene Rating Recovery",
    description:
      "Check your food hygiene rating and get a personalised improvement action plan.",
    type: "website",
    locale: "en_GB",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Nunito+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased bg-brand-navy text-white min-h-screen">
        {children}
      </body>
    </html>
  );
}
