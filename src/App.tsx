import { useState } from 'react';
import { LoginPage } from './components/LoginPage';
import { Dashboard } from './components/Dashboard';
import { ListsPage } from './components/ListsPage';
import { StudentsPage } from './components/StudentsPage';
import { StudentProfile } from './components/StudentProfile';
import { ReportPage } from './components/ReportPage';
import { Navbar } from './components/Navbar';
import { Toaster } from './components/ui/sonner';

export type UserRole = 'coordenador' | 'monitor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface ActivityList {
  id: string;
  title: string;
  totalHours: number;
  maxHoursPerType: number;
  studentCount: number;
  createdAt: string;
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

type Page = 'login' | 'dashboard' | 'lists' | 'students' | 'student-profile' | 'report';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedList, setSelectedList] = useState<ActivityList | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage('login');
    setSelectedList(null);
    setSelectedStudent(null);
  };

  const navigateTo = (page: Page, list?: ActivityList, student?: Student) => {
    setCurrentPage(page);
    if (list) setSelectedList(list);
    if (student) setSelectedStudent(student);
  };

  if (currentPage === 'login') {
    return (
      <>
        <LoginPage onLogin={handleLogin} />
        <Toaster />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={currentUser!} onLogout={handleLogout} onNavigate={navigateTo} />
      
      <main className="pt-16">
        {currentPage === 'dashboard' && (
          <Dashboard user={currentUser!} onNavigate={navigateTo} />
        )}
        
        {currentPage === 'lists' && (
          <ListsPage onNavigate={navigateTo} />
        )}
        
        {currentPage === 'students' && selectedList && (
          <StudentsPage list={selectedList} onNavigate={navigateTo} />
        )}
        
        {currentPage === 'student-profile' && selectedStudent && (
          <StudentProfile student={selectedStudent} onNavigate={navigateTo} />
        )}
        
        {currentPage === 'report' && selectedList && (
          <ReportPage list={selectedList} />
        )}
      </main>

      <Toaster />
    </div>
  );
}