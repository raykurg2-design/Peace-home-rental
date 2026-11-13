import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Figtree } from "next/font/google";
import { RegisterSW } from "@/components/RegisterSW";
import "./globals.css";

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://peacehomerental.com"),
  title: {
    default: "Peace Home Rental — Homes for rent",
    template: "%s · Peace Home Rental",
  },
  description:
    "Find your next home with Peace Home Rental. Private rental listings, clear property information, and a smoother rental experience.",
  applicationName: "Peace Home Rental",
  appleWebApp: {
    capable: true,
    title: "Peace Home",
    statusBarStyle: "default",
  },
  openGraph: {
    title: "Peace Home Rental",
    description: "Safe, private & reliable homes you can trust.",
    images: [{ url: "/og.jpg", width: 1200, height: 630 }],
    type: "website",
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icons/icon-180.png", sizes: "180x180" }],
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#2C4A3E",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${figtree.variable} ${cormorant.variable} antialiased`}>
        {children}
        <RegisterSW />
      </body>
    </html>
  );
}
