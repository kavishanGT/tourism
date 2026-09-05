import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { QueryProvider } from "@/lib/query/query-provider";
import { AuthProvider } from "@/features/auth/context/auth-context";
import { AiFloatingTrigger } from "@/components/ai/ai-floating-trigger";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Sri Lanka Tourism",
    template: "%s | Sri Lanka Tourism",
  },
  description:
    "Discover destinations, attractions and experiences across Sri Lanka.",
  keywords: ["Sri Lanka", "tourism", "travel", "destinations", "attractions"],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Sri Lanka Tourism",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <QueryProvider>
          <AuthProvider>
            {children}
            <AiFloatingTrigger />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
