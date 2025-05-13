"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, User, LogOut, PiggyBank, CreditCard, BarChart3, Settings } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetTitle,
} from "@/components/ui/sheet";

interface NavItem {
  title: string;
  href: string;
  icon?: React.ReactNode;
  submenu?: NavItem[];
}

const navItems: NavItem[] = [
  {
    title: "Financeiro",
    href: "/usuario/:id/financeiro",
    icon: <BarChart3 className="h-4 w-4 mr-2" />,
  },
  {
    title: "Poupix",
    href: "/usuario/:id/poupix",
    icon: <PiggyBank className="h-4 w-4 mr-2" />,
  },

];

export function Navbar() {
  const pathname = usePathname();
  const [userId, setUserId] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  // Obter o ID do usuário do localStorage
  useEffect(() => {
    const id = localStorage.getItem("usuarioId");
    setUserId(id);
  }, []);

  // Detectar scroll para mudar o estilo da navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Substituir :id nas URLs pelo ID real do usuário
  const getHref = (href: string) => {
    if (userId) {
      return href.replace(":id", userId);
    }
    return href;
  };

  // Verificar se um link está ativo
  const isActive = (href: string) => {
    if (!userId) return false;

    const formattedHref = getHref(href);
    if (href.includes("?tab=")) {
      const [path, query] = formattedHref.split("?");
      return pathname.includes(path) && pathname.includes(query);
    }

    // Verificar se o pathname corresponde à rota atual
    if (pathname === formattedHref || pathname.startsWith(`${formattedHref}/`)) {
      return true;
    }

    // Verificar se a rota atual corresponde ao padrão da rota dinâmica
    const dynamicPathPattern = href.replace(":id", "\\w+");
    const regex = new RegExp(`^${dynamicPathPattern}(/.*)?$`);
    return regex.test(pathname);
  };

  // Renderizar links de navegação para mobile
  const renderMobileNavLinks = () => {
    return navItems.map((item) => {
      if (item.submenu) {
        return (
          <div key={item.title} className="space-y-2">
            <div
              className={cn(
                "flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md",
                openSubmenu === item.title
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-muted"
              )}
              onClick={() => setOpenSubmenu(openSubmenu === item.title ? null : item.title)}
            >
              <div className="flex items-center">
                {item.icon}
                {item.title}
              </div>
              <ChevronDown className={cn("h-4 w-4 transition-transform", openSubmenu === item.title && "rotate-180")} />
            </div>
            {openSubmenu === item.title && (
              <div className="ml-4 pl-2 border-l space-y-1">
                {item.submenu.map((subitem) => (
                  <SheetClose asChild key={subitem.title}>
                    <Link
                      href={getHref(subitem.href)}
                      className={cn(
                        "block px-3 py-2 text-sm rounded-md hover:bg-muted",
                        isActive(subitem.href) && "bg-primary/10 text-primary"
                      )}
                    >
                      {subitem.title}
                    </Link>
                  </SheetClose>
                ))}
              </div>
            )}
          </div>
        );
      }

      return (
        <SheetClose asChild key={item.title}>
          <Link
            href={getHref(item.href)}
            className={cn(
              "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
              isActive(item.href)
                ? "bg-primary/10 text-primary"
                : "hover:bg-muted"
            )}
          >
            {item.icon}
            {item.title}
          </Link>
        </SheetClose>
      );
    });
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur transition-all duration-200",
        isScrolled ? "shadow-md" : "shadow-sm"
      )}
    >
      <div className="container mx-auto px-6 max-w-full">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <PiggyBank className="h-7 w-7 text-green-500 mr-2" />
              <span className="font-bold text-2xl tracking-tight">
                Pou<span className="text-green-500">pix</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.title}
                  href={getHref(item.href)}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-md transition-all duration-200",
                    isActive(item.href)
                      ? "bg-primary/10 text-primary shadow-sm"
                      : "text-foreground/80 hover:text-foreground hover:bg-muted"
                  )}
                >
                  <div className="flex items-center">
                    {item.icon}
                    {item.title}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Right side: Theme toggle and user menu */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full border border-muted hover:bg-muted/50">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt="User" />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configurações</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Abrir menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[80%] sm:w-[350px]">
                <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between py-4">
                    <Link href="/" className="flex items-center">
                      <PiggyBank className="h-6 w-6 text-green-500 mr-2" />
                      <span className="font-bold text-xl">Poupix</span>
                    </Link>
                    <SheetClose asChild>
                      <Button variant="ghost" size="icon" className="rounded-full">
                        <X className="h-5 w-5" />
                        <span className="sr-only">Fechar menu</span>
                      </Button>
                    </SheetClose>
                  </div>

                  <div className="border-t my-4"></div>

                  <nav className="flex flex-col space-y-1">
                    {renderMobileNavLinks()}
                  </nav>

                  <div className="mt-auto">
                    <div className="border-t pt-4 mt-4">
                      <div className="flex items-center p-4 bg-muted/50 rounded-lg">
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarImage src="" alt="User" />
                          <AvatarFallback>
                            <User className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium">Usuário</span>
                          <span className="text-xs text-muted-foreground">usuario@email.com</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
