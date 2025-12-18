import React, { useState, useRef, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { LoadingSpinner } from './ui/spinner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Progress } from "./ui/progress";
import { Student, Activity, User, StudentList } from "../types";
import {
  Plus,
  FileText,
  Edit,
  Trash2,
  Download,
  Upload,
  X,
  AlertCircle,
} from "lucide-react";
import { Badge } from "./ui/badge";
import { toast } from "sonner";
import {
  downloadDocument,
  handleFileUpload,
  getMaxDate,
  isValidDate,
} from "../utils/exportUtils";
import api from "../utils/api";
import { calculateValidHours, getHoursBreakdown } from "../utils/calculations";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

interface StudentProfileProps {
  student: Student;
  list: StudentList;
  user: User;
  onNavigate: (page: "students") => void;
}

const activityTypes = [
  "Eventos",
  "Organização",
  "Pesquisa",
  "Extensão",
  "Monitoria",
  "Estágio",
  "Publicações",
  "Cursos",
];

export function StudentProfile({
  student,
  list,
  user,
  onNavigate,
}: StudentProfileProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await api.getActivities({ studentId: student.id });
        if (mounted && Array.isArray(data)) {
          setActivities(data as Activity[]);
        }
      } catch (error) {
        console.warn("Could not fetch activities:", error);
        if (mounted) setActivities([]); // Define vazio em vez de mockActivities
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [student.id]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [deleteActivityId, setDeleteActivityId] = useState<number | null>(null);
  const [typeFilter, setTypeFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- REFATORAÇÃO APLICADA AQUI ---

  // 2. Calcula o total válido usando a função centralizada (Importada de utils/calculations)
  // Certifique-se de ter importado: import { calculateValidHours } from "../utils/calculations";
  const totalValidHours = calculateValidHours(activities, list.maxHoursPerType);

  // 3. Barra de progresso usando a nova variável
  const progressPercentage = Math.min(
    (totalValidHours / list.totalHours) * 100,
    100
  );

  // 4. Gera os dados dos cards (Mantendo o map para exibir todos os tipos, mesmo os vazios)
  const hoursByType = activityTypes.map((type) => {
    const typeHours = activities
      .filter((a) => a.type === type)
      .reduce((sum, a) => sum + a.hours, 0);
    
    // Aplica a lógica visual de limite
    return { 
      type, 
      hours: typeHours, // Horas brutas
      validHours: Math.min(typeHours, list.maxHoursPerType), // Horas válidas
      isCapped: typeHours > list.maxHoursPerType // Flag para o alerta visual
    };
  });

  const filteredActivities = activities.filter((activity) => {
    const matchesType = !typeFilter || activity.type === typeFilter;
    const matchesDate = !dateFilter || activity.date.includes(dateFilter);
    return matchesType && matchesDate;
  });

  const handleSaveActivity = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const date = formData.get("date") as string;

    // Validate date is not in the future
    if (!isValidDate(date)) {
      toast.error("A data não pode ser posterior à data atual");
      return;
    }

    const activityToSave: Omit<Activity, "id"> = {
      studentId: student.id,
      type: formData.get("type") as string,
      hours: Number(formData.get("hours")),
      date: date,
      registeredBy: user.name,
      notes: (formData.get("notes") as string) || undefined,
      document: uploadedFile?.name || editingActivity?.document,
    };

    if (editingActivity) {
      const updatedActivity = { ...activityToSave, id: editingActivity.id } as Activity;
      setActivities((prev) => prev.map((a) => (a.id === editingActivity.id ? updatedActivity : a)));
      toast.success("Atividade atualizada com sucesso!");
      try {
        await api.updateActivity(editingActivity.id, activityToSave);
      } catch (err) {
        console.warn('Falha ao atualizar atividade na API', err);
      }
    } else {
      // create temporary id to keep UI responsive
      const tempId = Date.now();
      const newActivity = { ...(activityToSave as Activity), id: tempId };
      setActivities((prev) => [...prev, newActivity]);
      toast.success("Atividade cadastrada com sucesso!");

      try {
        const created = await api.createActivity(activityToSave);
        // replace temp activity with one returned by API (if API returns full object)
        if (created && typeof created.id === 'number') {
          setActivities((prev) => prev.map((a) => (a.id === tempId ? created : a)));
        }
      } catch (err) {
        console.warn('Falha ao criar atividade na API', err);
      }
    }

    setIsAddDialogOpen(false);
    setEditingActivity(null);
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDeleteActivity = async () => {
    const id = deleteActivityId;
    if (!id) return;

    // optimistic UI update
    setActivities((prev) => prev.filter((a) => a.id !== id));
    setDeleteActivityId(null);

    try {
      await api.deleteActivity(id);
      toast.success("Atividade excluída com sucesso!");
    } catch (err) {
      toast.error("Erro ao excluir!");
      console.warn('Falha ao excluir atividade na API', err);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const fileData = await handleFileUpload(file);
        setUploadedFile({ name: fileData.name, size: fileData.size });
        toast.success(`Arquivo "${fileData.name}" carregado com sucesso!`);
      } catch (error) {
        toast.error("Erro ao carregar arquivo");
      }
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.info("Arquivo removido");
  };

  const handleDownloadDocument = (filename: string) => {
    downloadDocument(filename);
    toast.success(`Download de "${filename}" iniciado`);
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
      <Button
        variant="outline"
        onClick={() => onNavigate("students")}
        className="mb-6"
      >
        ← Voltar
      </Button>

      <Card className="p-6 mb-6">
        <div className="mb-6">
          <h1 className="text-gray-900 mb-2">{student.name}</h1>
          <div className="flex flex-wrap gap-4 text-gray-600">
            <span>CPF: {student.cpf}</span>
            <span>•</span>
            <span>{student.course}</span>
            <span>•</span>
            <span>Turma: {student.class}</span>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-700 font-medium">Progresso Total (Horas Válidas)</span>
            <span className="text-gray-900 font-bold">
              {totalValidHours}h{" "}
              <span className="text-gray-500 font-normal">
                / {list.totalHours}h
              </span>
              <span className="ml-2 text-sm text-gray-500">
                ({progressPercentage.toFixed(0)}%)
              </span>
            </span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {hoursByType
            .filter((item) => item.hours > 0)
            .map((item) => (
              <Card 
                key={item.type} 
                // Muda a cor do card se tiver atingido o teto (isCapped)
                className={`p-4 border ${item.isCapped ? 'border-amber-200 bg-amber-50' : 'bg-gray-50'}`}
              >
                <div className="flex justify-between items-start mb-1">
                    <div className="text-sm text-gray-600 font-medium truncate" title={item.type}>
                        {item.type}
                    </div>
                    {/* Mostra ícone de alerta se exceder */}
                    {item.isCapped && (
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                    )}
                </div>
                
                <div className="flex items-baseline gap-2">
                    {/* Mostra as horas VÁLIDAS grande */}
                    <span className="text-2xl font-bold text-gray-900">
                        {item.validHours}h
                    </span>
                    
                    {/* Se exceder, mostra o total real riscado e o limite */}
                    {item.isCapped && (
                        <div className="text-xs text-red-600 font-medium flex flex-col leading-tight">
                            <span className="line-through opacity-70">{item.hours}h</span>
                            <span>(Max {list.maxHoursPerType}h)</span>
                        </div>
                    )}
                </div>
                
                {!item.isCapped && (
                    <div className="text-xs text-gray-400 mt-1">
                        Válidas
                    </div>
                )}
              </Card>
            ))}
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-gray-900">Atividades Registradas</h2>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="gap-2"
                onClick={() => setEditingActivity(null)}
              >
                <Plus className="w-4 h-4" />
                Adicionar atividade
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingActivity ? "Editar Atividade" : "Registrar Atividade"}
                </DialogTitle>
                <DialogDescription>
                  {editingActivity
                    ? "Edite as informações da atividade complementar."
                    : "Registre uma nova atividade complementar do estudante."}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSaveActivity} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo da Atividade *</Label>
                  <select
                    id="type"
                    name="type"
                    className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm"
                    defaultValue={editingActivity?.type}
                    required
                  >
                    <option value="">Selecione...</option>
                    {activityTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hours">Carga Horária *</Label>
                  <Input
                    id="hours"
                    name="hours"
                    type="number"
                    min="1"
                    max="50"
                    defaultValue={editingActivity?.hours}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Data *</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    max={getMaxDate()}
                    defaultValue={editingActivity?.date}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="document">Documento Comprobatório *</Label>
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Arraste um arquivo ou clique para selecionar
                    </p>
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      ref={fileInputRef}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                  </div>
                  {uploadedFile && (
                    <div className="mt-2 flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {uploadedFile.name}
                        </span>
                        <span className="text-xs text-gray-400">
                          ({(uploadedFile.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveFile}
                      >
                        <X className="w-4 h-4 text-gray-500" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Observações (Opcional)</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    defaultValue={editingActivity?.notes}
                  />
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
        </div>

        <div className="flex gap-4 mb-4">
          <select
            className="h-10 rounded-md border border-gray-300 px-3 text-sm"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">Todos os tipos</option>
            {activityTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <Input
            type="month"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="max-w-xs"
            placeholder="Filtrar por mês"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-gray-600">Tipo</th>
                <th className="text-left py-3 px-4 text-gray-600">CH</th>
                <th className="text-left py-3 px-4 text-gray-600">Data</th>
                <th className="text-left py-3 px-4 text-gray-600">
                  Registrado por
                </th>
                <th className="text-left py-3 px-4 text-gray-600">Documento</th>
                <th className="text-left py-3 px-4 text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredActivities.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    Nenhum registro encontrado
                  </td>
                </tr>
              ) : (
                filteredActivities.map((activity) => (
                  <tr
                    key={activity.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4">
                      <Badge variant="outline">{activity.type}</Badge>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {activity.hours}h
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {new Date(activity.date).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {activity.registeredBy}
                    </td>
                    <td className="py-3 px-4">
                      {activity.document && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-2"
                          onClick={() =>
                            handleDownloadDocument(activity.document!)
                          }
                        >
                          <Download className="w-4 h-4" />
                          {activity.document}
                        </Button>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingActivity(activity);
                            setIsAddDialogOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteActivityId(activity.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
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

      <AlertDialog
        open={!!deleteActivityId}
        onOpenChange={() => setDeleteActivityId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta atividade? Esta ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteActivity}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
