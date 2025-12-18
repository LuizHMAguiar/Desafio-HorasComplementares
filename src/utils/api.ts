import { Activity, Student, StudentList, User } from "../types";

// URL FIXA da sua API no Render (Removi a variável de ambiente para garantir)
const API_BASE = "https://horascomplementares-api.onrender.com";

// Helper para tratar respostas
const handleResponse = async (res: Response) => {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Erro API: ${res.status}`);
  }
  return res.json();
};

export const api = {
  // --- Usuários ---
  getUsers: async (): Promise<User[]> => {
    const res = await fetch(`${API_BASE}/users`);
    return handleResponse(res);
  },

  // --- Listas (Corrigido para /studentLists) ---
  getStudentLists: async (): Promise<StudentList[]> => {
    // Timeout estendido para 15s (o Render demora a acordar no plano free)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      // ATENÇÃO: Mudamos de '/lists' para '/studentLists' para bater com sua API
      const res = await fetch(`${API_BASE}/studentLists`, { signal: controller.signal });
      return await handleResponse(res);
    } catch (error) {
      console.error("API Error (Lists):", error);
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  },

  createStudentList: async (list: Omit<StudentList, "id">): Promise<StudentList> => {
    const res = await fetch(`${API_BASE}/studentLists`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(list),
    });
    return handleResponse(res);
  },

  updateStudentList: async (list: StudentList): Promise<StudentList> => {
    const res = await fetch(`${API_BASE}/studentLists/${list.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(list),
    });
    return handleResponse(res);
  },

  // --- Alunos ---
  getStudents: async ({ listId }: { listId: number }): Promise<Student[]> => {
    // A API json-server filtra usando query params (ex: ?listId=1)
    const url = listId ? `${API_BASE}/students?listId=${listId}` : `${API_BASE}/students`;
    const res = await fetch(url);
    return handleResponse(res);
  },

  createStudent: async (student: Student): Promise<Student> => {
    const res = await fetch(`${API_BASE}/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(student),
    });
    return handleResponse(res);
  },

  // --- Atividades ---
  getActivities: async ({ studentId }: { studentId: number }): Promise<Activity[]> => {
    const url = studentId ? `${API_BASE}/activities?studentId=${studentId}` : `${API_BASE}/activities`;
    const res = await fetch(url);
    return handleResponse(res);
  },

  createActivity: async (activity: Omit<Activity, "id">): Promise<Activity> => {
    const res = await fetch(`${API_BASE}/activities`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(activity),
    });
    return handleResponse(res);
  },

  updateActivity: async (id: number, activity: Partial<Activity>): Promise<void> => {
    await fetch(`${API_BASE}/activities/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(activity),
    });
  },

  deleteActivity: async (id: number): Promise<void> => {
    await fetch(`${API_BASE}/activities/${id}`, {
      method: "DELETE",
    });
  },
};

export default api;