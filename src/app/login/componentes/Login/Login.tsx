"use client";

import { useState, useEffect } from "react";
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
import { LogIn, UserPlus, PiggyBank, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

// Schemas separados para login e cadastro
const loginSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres" }),
});

const registerSchema = loginSchema.extend({
  confirmPassword: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

// Tipos separados para login e cadastro
type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

type FormValues = LoginFormValues | RegisterFormValues;

export default function LoginForm() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  // Usar o schema correto conforme o modo
  const form = useForm<FormValues>({
    resolver: zodResolver(isRegistering ? registerSchema : loginSchema),
    defaultValues: isRegistering
      ? { email: "", password: "", confirmPassword: "" }
      : { email: "", password: "" },
  });

  // Resetar o formulário quando o modo mudar
  useEffect(() => {
    form.reset(
      isRegistering
        ? { email: form.getValues("email"), password: "", confirmPassword: "" }
        : { email: form.getValues("email"), password: "" }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRegistering]);

  const toggleRegister = () => {
    setIsRegistering((prev) => !prev);
  };

  // Função para lidar com o envio do formulário
  const onSubmit = async (data: LoginFormValues) => {
    setError("");
    setIsLoading(true);
    console.log("=== INÍCIO DO ENVIO DO FORMULÁRIO ===");
    console.log("Modo:", isRegistering ? "Registro" : "Login");

    try {
      if (isRegistering) {
        console.log("Iniciando processo de registro...");
        const user = await createUser(data.email, data.password);
        console.log("Resultado do registro:", user);
        
        if (!user) {
          setError("Este email já está em uso ou a senha é muito fraca");
          return;
        }
        console.log("Redirecionando após registro...");
        router.push(`/usuario/${user.uid}/financeiro`);
      } else {
        console.log("Iniciando processo de login...");
        const user = await signIn(data.email, data.password);
        console.log("Resultado do login:", user);
        
        if (!user) {
          setError("Email ou senha incorretos");
          return;
        }
        if (user.uid) {
          console.log("Redirecionando após login...");
          router.push(`/usuario/${user.uid}/financeiro`);
        } else {
          console.log("Erro: usuário sem UID");
          setError("Erro ao fazer login. Tente novamente.");
        }
      }
    } catch (error) {
      console.log("Erro no processo:", error);
      setError("Ocorreu um erro. Por favor, tente novamente.");
    } finally {
      setIsLoading(false);
      console.log("=== FIM DO ENVIO DO FORMULÁRIO ===");
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
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="******"
                      {...field}
                      disabled={isLoading}
                      className="h-12 text-base pr-12"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-12 px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-500" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-500" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem className={!isRegistering ? "hidden" : ""}>
                <FormLabel>Confirmar Senha</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="******"
                      {...field}
                      disabled={isLoading}
                      className="h-12 text-base pr-12"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-12 px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-500" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-500" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {error && (
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive text-destructive text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-12 text-base font-medium bg-green-500 hover:bg-green-600 text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin mr-2 h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                {isRegistering ? "Criando conta..." : "Entrando..."}
              </>
            ) : isRegistering ? (
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
              onClick={toggleRegister}
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
