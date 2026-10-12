import type { Metadata } from "next";
import { Archivo, Fragment_Mono } from "next/font/google";
import { Agentation } from "agentation";
import SmoothScroll from "@/components/SmoothScroll";
import StickyNav from "@/components/StickyNav";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const fragmentMono = Fragment_Mono({
  variable: "--font-fragment-mono",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Product Design & Branding",
  description:
    "Whether you're a founder looking for a partner in design and product strategy, or an established company working on new features, we can help.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${fragmentMono.variable}`}
    >
      <body>
        <SmoothScroll />
        <StickyNav />
        {children}
        {process.env.NODE_ENV === "development" && <Agentation />}
      </body>
    </html>
  );
}
