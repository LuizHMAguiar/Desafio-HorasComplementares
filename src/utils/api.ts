import { Student, StudentList, Activity, User } from "../types";

const API_BASE =
  (import.meta.env.VITE_API_BASE as string) ||
  "https://horascomplementares-api.onrender.com";

async function handleResponse(res: Response) {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json().catch(() => null);
}

export const api = {
  // Users
  getUsers: async (): Promise<User[]> => {
    const res = await fetch(`${API_BASE}/users`);
    return handleResponse(res);
  },
  getUserById: async (id: number): Promise<User> => {
    const res = await fetch(`${API_BASE}/users/${id}`);
    return handleResponse(res);
  },
  createUser: async (data: Partial<User>): Promise<User> => {
    const res = await fetch(`${API_BASE}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  updateUser: async (id: number, data: Partial<User>): Promise<User> => {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // Student Lists
  getStudentLists: async (): Promise<StudentList[]> => {
    const res = await fetch(`${API_BASE}/studentLists`);
    return handleResponse(res);
  },
  getStudentListById: async (id: number): Promise<StudentList> => {
    const res = await fetch(`${API_BASE}/studentLists/${id}`);
    return handleResponse(res);
  },

  // Students
  getStudents: async (params?: { listId?: number }): Promise<Student[]> => {
    let url = `${API_BASE}/students`;
    if (params?.listId) url += `?listId=${params.listId}`;
    const res = await fetch(url);
    return handleResponse(res);
  },
  getStudentById: async (id: number): Promise<Student> => {
    const res = await fetch(`${API_BASE}/students/${id}`);
    return handleResponse(res);
  },
  createStudent: async (data: Partial<Student>): Promise<Student> => {
    const res = await fetch(`${API_BASE}/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  updateStudent: async (
    id: number,
    data: Partial<Student>
  ): Promise<Student> => {
    const res = await fetch(`${API_BASE}/students/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // Activities
  getActivities: async (params?: {
    studentId?: number;
  }): Promise<Activity[]> => {
    let url = `${API_BASE}/activities`;
    if (params?.studentId) url += `?studentId=${params.studentId}`;
    const res = await fetch(url);
    return handleResponse(res);
  },
  getActivityById: async (id: number): Promise<Activity> => {
    const res = await fetch(`${API_BASE}/activities/${id}`);
    return handleResponse(res);
  },
  createActivity: async (data: Partial<Activity>): Promise<Activity> => {
    const { id, ...activityData } = data;

    const res = await fetch(`${API_BASE}/activities`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(activityData),
    });
    return handleResponse(res);
  },
  updateActivity: async (
    id: number,
    data: Partial<Activity>
  ): Promise<Activity> => {
    const res = await fetch(`${API_BASE}/activities/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  deleteActivity: async (id: number): Promise<void> => {
    const res = await fetch(`${API_BASE}/activities/${id}`, {
      method: "DELETE",
    });
    return handleResponse(res);
  },
};

export default api;
