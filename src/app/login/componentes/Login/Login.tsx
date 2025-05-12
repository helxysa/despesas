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
import { LogIn, UserPlus } from "lucide-react";
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
        router.push(`usuario/${user.uid}`);
      } else {
        // Login com usuário existente
        const user = await signIn(data.email, data.password);
        // Redirecionar após login bem-sucedido
        router.push(`usuario/${user.uid}`);  
      }
    } catch (error: any) {
      setError(error.message || "Falha ao processar a solicitação");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">
          {isRegistering ? "Criar Conta" : "Login"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {isRegistering 
            ? "Preencha os dados para criar sua conta" 
            : "Entre com suas credenciais"}
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {error && <p className="text-destructive text-sm">{error}</p>}
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isRegistering ? (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Criar Conta
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" />
                Entrar
              </>
            )}
          </Button>
          
          <div className="text-center mt-4">
            <Button
              type="button"
              variant="link"
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-sm"
            >
              {isRegistering 
                ? "Já tem uma conta? Faça login" 
                : "Não tem uma conta? Cadastre-se"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}