import { Button } from './ui/button';
import { User } from '../App';
import { LogOut, Home, List, Users } from 'lucide-react';

interface NavbarProps {
  user: User;
  onLogout: () => void;
  onNavigate: (page: 'dashboard' | 'lists' | 'students') => void;
}

export function Navbar({ user, onLogout, onNavigate }: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="text-gray-900">Gestão de Atividades</span>
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
              <div className="text-gray-900">{user.name}</div>
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