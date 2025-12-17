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
export async function downloadPDF(elementId: string, filename: string) {
  try {
    const element = elementId ? document.getElementById(elementId) : document.body;
    const title = filename || document.title || 'relatorio';

    // Open a new window and write the element's HTML to it, then print
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      // Fallback to default print if window couldn't be opened
      console.warn('Não foi possível abrir a janela de impressão. Usando print padrão.');
      window.print();
      return;
    }

    // Create basic document skeleton first
    printWindow.document.open();
    printWindow.document.write('<!doctype html><html><head></head><body></body></html>');
    printWindow.document.close();

    // Copy original head (styles, fonts, meta) to new window to preserve layout
    try {
      // Insert a <base> so relative URLs resolve correctly in the new window
      const base = `<base href="${location.origin + location.pathname}">`;
      const headHtml = base + document.head.innerHTML;

      // Temporary print styles to better match on-paper appearance
      const tempPrintStyles = `
        <style>
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
          body { background: #fff; }
          .print-root { box-sizing: border-box; width: 210mm; margin: 0 auto; padding: 12mm; }
          .print-root img { max-width: 180px; height: auto; }
        </style>
      `;

      printWindow.document.head.innerHTML = headHtml + tempPrintStyles;

      // Clone the element into the print window inside a wrapper for sizing
      const cloned = (element ? element.cloneNode(true) as HTMLElement : document.body.cloneNode(true) as HTMLElement);
      const wrapper = printWindow.document.createElement('div');
      wrapper.className = 'print-root';
      wrapper.appendChild(cloned);
      printWindow.document.body.innerHTML = '';
      printWindow.document.body.appendChild(wrapper);

      // Wait for fonts and images to load in the new window before printing
      const waitForResources = async () => {
        try {
          if (printWindow.document.fonts && 'ready' in printWindow.document.fonts) {
            await (printWindow.document.fonts as any).ready;
          }
        } catch (e) {
          // ignore
        }

        const imgs = Array.from(printWindow.document.images || []);
        if (imgs.length === 0) return;

        await new Promise((res) => {
          let loaded = 0;
          const onDone = () => { loaded++; if (loaded >= imgs.length) res(null); };
          imgs.forEach((img) => {
            if ((img as HTMLImageElement).complete) onDone();
            else {
              img.addEventListener('load', onDone);
              img.addEventListener('error', onDone);
            }
          });
          // Fallback timeout
          setTimeout(res, 2000);
        });
      };

      await waitForResources();

      printWindow.focus();
      // Delay slightly to ensure rendering
      setTimeout(() => {
        try {
          printWindow.print();
        } catch (e) {
          console.warn('Erro ao chamar print() na nova janela:', e);
        }
        // Close window after print dialog
        setTimeout(() => {
          try { printWindow.close(); } catch (e) { /* ignore */ }
        }, 500);
      }, 250);
    } catch (err) {
      console.error('Erro ao preparar janela de impressão:', err);
      try { window.print(); } catch (e) { /* ignore */ }
    }
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    window.print();
  }
}

/**
 * Generate and download PDF programmatically using html2canvas + jsPDF.
 * This produces a downloadable PDF without opening print dialog.
 */
