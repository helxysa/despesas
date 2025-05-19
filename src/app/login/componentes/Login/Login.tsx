"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { signIn, createUser } from "../../actions/actions";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LogIn, UserPlus, PiggyBank } from "lucide-react";
import { useRouter } from "next/navigation";

// Definindo o esquema de validação com Zod
const loginSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres" }),
});

// Tipo inferido do esquema
type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const router = useRouter();

  // Inicializando o formulário com react-hook-form e zod
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Função para lidar com o envio do formulário
  const onSubmit = async (data: LoginFormValues) => {
    setError("");
    setIsLoading(true);

    try {
      if (isRegistering) {
        // Criar novo usuário
        const user = await createUser(data.email, data.password);

        // Redirecionar após registro bem-sucedido
        if (user) router.push(`/usuario/${user.uid}/financeiro`);
      } else {
        // Login com usuário existente
        const user = await signIn(data.email, data.password);
        // Redirecionar após login bem-sucedido
        if (user) router.push(`/usuario/${user.uid}/financeiro`);
      }
    } catch (error: any) {
      // Exibir apenas a mensagem de erro amigável, não o erro completo
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Falha ao processar a solicitação");
      }
      // Não fazer console.error aqui para evitar mostrar o erro no console
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full mx-auto p-6 md:p-10 space-y-6">
      {/* Mobile-only logo display */}
      <div className="flex md:hidden justify-center mb-8">
        <div className="flex items-center">
          <div className="bg-green-500/10 p-2 rounded-full">
            <PiggyBank className="h-8 w-8 text-green-500" />
          </div>
          <span className="font-bold text-2xl tracking-tight ml-2">
            Pou<span className="text-green-500">pix</span>
          </span>
        </div>
      </div>

      <div className="text-center">
        <h1 className="text-3xl font-bold">
          {isRegistering ? "Criar Conta" : "Bem-vindo de volta"}
        </h1>
        <p className="text-muted-foreground mt-3">
          {isRegistering
            ? "Preencha os dados para criar sua conta"
            : "Entre com suas credenciais para acessar"}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    {...field}
                    disabled={isLoading}
                    className="h-12 text-base"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="******"
                    {...field}
                    disabled={isLoading}
                    className="h-12 text-base"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {error && <p className="text-destructive text-sm">{error}</p>}

          <Button
            type="submit"
            className="w-full h-12 text-base font-medium bg-green-500 hover:bg-green-600 text-white"
            disabled={isLoading}
          >
            {isRegistering ? (
              <>
                <UserPlus className="mr-2 h-5 w-5" />
                Criar Conta
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-5 w-5" />
                Entrar
              </>
            )}
          </Button>

          <div className="text-center mt-6">
            <p className="text-muted-foreground text-sm mb-2">
              {isRegistering
                ? "Já possui uma conta?"
                : "Ainda não tem uma conta?"}
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-sm w-full"
            >
              {isRegistering
                ? "Fazer login"
                : "Criar uma conta"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
