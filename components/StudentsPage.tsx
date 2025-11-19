import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { ActivityList, Student } from '../App';
import { Plus, Search, Upload, Download, User, FileSpreadsheet, FileText } from 'lucide-react';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';

interface StudentsPageProps {
  list: ActivityList;
  onNavigate: (page: 'student-profile' | 'report', list?: ActivityList, student?: Student) => void;
}

const mockStudents: Student[] = [
  { id: '1', name: 'Ana Paula Costa', cpf: '123.456.789-01', course: 'Engenharia Civil', class: '2024.1', listId: '1', totalHours: 78, status: 'em andamento' },
  { id: '2', name: 'Carlos Eduardo Silva', cpf: '234.567.890-12', course: 'Engenharia Civil', class: '2024.1', listId: '1', totalHours: 150, status: 'concluído' },
  { id: '3', name: 'Beatriz Santos', cpf: '345.678.901-23', course: 'Engenharia Mecânica', class: '2024.1', listId: '1', totalHours: 92, status: 'em andamento' },
  { id: '4', name: 'Daniel Oliveira', cpf: '456.789.012-34', course: 'Engenharia Elétrica', class: '2024.1', listId: '1', totalHours: 45, status: 'em andamento' },
];

export function StudentsPage({ list, onNavigate }: StudentsPageProps) {
  const [students, setStudents] = useState(mockStudents.filter(s => s.listId === list.id));
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.cpf.includes(searchTerm);
    const matchesCourse = !courseFilter || student.course === courseFilter;
    const matchesClass = !classFilter || student.class === classFilter;
    return matchesSearch && matchesCourse && matchesClass;
  });

  const courses = [...new Set(students.map(s => s.course))];
  const classes = [...new Set(students.map(s => s.class))];

  const handleAddStudent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newStudent: Student = {
      id: String(students.length + 1),
      name: formData.get('name') as string,
      cpf: formData.get('cpf') as string,
      course: formData.get('course') as string,
      class: formData.get('class') as string,
      listId: list.id,
      totalHours: 0,
      status: 'em andamento',
    };

    setStudents([...students, newStudent]);
    setIsAddDialogOpen(false);
    toast.success('Estudante adicionado com sucesso!');
  };

  const handleImportCSV = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.success('CSV importado com sucesso! 5 estudantes adicionados.');
    setIsImportDialogOpen(false);
  };

  const handleExportReport = () => {
    toast.success('Relatório exportado com sucesso!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-gray-900 mb-2">Estudantes da Lista: {list.title}</h1>
        <p className="text-gray-600">
          Configurações: {list.totalHours}h total • {list.maxHoursPerType}h máximo por tipo
        </p>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Adicionar estudante
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Estudante</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo *</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF *</Label>
                <Input id="cpf" name="cpf" placeholder="000.000.000-00" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="course">Curso *</Label>
                <Input id="course" name="course" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="class">Turma *</Label>
                <Input id="class" name="class" placeholder="2024.1" required />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Salvar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Upload className="w-4 h-4" />
              Importar CSV
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Importar CSV</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleImportCSV} className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer">
                <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Arraste um arquivo CSV ou clique para selecionar</p>
                <input type="file" accept=".csv" className="hidden" />
                <Button type="button" variant="outline" size="sm">
                  Escolher arquivo
                </Button>
              </div>
              <div className="text-sm text-gray-600">
                <a href="#" className="text-indigo-600 hover:underline">Baixar modelo CSV</a>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsImportDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Importar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Button variant="outline" className="gap-2" onClick={handleExportReport}>
          <Download className="w-4 h-4" />
          Exportar relatório
        </Button>

        <Button variant="outline" className="gap-2" onClick={() => onNavigate('report', list)}>
          <FileText className="w-4 h-4" />
          Ver relatório completo
        </Button>
      </div>

      <Card className="p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome ou CPF..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            className="h-10 rounded-md border border-gray-300 px-3 text-sm"
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
          >
            <option value="">Todos os cursos</option>
            {courses.map(course => (
              <option key={course} value={course}>{course}</option>
            ))}
          </select>
          <select
            className="h-10 rounded-md border border-gray-300 px-3 text-sm"
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
          >
            <option value="">Todas as turmas</option>
            {classes.map(cls => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
        </div>
      </Card>

      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-gray-600">Nome</th>
                <th className="text-left py-3 px-4 text-gray-600">CPF</th>
                <th className="text-left py-3 px-4 text-gray-600">Curso</th>
                <th className="text-left py-3 px-4 text-gray-600">Turma</th>
                <th className="text-left py-3 px-4 text-gray-600">Horas Cumpridas</th>
                <th className="text-left py-3 px-4 text-gray-600">Status</th>
                <th className="text-left py-3 px-4 text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    Nenhum registro encontrado
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-900">{student.name}</td>
                    <td className="py-3 px-4 text-gray-600">{student.cpf}</td>
                    <td className="py-3 px-4 text-gray-600">{student.course}</td>
                    <td className="py-3 px-4 text-gray-600">{student.class}</td>
                    <td className="py-3 px-4 text-gray-600">{student.totalHours}h / {list.totalHours}h</td>
                    <td className="py-3 px-4">
                      <Badge variant={student.status === 'concluído' ? 'default' : 'secondary'}>
                        {student.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onNavigate('student-profile', list, student)}
                        className="gap-2"
                      >
                        <User className="w-4 h-4" />
                        Ver estudante
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