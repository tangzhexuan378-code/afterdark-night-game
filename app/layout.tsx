import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000"),
  title: "AFTERDARK — 今晚，会发生什么？",
  description: "30 家真实热门酒吧、50 种音乐、50 种酒类与 100 个剧情种子，共同生成你的互动夜晚。",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: {
    title: "AFTERDARK — 你的互动夜晚",
    description: "选一首歌、一杯酒，让每个决定改写今晚。",
    type: "website",
    images: [{ url: "/og.png", width: 1733, height: 909, alt: "AFTERDARK — 今晚，会发生什么？" }],
  },
  twitter: { card: "summary_large_image", title: "AFTERDARK — 你的互动夜晚", description: "30×50×50×100，今晚会发生什么？", images: ["/og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
