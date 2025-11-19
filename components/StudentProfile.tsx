import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Progress } from './ui/progress';
import { Student, Activity } from '../App';
import { Plus, FileText, Edit, Trash2, Download, Upload } from 'lucide-react';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

interface StudentProfileProps {
  student: Student;
  onNavigate: (page: 'students') => void;
}

const activityTypes = [
  'Eventos',
  'Organização',
  'Pesquisa',
  'Extensão',
  'Monitoria',
  'Estágio',
  'Publicações',
  'Cursos'
];

const mockActivities: Activity[] = [
  { id: '1', studentId: '1', type: 'Eventos', hours: 32, date: '2024-03-15', registeredBy: 'Maria Silva', document: 'certificado.pdf' },
  { id: '2', studentId: '1', type: 'Organização', hours: 10, date: '2024-04-20', registeredBy: 'Maria Silva', document: 'declaracao.pdf' },
  { id: '3', studentId: '1', type: 'Pesquisa', hours: 20, date: '2024-05-10', registeredBy: 'João Santos', document: 'relatorio.pdf' },
  { id: '4', studentId: '1', type: 'Extensão', hours: 16, date: '2024-06-05', registeredBy: 'Maria Silva', document: 'comprovante.pdf' },
];

export function StudentProfile({ student, onNavigate }: StudentProfileProps) {
  const [activities, setActivities] = useState(mockActivities.filter(a => a.studentId === student.id));
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [deleteActivityId, setDeleteActivityId] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const totalHours = 150;
  const progressPercentage = Math.min((student.totalHours / totalHours) * 100, 100);

  // Calculate hours by type
  const hoursByType = activityTypes.map(type => {
    const typeHours = activities
      .filter(a => a.type === type)
      .reduce((sum, a) => sum + a.hours, 0);
    return { type, hours: typeHours };
  });

  const filteredActivities = activities.filter(activity => {
    const matchesType = !typeFilter || activity.type === typeFilter;
    const matchesDate = !dateFilter || activity.date.includes(dateFilter);
    return matchesType && matchesDate;
  });

  const handleSaveActivity = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newActivity: Activity = {
      id: editingActivity?.id || String(activities.length + 1),
      studentId: student.id,
      type: formData.get('type') as string,
      hours: Number(formData.get('hours')),
      date: formData.get('date') as string,
      registeredBy: 'Maria Silva',
      notes: formData.get('notes') as string || undefined,
    };

    if (editingActivity) {
      setActivities(activities.map(a => a.id === editingActivity.id ? newActivity : a));
      toast.success('Atividade atualizada com sucesso!');
    } else {
      setActivities([...activities, newActivity]);
      toast.success('Atividade cadastrada com sucesso!');
    }

    setIsAddDialogOpen(false);
    setEditingActivity(null);
  };

  const handleDeleteActivity = () => {
    if (deleteActivityId) {
      setActivities(activities.filter(a => a.id !== deleteActivityId));
      toast.success('Atividade excluída com sucesso!');
      setDeleteActivityId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Button variant="outline" onClick={() => onNavigate('students')} className="mb-6">
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
            <span className="text-gray-700">Progresso Total</span>
            <span className="text-gray-900">
              {student.totalHours}h / {totalHours}h ({progressPercentage.toFixed(0)}%)
            </span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {hoursByType.filter(item => item.hours > 0).map(item => (
            <Card key={item.type} className="p-4 bg-gray-50">
              <div className="text-sm text-gray-600 mb-1">{item.type}</div>
              <div className="text-gray-900">{item.hours}h</div>
            </Card>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-gray-900">Atividades Registradas</h2>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" onClick={() => setEditingActivity(null)}>
                <Plus className="w-4 h-4" />
                Adicionar atividade
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingActivity ? 'Editar Atividade' : 'Registrar Atividade'}</DialogTitle>
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
                    {activityTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
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
                    defaultValue={editingActivity?.date}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="document">Documento Comprobatório *</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Arraste um arquivo ou clique para selecionar</p>
                    <input type="file" className="hidden" />
                  </div>
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
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
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
            {activityTypes.map(type => (
              <option key={type} value={type}>{type}</option>
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
                <th className="text-left py-3 px-4 text-gray-600">Registrado por</th>
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
                  <tr key={activity.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <Badge variant="outline">{activity.type}</Badge>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{activity.hours}h</td>
                    <td className="py-3 px-4 text-gray-600">
                      {new Date(activity.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3 px-4 text-gray-600">{activity.registeredBy}</td>
                    <td className="py-3 px-4">
                      {activity.document && (
                        <Button variant="ghost" size="sm" className="gap-2">
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

      <AlertDialog open={!!deleteActivityId} onOpenChange={() => setDeleteActivityId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta atividade? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteActivity} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}