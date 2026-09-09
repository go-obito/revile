import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Revile — Look closer. Think deeper.", description: "A personal publication about culture, technology, football and the beautiful mess of being human." };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="en"><body>{children}</body></html>;
}
