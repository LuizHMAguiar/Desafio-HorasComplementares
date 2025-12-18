import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { User } from "../types";
import { api } from "../utils/api";

interface LoginPageProps {
  onLogin: (user: User) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const users = await api.getUsers();
      const found = (users || []).find(
        (u) => u.email === email || (u.cpf && u.cpf === email)
      );
      if (found) {
        // if API contains password field, compare; otherwise accept user (demo)
        // @ts-ignore
        if (found.password) {
          // @ts-ignore
          if (found.password === password) {
            onLogin(found);
          } else {
            setError("Credenciais inválidas");
          }
        } else {
          // No password in API — fall back to demo check or accept any password for known users
          onLogin(found);
        }
      } else {
        // fallback to local demo accounts
        if (email === "coordenador@escola.com" && password === "123456") {
          onLogin({
            id: 1,
            name: "Maria Silva",
            email: email,
            role: "coordenador",
          });
        } else if (email === "monitor@escola.com" && password === "123456") {
          onLogin({
            id: 2,
            name: "João Santos",
            email: email,
            role: "monitor",
          });
        } else {
          setError("Credenciais inválidas");
        }
      }
    } catch (err) {
      console.warn("Login API error", err);
      setError("Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100 p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <img 
            src="/logo.png" 
            alt="Logo do Sistema" 
            className="h-16 w-auto mx-auto mb-6 object-contain"
          />

          <h1 className="text-gray-900 mb-2">
            Sistema de Gestão de Atividades
          </h1>
          <h2 className="text-gray-900 mb-2">
            Instituto Acadêmico Minerva
          </h2>
          <p className="text-gray-600">Faça login para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email ou CPF</Label>
            <Input
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu email ou CPF"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              required
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Demo: coordenador@escola.com / 123456</p>
          <p>Demo: monitor@escola.com / 123456</p>
        </div>
      </Card>
    </div>
  );
}
