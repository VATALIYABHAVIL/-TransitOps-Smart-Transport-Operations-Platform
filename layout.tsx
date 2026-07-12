import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "Transitops - Fleet Management Console",
  description: "Enterprise transit operations center for vehicle dispatching, driver routing, and expenses.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

