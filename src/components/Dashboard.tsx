import { FileText, Plus, Users } from 'lucide-react';
import { useEffect, useState } from 'react'; // 1. Adicionado hooks
import { StudentList, User } from '../types';
import api from '../utils/api'; // 2. Adicionado import da API
import { Button } from './ui/button';
import { Card } from './ui/card';
import { LoadingSpinner } from './ui/spinner';

interface DashboardProps {
  user: User;
  onNavigate: (page: 'lists' | 'students', list?: StudentList) => void;
}

export function Dashboard({ user, onNavigate }: DashboardProps) {
  // 3. Estado para armazenar as listas reais da API
  const [lists, setLists] = useState<StudentList[]>([]);
  const [loading, setLoading] = useState(true);

  // 4. Busca os dados ao carregar a página
  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        const data = await api.getStudentLists();
        if (mounted) {
          setLists(data || []);
        }
      } catch (error) {
        console.error("Erro ao carregar listas:", error);
        if (mounted) setLists([]); 
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  const totalStudents = lists.reduce((sum, list) => sum + list.studentCount, 0);

  // Enquanto carrega, mostra spinner
  if (loading) {
    return <div className="p-8 text-center text-gray-500">Carregando painel...<LoadingSpinner /></div>;
  }

  if (user.role === 'coordenador') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-gray-900 mb-2">Bem-vindo, {user.name}</h1>
          <p className="text-gray-600">Visão geral do sistema de atividades complementares</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onNavigate('lists')}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-brand-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-brand-600" />
              </div>
              <span className="text-gray-900">{lists.length}</span>
            </div>
            <h3 className="text-gray-600 mb-1">Listas Criadas</h3>
            <p className="text-sm text-gray-500">Gerenciar listas de atividades</p>
          </Card>

          <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-br from-brand-500 to-brand-600 text-white" onClick={() => onNavigate('lists')}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Plus className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="mb-1">Adicionar Lista</h3>
            <p className="text-sm text-brand-100">Criar nova lista de atividades</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-gray-900">{totalStudents}</span>
            </div>
            <h3 className="text-gray-600 mb-1">Estudantes no Total</h3>
            <p className="text-sm text-gray-500">Cadastrados no sistema</p>
          </Card>
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-gray-900">Listas Recentes</h2>
            <Button variant="outline" size="sm" onClick={() => onNavigate('lists')}>
              Ver todas
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-gray-600">Título</th>
                  <th className="text-left py-3 px-4 text-gray-600">CH Total</th>
                  <th className="text-left py-3 px-4 text-gray-600">Máx. por Tipo</th>
                  <th className="text-left py-3 px-4 text-gray-600">Estudantes</th>
                  <th className="text-left py-3 px-4 text-gray-600">Ações</th>
                </tr>
              </thead>
              <tbody>
                {lists.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      Nenhuma lista encontrada.
                    </td>
                  </tr>
                ) : (
                  lists.map((list) => (
                    <tr key={list.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-900">{list.title}</td>
                      <td className="py-3 px-4 text-gray-600">{list.totalHours}h</td>
                      <td className="py-3 px-4 text-gray-600">{list.maxHoursPerType}h</td>
                      <td className="py-3 px-4 text-gray-600">{list.studentCount}</td>
                      <td className="py-3 px-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onNavigate('students', list)}
                        >
                          Abrir
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  }

  // Monitor view
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">Bem-vindo, {user.name}</h1>
        <p className="text-gray-600">Acompanhe as atividades dos estudantes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-brand-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-brand-600" />
            </div>
            <span className="text-gray-900">{lists.length}</span>
          </div>
          <h3 className="text-gray-600 mb-1">Listas Disponíveis</h3>
          <p className="text-sm text-gray-500">Para acompanhamento</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-gray-900">{totalStudents}</span>
          </div>
          <h3 className="text-gray-600 mb-1">Estudantes Acompanhados</h3>
          <p className="text-sm text-gray-500">No total</p>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-gray-900 mb-6">Listas Acessíveis</h2>
        
        <div className="space-y-3">
          {lists.length === 0 ? (
             <p className="text-gray-500">Nenhuma lista disponível no momento.</p>
          ) : (
            lists.map((list) => (
              <Card key={list.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => onNavigate('students', list)}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-gray-900 mb-1">{list.title}</h3>
                    <p className="text-sm text-gray-600">
                      {list.studentCount} estudantes • {list.totalHours}h total
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Acessar
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}