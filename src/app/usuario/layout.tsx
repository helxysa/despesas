import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Gerenciador de Dívidas",
  description: "Aplicativo para gerenciar suas dívidas",
};

export default function UsuarioLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      <main>
        {children}
      </main>
    </>
  );
}
