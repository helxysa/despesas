import { Metadata } from 'next';
import { PoupixClient } from './componenetes/PoupixClient/PoupixClient';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PoupixPage({ params }: PageProps) {
  const { id } = await params;

  return <PoupixClient id={id} />;
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Poupix - Cofrinhos Virtuais`,
    description: 'Gerencie seus cofrinhos virtuais e economize para seus objetivos',
  };
}