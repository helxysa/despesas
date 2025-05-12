import { Metadata } from 'next';
import { UsuarioClient } from './componentes/UsuarioClient/UsuarioClient';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Usuario({ params }: PageProps) {
  const { id } = await params;

  return <UsuarioClient id={id} />;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;

  return {
    title: `Finanças do Usuário ${id}`,
  };
}