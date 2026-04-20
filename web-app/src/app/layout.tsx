import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";

export const metadata: Metadata = {
  title: "Swastik | University Social Platform",
  description: "Connect, collaborate, and socialize within your university ecosystem. Verified students only.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-background selection:bg-primary/30">
        <AuthProvider>
          <main className="min-h-full">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