export async function downloadReportAsPDF(elementId: string | undefined, filename?: string) {
  try {
    console.log('downloadReportAsPDF: iniciando para', elementId, filename);
    const element = elementId ? document.getElementById(elementId) : document.body;
    if (!element) throw new Error('Elemento não encontrado para gerar PDF');

    // Dynamic imports so app still builds if libs are not used elsewhere
    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
      // @ts-ignore
      import('html2canvas'),
      // @ts-ignore
      import('jspdf')
    ]);
    // Clone element to avoid modifying original layout
    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.boxSizing = 'border-box';
    // Set width to A4 at 96dpi ~ 794px to better match printed page
    clone.style.width = '794px';
    clone.style.maxWidth = '794px';
    clone.style.margin = '0';

    const wrapper = document.createElement('div');
    wrapper.style.position = 'fixed';
    wrapper.style.left = '-9999px';
    wrapper.style.top = '0';
    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    // Inline computed colors to avoid html2canvas failing on new color functions (e.g. oklch)
    function inlineComputedColors(root: HTMLElement) {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, null as any);
      const elements: HTMLElement[] = [];
      let node = root as Node | null;
      while (node) {
        if (node.nodeType === Node.ELEMENT_NODE) elements.push(node as HTMLElement);
        node = walker.nextNode();
      }

      // single canvas to parse colors
      const parseCanvas = document.createElement('canvas');
      parseCanvas.width = 1;
      parseCanvas.height = 1;
      const pCtx = parseCanvas.getContext('2d');

      async function parseColorToRGBA(colorStr: string): Promise<string | null> {
        if (!pCtx) return null;
        try {
          pCtx.clearRect(0, 0, 1, 1);
          pCtx.fillStyle = '#000';
          // assign, browser should parse supported color formats
          pCtx.fillStyle = colorStr;
          pCtx.fillRect(0, 0, 1, 1);
          const d = pCtx.getImageData(0, 0, 1, 1).data;
          return `rgba(${d[0]}, ${d[1]}, ${d[2]}, ${+(d[3] / 255).toFixed(3)})`;
        } catch (e) {
          return null;
        }
      }

      const colorFuncRegex = /(oklch\([^)]*\))/gi;

      elements.forEach((el) => {
        try {
          const cs = window.getComputedStyle(el);
          if (!cs) return;

          // helper to replace oklch occurrences inside a css value
          const replaceColorFuncs = async (value: string) => {
            if (!value) return value;
            const matches = Array.from(value.matchAll(colorFuncRegex));
            if (matches.length === 0) return value;
            let newValue = value;
            for (const m of matches) {
              const func = m[1];
              const parsed = await parseColorToRGBA(func).catch(() => null);
              if (parsed) newValue = newValue.replace(func, parsed);
            }
            return newValue;
          };

          // inline simple properties synchronously where possible
          (async () => {
            // color
            let colorVal = cs.color;
            if (colorVal && colorVal.toLowerCase().includes('oklch')) {
              const resolved = await parseColorToRGBA(colorVal);
              if (resolved) el.style.color = resolved;
            } else if (colorVal) {
              el.style.color = colorVal;
            }

            // background-color
            let bg = cs.backgroundColor;
            if (bg && bg.toLowerCase().includes('oklch')) {
              const resolved = await parseColorToRGBA(bg);
              if (resolved) el.style.backgroundColor = resolved;
            } else if (bg) {
              el.style.backgroundColor = bg;
            }

            // border color
            let bcol = cs.borderColor;
            if (bcol && bcol.toLowerCase().includes('oklch')) {
              const resolved = await parseColorToRGBA(bcol);
              if (resolved) el.style.borderColor = resolved;
            } else if (bcol) {
              el.style.borderColor = bcol;
            }

            // outline
            let ocol = cs.outlineColor;
            if (ocol && ocol.toLowerCase().includes('oklch')) {
              const resolved = await parseColorToRGBA(ocol);
              if (resolved) el.style.outlineColor = resolved;
            } else if (ocol) {
              el.style.outlineColor = ocol;
            }

            // box-shadow may contain color functions inside; replace occurrences
            let bs = cs.boxShadow;
            if (bs && bs !== 'none') {
              if (bs.toLowerCase().includes('oklch')) {
                const replaced = await replaceColorFuncs(bs);
                el.style.boxShadow = replaced;
              } else {
                el.style.boxShadow = bs;
              }
            }
          })();
        } catch (e) {
          // ignore elements that throw on computedStyle
        }
      });
    }

    try {
      inlineComputedColors(clone);
    } catch (e) {
      // continue even if inlining fails
      console.warn('Falha ao injetar estilos computados:', e);
    }

    const canvas = await html2canvas(clone, { scale: 2, useCORS: true });

    // remove clone after render
    document.body.removeChild(wrapper);

    const imgDataFull = canvas.toDataURL('image/png');

    const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageWidthMM = pdf.internal.pageSize.getWidth(); // 210
    const pageHeightMM = pdf.internal.pageSize.getHeight(); // 297

    // calculate px per mm for this canvas
    const pxPerMM = canvas.width / pageWidthMM;
    const pageHeightPx = Math.floor(pageHeightMM * pxPerMM);

    let renderedHeight = 0;
    let pageIndex = 0;

    while (renderedHeight < canvas.height) {
      const canvasPage = document.createElement('canvas');
      canvasPage.width = canvas.width;
      const remaining = canvas.height - renderedHeight;
      canvasPage.height = remaining > pageHeightPx ? pageHeightPx : remaining;

      const ctx = canvasPage.getContext('2d');
      if (!ctx) throw new Error('Não foi possível obter contexto do canvas');

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvasPage.width, canvasPage.height);

      ctx.drawImage(
        canvas,
        0,
        renderedHeight,
        canvas.width,
        canvasPage.height,
        0,
        0,
        canvas.width,
        canvasPage.height
      );

      const imgData = canvasPage.toDataURL('image/png');

      const imgHeightMM = canvasPage.height / pxPerMM;

      if (pageIndex > 0) pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, 0, pageWidthMM, imgHeightMM);

      renderedHeight += canvasPage.height;
      pageIndex++;
    }

    const name = filename || `relatorio_${sanitizeFilename(document.title || 'relatorio')}_${getDateString()}.pdf`;
    pdf.save(name);
  } catch (error) {
    console.error('Erro ao gerar PDF programaticamente:', error);
    // Fallback: abrir modal de impressão (inline) para permitir o usuário gerar PDF via print
    try {
      downloadPDF(elementId || '', filename || 'relatorio.pdf');
      return;
    } catch (e) {
      // Se também falhar, propagar erro
      throw error;
    }
  }
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
  listId: number,
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
