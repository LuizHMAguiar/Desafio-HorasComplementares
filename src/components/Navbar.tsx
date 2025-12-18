import { Button } from "./ui/button";
import { Home, List, LogOut } from "lucide-react";
import { User, StudentList } from "../types"; // Ajuste os imports conforme seu projeto

interface NavbarProps {
  user: User;
  onNavigate: (page: 'dashboard' | 'lists') => void;
  onLogout: () => void;
}

export function Navbar({ user, onNavigate, onLogout }: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            
            <div className="flex items-center gap-3">
              {/* Substituímos o ícone SVG pela tag IMG */}
              <img 
                src="/logo.png" // Certifique-se que o arquivo na pasta 'public' tem esse nome
                alt="Logo do Sistema" 
                className="h-10 w-auto object-contain" // Ajuste h-10 para h-12 se quiser maior
              />
              
              {/* Mantive o texto, mas você pode remover essa linha <span> se a logo já tiver o nome escrito */}
              <span className="text-gray-900 font-bold text-lg">
                Gestão de Atividades
              </span>
            </div>

            <div className="hidden md:flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('dashboard')}
                className="gap-2"
              >
                <Home className="w-4 h-4" />
                Dashboard
              </Button>
              {user.role === 'coordenador' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate('lists')}
                  className="gap-2"
                >
                  <List className="w-4 h-4" />
                  Listas
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-gray-900 font-medium">{user.name}</div>
              <div className="text-sm text-gray-500">
                {user.role === 'coordenador' ? 'Coordenador' : 'Monitor'}
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={onLogout} className="gap-2">
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}