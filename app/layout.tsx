import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LeadRat — Real Estate CRM",
  description: "A workspace for real estate leads, properties, follow-ups, site visits and sales performance.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
