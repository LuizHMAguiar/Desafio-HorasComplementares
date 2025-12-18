import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { LoadingSpinner } from './ui/spinner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { StudentList } from "../types";
import { Plus, Search, Edit, FolderOpen } from "lucide-react";
import { toast } from "sonner";
import { api } from "../utils/api";

interface ListsPageProps {
  onNavigate: (page: "students", list: StudentList) => void;
}

export function ListsPage({ onNavigate }: ListsPageProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [lists, setLists] = useState<StudentList[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingList, setEditingList] = useState<StudentList | null>(null);

  const filteredLists = lists.filter((list) =>
    list.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveList = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const newList: StudentList = {
      id: editingList?.id || Date.now(), // Using timestamp for a unique ID
      title: formData.get("title") as string,
      totalHours: Number(formData.get("totalHours")),
      maxHoursPerType: Number(formData.get("maxHoursPerType")),
      studentCount: editingList?.studentCount || 0,
      createdAt: editingList?.createdAt || new Date().toISOString(),
    };

    if (editingList) {
      setLists(lists.map((l) => (l.id === editingList.id ? newList : l)));
      toast.success("Lista atualizada com sucesso!");
    } else {
      setLists([...lists, newList]);
      toast.success("Lista criada com sucesso!");
    }

    setIsCreateDialogOpen(false);
    setEditingList(null);
  };

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await api.getStudentLists();
        if (mounted) {
          // Se vier dados, usa eles. Se vier null/undefined, usa array vazio.
          setLists(data || []);
        }
      } catch (error) {
        console.error("Erro ao buscar listas:", error);
        // Em caso de erro, garante que a lista fique vazia
        if (mounted) setLists([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-gray-900 mb-2">Listas de Atividades</h1>
          <p className="text-gray-600">
            Gerencie as listas de atividades complementares
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={() => setEditingList(null)}>
              <Plus className="w-4 h-4" />
              Criar nova lista
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingList ? "Editar Lista" : "Criar Nova Lista"}
              </DialogTitle>
              <DialogDescription>
                {editingList
                  ? "Edite as configurações da lista de atividades."
                  : "Configure uma nova lista de atividades complementares."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSaveList} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título da Lista</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Ex: Turma 2024.1 - Engenharia"
                  defaultValue={editingList?.title}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalHours">
                  Carga Horária Total Necessária
                </Label>
                <Input
                  id="totalHours"
                  name="totalHours"
                  type="number"
                  placeholder="150"
                  defaultValue={editingList?.totalHours || 150}
                  required
                  min="1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxHoursPerType">CH Máxima por Tipo</Label>
                <Input
                  id="maxHoursPerType"
                  name="maxHoursPerType"
                  type="number"
                  placeholder="50"
                  defaultValue={editingList?.maxHoursPerType || 50}
                  required
                  min="1"
                />
              </div>

              <p className="text-sm text-gray-500">
                Valores padrão: 150h total, 50h por tipo
              </p>

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">Salvar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-6 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar por título..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-gray-600">
                  Título da Lista
                </th>
                <th className="text-left py-3 px-4 text-gray-600">
                  Carga Horária Total
                </th>
                <th className="text-left py-3 px-4 text-gray-600">
                  Máximo por Tipo
                </th>
                <th className="text-left py-3 px-4 text-gray-600">
                  Nº de Estudantes
                </th>
                <th className="text-left py-3 px-4 text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredLists.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">
                    Nenhum registro encontrado
                  </td>
                </tr>
              ) : (
                filteredLists.map((list) => (
                  <tr
                    key={list.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 text-gray-900">{list.title}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {list.totalHours}h
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {list.maxHoursPerType}h
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {list.studentCount}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onNavigate("students", list)}
                          className="gap-2"
                        >
                          <FolderOpen className="w-4 h-4" />
                          Abrir
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingList(list);
                            setIsCreateDialogOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
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
