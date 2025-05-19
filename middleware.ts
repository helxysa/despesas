import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Obter o cookie de autenticação do Firebase
  const authToken = request.cookies.get('firebase-auth-token');
  
  // Verificar se o usuário está tentando acessar uma rota protegida
  const isAccessingProtectedRoute = request.nextUrl.pathname.startsWith('/usuario');
  const isAccessingAuthRoute = request.nextUrl.pathname.startsWith('/login');

  // Se estiver acessando uma rota protegida e não estiver autenticado
  if (isAccessingProtectedRoute && !authToken) {
    // Redirecionar para a página de login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Se estiver autenticado e tentando acessar a página de login
  if (authToken && isAccessingAuthRoute) {
    // Extrair o UID do token (assumindo que o token contém o UID)
    // Em uma implementação real, você decodificaria o JWT para obter o UID
    const uid = authToken.value.split('.')[0]; // Simplificação para exemplo
    
    // Redirecionar para a página de dashboard
    return NextResponse.redirect(new URL('/usuario/financeiro', request.url));
  }

  return NextResponse.next();
}

// Configurar quais rotas o middleware deve ser executado
export const config = {
  matcher: ['/usuario/:path*', '/login']
};
