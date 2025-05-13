import { redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Usuario({ params }: PageProps) {
  const { id } = await params;
  redirect(`/usuario/${id}/financeiro`);
}