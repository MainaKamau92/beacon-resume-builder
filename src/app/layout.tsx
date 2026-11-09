import type { Metadata } from "next";
import {
  Instrument_Sans,
  IBM_Plex_Mono,
  Source_Serif_4,
} from "next/font/google";
import "./globals.css";
import { StoreHydration } from "@/components/StoreHydration";

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-instrument-sans",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-source-serif",
});

export const metadata: Metadata = {
  title: "Beacon — Build a resume for the job you want",
  description:
    "Import your resume, tailor it to a job description, and export a polished PDF.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${instrumentSans.variable} ${plexMono.variable} ${sourceSerif.variable} font-sans antialiased`}
      >
        <StoreHydration />
        {children}
      </body>
    </html>
  );
}
