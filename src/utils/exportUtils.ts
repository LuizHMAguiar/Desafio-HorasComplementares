// Utility functions for exporting data to CSV and PDF
import { getDateStringForFilename } from './dateUtils';

export interface Student {
  name: string;
  cpf: string;
  course: string;
  class: string;
  totalHours: number;
  status: string;
}

export interface Activity {
  type: string;
  hours: number;
  date: string;
}

export interface ReportData {
  student: {
    name: string;
    cpf: string;
    course: string;
    class: string;
  };
  activities: Activity[];
  totalHours: number;
}

/**
 * Download CSV file with students data
 */
export function downloadStudentsCSV(students: Student[], listTitle: string) {
  try {
    // Create CSV header
    const headers = ['Nome', 'CPF', 'Curso', 'Turma', 'Horas Totais', 'Status'];
    
    // Create CSV rows
    const rows = students.map(student => [
      student.name,
      student.cpf,
      student.course,
      student.class,
      student.totalHours.toString(),
      student.status
    ]);
    
    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    // Create blob and download
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_${sanitizeFilename(listTitle)}_${getDateString()}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up URL
    setTimeout(() => URL.revokeObjectURL(url), 100);
  } catch (error) {
    console.error('Erro ao baixar CSV:', error);
    throw new Error('Erro ao baixar CSV');
  }
}

/**
 * Download comprehensive report as CSV
 */
export function downloadReportCSV(reportData: ReportData[], listTitle: string) {
  try {
    // Create CSV header
    const headers = ['Nome do Estudante', 'CPF', 'Curso', 'Turma', 'Tipo de Atividade', 'Horas', 'Data', 'Total de Horas'];
    
    // Create CSV rows
    const rows: string[][] = [];
    
    reportData.forEach(data => {
      data.activities.forEach((activity, index) => {
        rows.push([
          data.student.name,
          data.student.cpf,
          data.student.course,
          data.student.class,
          activity.type,
          activity.hours.toString(),
          new Date(activity.date).toLocaleDateString('pt-BR'),
          index === 0 ? data.totalHours.toString() : '' // Only show total on first row
        ]);
      });
    });
    
    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    // Create blob and download
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_completo_${sanitizeFilename(listTitle)}_${getDateString()}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up URL
    setTimeout(() => URL.revokeObjectURL(url), 100);
  } catch (error) {
    console.error('Erro ao baixar relatório CSV:', error);
    throw new Error('Erro ao baixar relatório CSV');
  }
}

/**
 * Download report as PDF (using browser print to PDF)
 */
export function downloadPDF(elementId: string, filename: string) {
  // Open print dialog (user can save as PDF)
  window.print();
  
  // Note: For true PDF generation, you would need a library like jsPDF or html2pdf
  // This is a simple solution that relies on the browser's print-to-PDF functionality
}

/**
 * Download activity document
 */
export function downloadDocument(filename: string, content?: Blob) {
  try {
    if (content) {
      // If actual content is provided, download it
      const link = document.createElement('a');
      const url = URL.createObjectURL(content);
      
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up URL
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } else {
      // Simulate download for demo purposes
      // In a real application, this would fetch the file from the server
      const mockContent = `Este é um documento comprobatório: ${filename}\n\nEm um sistema real, este arquivo seria baixado do servidor.`;
      const blob = new Blob([mockContent], { type: 'text/plain' });
      
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up URL
      setTimeout(() => URL.revokeObjectURL(url), 100);
    }
  } catch (error) {
    console.error('Erro ao baixar documento:', error);
    throw new Error('Erro ao baixar documento');
  }
}

/**
 * Handle file upload and return file data
 */
