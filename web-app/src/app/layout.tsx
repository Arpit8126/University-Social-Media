import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Campus | The Student Social Network",
  description: "Connect, collaborate, and socialize within your university ecosystem.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-background selection:bg-primary/30">
        <main className="min-h-full">
          {children}
        </main>
      </body>
    </html>
  );
}
