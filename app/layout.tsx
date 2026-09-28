import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata = {title: "SkanMakery — Create. Share. Scan.",description: "Create QR codes for links, text, files, Wi-Fi, contacts and more."};
export default function RootLayout({ children }: { children: React.ReactNode }) {return (<html lang="en"><body>{children}</body></html>);}