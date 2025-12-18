import { Download, Printer } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Activity, Student, StudentList } from '../types';
import api from '../utils/api';
import { calculateValidHours } from "../utils/calculations";
import { downloadReportAsPDF } from '../utils/exportUtils';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { LoadingSpinner } from './ui/spinner';

interface ReportPageProps {
  list: StudentList;
}

interface ReportItem {
  student: Pick<Student, 'name' | 'cpf' | 'course' | 'class' | 'id' | 'totalHours'>;
  activities: Activity[];
  totalHours: number;
}

export function ReportPage({ list }: ReportPageProps) {
  const [reportData, setReportData] = useState<Array<ReportItem>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const students = await api.getStudents({ listId: list.id });
        const items = await Promise.all(
          students.map(async (s) => {
            const activities = await api.getActivities({ studentId: s.id });
            
            // --- CÁLCULO CORRIGIDO MAIS DIRETO ---
            const totalValid = calculateValidHours(activities, list.maxHoursPerType);
            // -------------------------

            return {
              student: {
                id: s.id,
                name: s.name,
                cpf: s.cpf,
                course: s.course,
                class: s.class,
                totalHours: totalValid, // Usa o valor calculado corrigido
              },
              activities,
              totalHours: totalValid,
            } as ReportItem;
          })
        );

        if (mounted) setReportData(items);
      } catch (err: any) {
        toast.error('Erro ao carregar dados do relatório: ' + (err.message || err));
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [list.id]);

  const handlePrint = () => {
    window.print();
    toast.success('Abrindo diálogo de impressão...');
  };

  const handleDownloadPDF = async () => {
    try {
      await downloadReportAsPDF('report-content', `relatorio_${list.title.replace(/\s+/g, '_')}.pdf`);
      toast.success('PDF gerado e iniciado download');
    } catch (err: any) {
      toast.error('Erro ao gerar PDF: ' + (err.message || err));
    }
  };

  const currentDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  return (

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex gap-3 mb-6 print:hidden">
        <Button onClick={handlePrint} className="gap-2">
          <Printer className="w-4 h-4" />
          Imprimir
        </Button>
        <Button variant="outline" onClick={handleDownloadPDF} className="gap-2">
          <Download className="w-4 h-4" />
          Baixar PDF
        </Button>
      </div>

      <Card id="report-content" className="p-8 bg-white print:shadow-none print:border-none">
        {/* Header */}
        <div className="text-center mb-8 pb-6 border-b-2 border-gray-300">
          <div className="flex justify-center mb-4">
            <img 
              src="/logo.png" 
              alt="Logo da Instituição" 
              className="h-16 w-auto object-contain" 
            />
          </div>
          <h1 className="text-gray-900 mb-2">Relatório de Atividades Complementares</h1>
          <p className="text-gray-600">{list.title}</p>
          <p className="text-sm text-gray-500 mt-2">Data de geração: {currentDate}</p>
        </div>

        {/* Configuration */}
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Carga horária total exigida:</span>
              <span className="ml-2 text-gray-900">{list.totalHours}h</span>
            </div>
            <div>
              <span className="text-gray-600">Máximo por tipo de atividade:</span>
              <span className="ml-2 text-gray-900">{list.maxHoursPerType}h</span>
            </div>
          </div>
        </div>

        {/* Students */}
        {loading && <p>Carregando dados do relatório...</p>}
        {!loading && reportData.map((data, index) => (
          <div key={data.student.id ?? index} className="mb-8 pb-8 border-b border-gray-200 last:border-b-0 page-break-inside-avoid">
            <div className="mb-4">
              <h3 className="text-gray-900 mb-2">{data.student.name}</h3>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                <div>CPF: {data.student.cpf}</div>
                <div>Curso: {data.student.course}</div>
                <div>Turma: {data.student.class}</div>
                <div>
                  Total de horas: <span className="text-gray-900">{data.totalHours}h / {list.totalHours}h</span>
                  {data.totalHours >= list.totalHours && (
                    <span className="ml-2 text-green-600">(Concluído)</span>
                  )}
                </div>
              </div>
            </div>

            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="text-left py-2 text-gray-600">Tipo de Atividade</th>
                  <th className="text-left py-2 text-gray-600">Carga Horária</th>
                  <th className="text-left py-2 text-gray-600">Data</th>
                </tr>
              </thead>
              <tbody>
                {data.activities.map((activity, actIndex) => (
                  <tr key={activity.id ?? actIndex} className="border-b border-gray-100">
                    <td className="py-2 text-gray-900">{activity.type}</td>
                    <td className="py-2 text-gray-600">{activity.hours}h</td>
                    <td className="py-2 text-gray-600">
                      {new Date(activity.date).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
                <tr className="border-t-2 border-gray-300">
                  <td className="py-2 text-gray-900">Total</td>
                  <td className="py-2 text-gray-900">{data.totalHours}h</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        ))}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t-2 border-gray-300 text-center text-sm text-gray-500">
          <p>Sistema de Gestão de Atividades Complementares</p>
          <p className="mt-1">Documento gerado automaticamente em {currentDate}</p>
        </div>
      </Card>

      <style>{`\n        @media print {\n          body {\n            background: white;\n          }\n          .page-break-inside-avoid {\n            page-break-inside: avoid;\n          }\n        }\n      `}</style>
    </div>

  );
}