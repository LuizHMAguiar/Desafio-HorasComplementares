export interface User {
  id: string;
  name: string;
  email: string;
  role: 'coordenador' | 'monitor';
}

export interface Activity {
  id: string;
  studentId: string;
  type: string;
  hours: number;
  date: string;
  registeredBy: string;
  document?: string;
  notes?: string;
}

export interface Student {
  id: string;
  name: string;
  cpf: string;
  course: string;
  class: string;
  listId: string;
  totalHours: number;
  status: 'em andamento' | 'concluído';
}

export interface ActivityList {
  id: string;
  title: string;
  totalHours: number;
  maxHoursPerType: number;
  studentCount: number;
  createdAt: string;
}