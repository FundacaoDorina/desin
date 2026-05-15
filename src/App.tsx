import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FormEvent, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { clearAccessToken, hasAccessToken, setAccessToken } from "@/lib/accessSession";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(hasAccessToken());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleLogout = () => {
    clearAccessToken();
    queryClient.clear();
    setIsAuthenticated(false);
    setPassword("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const raw = await response.text();
      let data: { token?: string; error?: string };
      try {
        data = raw ? (JSON.parse(raw) as { token?: string; error?: string }) : {};
      } catch {
        throw new Error(
          response.status === 404
            ? "Rota de autenticação indisponível. Reinicie o servidor de desenvolvimento."
            : "Resposta inválida do servidor."
        );
      }

      if (!response.ok || !data.token) {
        throw new Error(data.error || "Senha inválida.");
      }

      setAccessToken(data.token);
      setIsAuthenticated(true);
      setPassword("");
      queryClient.clear();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Falha ao validar acesso.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <main className="min-h-screen bg-background flex items-center justify-center p-6">
            <section className="w-full max-w-md bg-card rounded-lg border border-border p-6 space-y-4">
              <h1 className="font-bebas text-4xl text-card-foreground">Acesso restrito</h1>
              <p className="text-muted-foreground">
                Informe a senha compartilhada para visualizar os projetos.
              </p>
              <form className="space-y-3" onSubmit={handleSubmit} aria-label="Formulário de acesso">
                <div className="space-y-2">
                  <Label htmlFor="access-password">Senha de acesso</Label>
                  <Input
                    id="access-password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="current-password"
                    aria-invalid={!!error}
                    aria-describedby={error ? "access-error" : undefined}
                    required
                  />
                </div>
                {error && (
                  <p id="access-error" role="alert" className="text-sm text-destructive">
                    {error}
                  </p>
                )}
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Validando..." : "Entrar"}
                </Button>
              </form>
            </section>
          </main>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index onLogout={handleLogout} />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
