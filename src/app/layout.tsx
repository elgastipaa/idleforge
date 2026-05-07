import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Relic Forge Idle",
  description: "A text and card based idle RPG about relic hunting, loot, town upgrades, and prestige."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
