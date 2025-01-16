import type { Metadata } from "next";
import localFont from "next/font/local";
import { Inter } from "next/font/google";
import "./globals.css";
import ImageComponent from "next/image";
import logo from "@/public/android-chrome-512x512.png";

const inter = Inter({ subsets: ["latin"] });

const NEXT_PUBLIC_BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH;

export const metadata = {
  title: "Sign App",
  description: "PSPDFKIt Signing Demo Sample Application",
  metadataBase: `http://localhost:${process.env.PORT || 3000}`,
  link: {
    rel: "icon",
    href: NEXT_PUBLIC_BASE_PATH + "/favicon.ico",
    sizes: "16x16",
    type: "image/png",
  },
  // link: {
  //   rel: "icon",
  //   href: NEXT_PUBLIC_BASE_PATH + "/favicon-32x32.png",
  //   sizes: "32x32",
  //   type: "image/png",
  // },
  // link: {
  //   rel: "icon",
  //   href: NEXT_PUBLIC_BASE_PATH + "/android-chrome-192x192.png",
  //   sizes: "192x192",
  //   type: "image/png",
  // },
  // link: {
  //   rel: "icon",
  //   href: NEXT_PUBLIC_BASE_PATH + "/android-chrome-512x512.png",
  //   sizes: "512x512",
  //   type: "image/png",
  // },
  openGraph: {
    title: "Sign App",
    description: "PSPDFKIt Sign App",
    url: "",
    images: [
      {
        url: "",
        width: 800,
        height: 600,
      },
    ],
  },
};

const SFProText = localFont({
  src: [
    {
      path: "../fonts/SFProText-Light.ttf",
      weight: "300",
    },
    {
      path: "../fonts/SFProText-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/SFProText-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/SFProText-Semibold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../fonts/SFProText-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-sfprotext",
});

const SFProDisplay = localFont({
  src: [
    {
      path: "../fonts/SFDisplay-Regular.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-sfprodisplay",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
      className={SFProText.variable+" "+SFProDisplay.variable}
      >
        <nav style={{ display: "flex", alignItems: "center", margin: "10px" }}>
          <ImageComponent
            src={logo}
            width={50}
            className="inline-block"
            alt="plus icon"
          />
          <span
            style={{
              fontSize: "22px",
              fontWeight: "500",
              margin: "10px 10px",
            }}
          >
            PSPDFKit Sign App
          </span>
        </nav>
        {children}
      </body>
    </html>
  );
}
