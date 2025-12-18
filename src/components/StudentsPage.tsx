import { useState, useRef, useEffect } from "react";
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
import { StudentList, Student, Activity } from "../types";
import {
  Plus,
  Search,
  Upload,
  Download,
  User,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import { Badge } from "./ui/badge";
import { toast } from "sonner";
import { api } from "../utils/api";
import { calculateValidHours } from "../utils/calculations";
import {
  downloadStudentsCSV,
  importStudentsFromCSV,
  downloadCSVTemplate,
} from "../utils/exportUtils";

interface StudentsPageProps {
  list: StudentList;
  onNavigate: (
    page: "student-profile" | "report",
    list?: StudentList,
    student?: Student
  ) => void;
}

// Extender o tipo Student apenas para uso local com horas calculadas
interface StudentWithCalculatedHours extends Student {
  calculatedTotal?: number;
}

export function StudentsPage({ list, onNavigate }: StudentsPageProps) {
  const [students, setStudents] = useState<StudentWithCalculatedHours[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.cpf.includes(searchTerm);
    const matchesCourse = !courseFilter || student.course === courseFilter;
    const matchesClass = !classFilter || student.class === classFilter;
    return matchesSearch && matchesCourse && matchesClass;
  });

  const courses = [...new Set(students.map((s) => s.course))];
  const classes = [...new Set(students.map((s) => s.class))];

  const handleAddStudent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const newStudent: Student = {
      id: Date.now(), // Using timestamp for a unique ID
      name: formData.get("name") as string,
      cpf: formData.get("cpf") as string,
      course: formData.get("course") as string,
      class: formData.get("class") as string,
      listId: list.id,
      totalHours: 0,
      status: "em andamento",
    };

    // Adiciona com 0 horas calculadas inicialmente
    setStudents([...students, { ...newStudent, calculatedTotal: 0 }]);
    // optimistically create on API
    try {
      api.createStudent(newStudent).catch(() => {
        // ignore - keep local state
      });
    } catch (err) {
      // noop
    }
    setIsAddDialogOpen(false);
    toast.success("Estudante adicionado com sucesso!");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      toast.info(`Arquivo "${file.name}" selecionado`);
    }
  };

  const handleImportCSV = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Nenhum arquivo selecionado");
      return;
    }

    try {
      const count = await importStudentsFromCSV(
        selectedFile,
        list.id,
        setStudents
      );
      setIsImportDialogOpen(false);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      toast.success(`${count} estudante(s) importado(s) com sucesso!`);
    } catch (error) {
      toast.error("Erro ao importar arquivo CSV");
    } finally {
      setLoading(false);
    }
  };

  const [loading, setLoading] = useState(true);

  // Efeito principal alterado para buscar e calcular horas
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const studentsData = await api.getStudents({ listId: list.id });
        
        if (mounted && Array.isArray(studentsData)) {
          // Para cada estudante, buscamos suas atividades para calcular o total real
          const studentsWithHours = await Promise.all(
            studentsData.map(async (student) => {
              try {
                const activities = await api.getActivities({ studentId: student.id });
                const calculatedTotal = calculateValidHours(activities, list.maxHoursPerType);
                
                // Determina status baseado no cálculo real
                const status = calculatedTotal >= list.totalHours ? "concluído" : "em andamento";
                
                return { 
                  ...student, 
                  calculatedTotal,
                  status: status as 'em andamento' | 'concluído' // Atualiza status visualmente
                };
              } catch (e) {
                console.warn(`Erro ao calcular horas para aluno ${student.id}`, e);
                return { ...student, calculatedTotal: student.totalHours || 0 };
              }
            })
          );
          
          setStudents(studentsWithHours);
        }
      } catch (error) {
        console.warn("Could not fetch students:", error);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [list.id, list.maxHoursPerType, list.totalHours]); // Recalcula se as regras da lista mudarem

  const handleDownloadTemplate = (e: React.MouseEvent) => {
    e.preventDefault();
    downloadCSVTemplate();
    toast.success("Modelo CSV baixado!");
  };

  const handleExportReport = () => {
    // Exporta usando os dados calculados
    const dataToExport = students.map(s => ({
        ...s,
        totalHours: s.calculatedTotal ?? s.totalHours
    }));
    downloadStudentsCSV(dataToExport, list.title);
    toast.success("Relatório exportado com sucesso!");
  };

  // Função simples de máscara de CPF
  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '') // Remove tudo que não é dígito
      .replace(/(\d{3})(\d)/, '$1.$2') // Coloca ponto após o 3º digito
      .replace(/(\d{3})(\d)/, '$1.$2') // Coloca ponto após o 6º digito
      .replace(/(\d{3})(\d{1,2})/, '$1-$2') // Coloca traço após o 9º digito
      .replace(/(-\d{2})\d+?$/, '$1'); // Impede digitar mais que o necessário
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-gray-900 mb-2">
          Estudantes da Lista: {list.title}
        </h1>
        <p className="text-gray-600">
          Configurações: {list.totalHours}h total • {list.maxHoursPerType}h
          máximo por tipo
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
              <DialogDescription>
                Preencha os dados do estudante para adicioná-lo à lista.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo *</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF *</Label>
                <Input
                  id="cpf"
                  name="cpf"
                  placeholder="000.000.000-00"
                  required
                  maxLength={14} // Limita o tamanho
                  onChange={(e) => {
                    e.target.value = formatCPF(e.target.value);
                  }}
                />
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
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
              <DialogDescription>
                Importe múltiplos estudantes de uma vez usando um arquivo CSV.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleImportCSV} className="space-y-4">
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">
                  Arraste um arquivo CSV ou clique para selecionar
                </p>
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                <p className="text-sm text-gray-500">
                  {selectedFile
                    ? `Arquivo: ${selectedFile.name}`
                    : "Nenhum arquivo selecionado"}
                </p>
              </div>
              <div className="text-sm text-gray-600">
                <a
                  href="#"
                  className="text-brand-600 hover:underline"
                  onClick={handleDownloadTemplate}
                >
                  Baixar modelo CSV
                </a>
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsImportDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={!selectedFile}>
                  Importar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Button
          variant="outline"
          className="gap-2"
          onClick={handleExportReport}
        >
          <Download className="w-4 h-4" />
          Exportar relatório
        </Button>

        <Button
          variant="outline"
          className="gap-2"
          onClick={() => onNavigate("report", list)}
        >
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
            {courses.map((course) => (
              <option key={course} value={course}>
                {course}
              </option>
            ))}
          </select>
          <select
            className="h-10 rounded-md border border-gray-300 px-3 text-sm"
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
          >
            <option value="">Todas as turmas</option>
            {classes.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
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
                <th className="text-left py-3 px-4 text-gray-600">
                  Horas Cumpridas (Válidas)
                </th>
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
                  <tr
                    key={student.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 text-gray-900">{student.name}</td>
                    <td className="py-3 px-4 text-gray-600">{student.cpf}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {student.course}
                    </td>
                    <td className="py-3 px-4 text-gray-600">{student.class}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {/* Usando calculatedTotal em vez de totalHours bruto */}
                      <span className="font-medium text-gray-900">
                        {student.calculatedTotal ?? 0}h
                      </span>{" "}
                      / {list.totalHours}h
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          student.status === "concluído"
                            ? "default"
                            : "secondary"
                        }
                        className={
                            student.status === "concluído" 
                            ? "bg-green-600 hover:bg-green-700" 
                            : ""
                        }
                      >
                        {student.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          onNavigate("student-profile", list, student)
                        }
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