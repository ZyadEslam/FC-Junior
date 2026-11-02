import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: {
    default: "FC-Junior — Kids build, family cheers",
    template: "%s · FC-Junior",
  },
  description:
    "FC-Junior turns screen time into build time: friendly coding quests, a wall of proud creations, and cheers from the family fan club — all inside a private, parent-run space.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
