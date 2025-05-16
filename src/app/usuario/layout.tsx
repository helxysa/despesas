import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";



export const metadata: Metadata = {
  title: "Gerenciador de Dívidas",
  description: "Aplicativo para gerenciar suas dívidas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" >
      <body className={``} suppressHydrationWarning>
          <Navbar />
          <main>
            {children}
          </main>
        
      </body>
    </html>
  );
}
