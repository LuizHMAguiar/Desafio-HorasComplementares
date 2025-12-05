export interface User {
  id: number;
  name: string;
  email: string;
  role: 'coordenador' | 'monitor';
}

export interface Activity {
  id: number;
  studentId: number;
  type: string;
  hours: number;
  date: string;
  registeredBy: string;
  document?: string;
  notes?: string;
}

export interface Student {
  id: number;
  name: string;
  cpf: string;
  course: string;
  class: string;
  listId: number;
  totalHours: number;
  status: 'em andamento' | 'concluído';
}

export interface StudentList {
  id: number;
  title: string;
  totalHours: number;
  maxHoursPerType: number;
  studentCount: number;
  createdAt: string;
}