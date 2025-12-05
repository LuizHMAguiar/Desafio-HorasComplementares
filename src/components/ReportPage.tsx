import { Card } from './ui/card';
import { Button } from './ui/button';
import { StudentList } from '../types';
import { Printer, Download } from 'lucide-react';
import { toast } from 'sonner';

interface ReportPageProps {
  list: StudentList;
}

const mockReportData = [
  {
    student: { name: 'Ana Paula Costa', cpf: '123.456.789-01', course: 'Engenharia Civil', class: '2024.1' },
    activities: [
      { type: 'Eventos', hours: 32, date: '2024-03-15' },
      { type: 'Organização', hours: 10, date: '2024-04-20' },
      { type: 'Pesquisa', hours: 20, date: '2024-05-10' },
      { type: 'Extensão', hours: 16, date: '2024-06-05' },
    ],
    totalHours: 78
  },
  {
    student: { name: 'Beatriz Santos', cpf: '345.678.901-23', course: 'Engenharia Mecânica', class: '2024.1' },
    activities: [
      { type: 'Eventos', hours: 40, date: '2024-02-10' },
      { type: 'Monitoria', hours: 30, date: '2024-03-15' },
      { type: 'Pesquisa', hours: 22, date: '2024-04-20' },
    ],
    totalHours: 92
  },
  {
    student: { name: 'Carlos Eduardo Silva', cpf: '234.567.890-12', course: 'Engenharia Civil', class: '2024.1' },
    activities: [
      { type: 'Eventos', hours: 50, date: '2024-01-15' },
      { type: 'Pesquisa', hours: 40, date: '2024-02-20' },
      { type: 'Extensão', hours: 30, date: '2024-03-10' },
      { type: 'Monitoria', hours: 30, date: '2024-04-05' },
    ],
    totalHours: 150
  },
];

export function ReportPage({ list }: ReportPageProps) {
  const handlePrint = () => {
    window.print();
    toast.success('Abrindo diálogo de impressão...');
  };

  const handleDownloadPDF = () => {
    window.print();
    toast.info('Use "Salvar como PDF" na janela de impressão');
  };

  const currentDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

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

      <Card className="p-8 bg-white print:shadow-none print:border-none">
        {/* Header */}
        <div className="text-center mb-8 pb-6 border-b-2 border-gray-300">
          <div className="w-16 h-16 bg-indigo-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
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
        {mockReportData.map((data, index) => (
          <div key={index} className="mb-8 pb-8 border-b border-gray-200 last:border-b-0 page-break-inside-avoid">
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
                  <tr key={actIndex} className="border-b border-gray-100">
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

      <style>{`
        @media print {
          body {
            background: white;
          }
          .page-break-inside-avoid {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}