export function handleFileUpload(file: File): Promise<{ name: string; size: number; type: string; data: string }> {
  return new Promise((resolve, reject) => {
    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      reject(new Error('Arquivo muito grande. Tamanho máximo: 10MB'));
      return;
    }
    
    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      reject(new Error('Tipo de arquivo não permitido. Use PDF, JPG, PNG ou DOC/DOCX'));
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        resolve({
          name: file.name,
          size: file.size,
          type: file.type,
          data: result // Base64 encoded data
        });
      } else {
        reject(new Error('Falha ao ler arquivo'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Erro ao ler arquivo'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Parse CSV file and return array of objects
 */
export function parseCSV(csvText: string): Record<string, string>[] {
  const lines = csvText.split('\n').filter(line => line.trim());
  
  if (lines.length === 0) {
    return [];
  }
  
  // Get headers
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  
  // Parse rows
  const data: Record<string, string>[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const row: Record<string, string> = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    
    data.push(row);
  }
  
  return data;
}

/**
 * Read CSV file from File input
 */
export function readCSVFile(file: File): Promise<Record<string, string>[]> {
  return new Promise((resolve, reject) => {
    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      reject(new Error('O arquivo deve ser do tipo CSV'));
      return;
    }
    
    // Validate file size (max 5MB for CSV)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      reject(new Error('Arquivo CSV muito grande. Tamanho máximo: 5MB'));
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const text = e.target?.result as string;
      try {
        const data = parseCSV(text);
        if (data.length === 0) {
          reject(new Error('Arquivo CSV vazio ou inválido'));
          return;
        }
        resolve(data);
      } catch (error) {
        reject(new Error('Erro ao processar arquivo CSV'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Erro ao ler arquivo CSV'));
    };
    
    reader.readAsText(file, 'UTF-8');
  });
}

/**
 * Import students from CSV file
 */
export async function importStudentsFromCSV(
  file: File,
  listId: string,
  setStudents: (updater: (prev: any[]) => any[]) => void
): Promise<number> {
  try {
    const csvData = await readCSVFile(file);
    
    // Validate required columns
    const requiredColumns = ['Nome', 'CPF', 'Curso', 'Turma'];
    const hasRequiredColumns = requiredColumns.every(col => 
      csvData.length > 0 && csvData[0].hasOwnProperty(col)
    );
    
    if (!hasRequiredColumns) {
      throw new Error('CSV deve conter as colunas: Nome, CPF, Curso, Turma');
    }
    
    const newStudents = csvData
      .filter(row => row['Nome'] && row['CPF']) // Filter out empty rows
      .map((row, index) => ({
        id: `imported-${Date.now()}-${index}`,
        name: row['Nome'] || row['name'] || '',
        cpf: row['CPF'] || row['cpf'] || '',
        course: row['Curso'] || row['course'] || '',
        class: row['Turma'] || row['class'] || '',
        listId: listId,
        totalHours: 0,
        status: 'em andamento' as const
      }));
    
    if (newStudents.length === 0) {
      throw new Error('Nenhum estudante válido encontrado no arquivo');
    }
    
    setStudents((prev) => [...prev, ...newStudents]);
    
    return newStudents.length;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Erro ao importar arquivo CSV');
  }
}

// Helper functions

function sanitizeFilename(filename: string): string {
  return filename
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_-]/g, '');
}

// Use getDateStringForFilename from dateUtils instead
const getDateString = getDateStringForFilename;

/**
 * Generate sample CSV template for student import
 */
export function downloadCSVTemplate() {
  try {
    const headers = ['Nome', 'CPF', 'Curso', 'Turma'];
    const sampleData = [
      ['João da Silva', '123.456.789-00', 'Engenharia Civil', '2024.1'],
      ['Maria Santos', '234.567.890-11', 'Engenharia Mecânica', '2024.1'],
      ['Pedro Oliveira', '345.678.901-22', 'Engenharia Elétrica', '2024.2']
    ];
    
    const csvContent = [
      headers.join(','),
      ...sampleData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `modelo_importacao_estudantes.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up URL
    setTimeout(() => URL.revokeObjectURL(url), 100);
  } catch (error) {
    console.error('Erro ao baixar modelo CSV:', error);
    throw new Error('Erro ao baixar modelo CSV');
  }
}

// Re-export date utilities for convenience
export { getMaxDate, isValidDate } from './dateUtils';
