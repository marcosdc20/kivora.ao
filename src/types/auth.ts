// ==========================================
// Kivora – Tipos de Autenticação e Perfis
// ==========================================

export type UserRole = 'admin' | 'teacher' | 'student' | 'guardian';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  title: string;
  schoolName?: string;
  studentId?: string;
  grade?: string;
  classRoom?: string;
}

export interface DemoAccount {
  role: UserRole;
  label: string;
  description: string;
  email: string;
  image: string;
  session: UserSession;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: 'admin',
    label: 'Direção & Administração (Admin)',
    description: 'Gestão geral da plataforma, finanças, relatórios e permissões',
    email: 'admin@kivora.ao',
    image: '/imagens/46908.jpg',
    session: {
      id: 'usr-admin-01',
      name: 'Dr. Adelino Costa',
      email: 'admin@kivora.ao',
      role: 'admin',
      avatar: '/imagens/46908.jpg',
      title: 'Director Geral & Operações',
      schoolName: 'Kivora Angola – Luanda',
    }
  },
  {
    role: 'teacher',
    label: 'Portal do Gestor / Docente',
    description: 'Lançamento de relatórios, acompanhamento e atribuições',
    email: 'gestor@kivora.ao',
    image: '/imagens/2150690165.jpg',
    session: {
      id: 'usr-teacher-01',
      name: 'Eng.º Ricardo Sousa',
      email: 'gestor@kivora.ao',
      role: 'teacher',
      avatar: '/imagens/2150690165.jpg',
      title: 'Coordenador Técnico de Parceiros',
      schoolName: 'Kivora Angola – Luanda',
    }
  },
  {
    role: 'student',
    label: 'Portal do Utilizador',
    description: 'Acompanhamento de boletins, histórico e horários',
    email: 'utilizador@kivora.ao',
    image: '/imagens/2149153824.jpg',
    session: {
      id: 'aluno-001',
      name: 'Dra. Ana Beatriz Ferreira',
      email: 'utilizador@kivora.ao',
      role: 'student',
      avatar: '/imagens/2149153824.jpg',
      title: 'Gestora Comercial Cliente',
      grade: '10ª Classe',
      classRoom: 'Turma A (Manhã)',
      schoolName: 'Kivora Angola – Luanda',
    }
  },
  {
    role: 'guardian',
    label: 'Portal do Encarregado / Acompanhante',
    description: 'Acompanhamento de relatórios, finanças e avisos',
    email: 'encarregado@kivora.ao',
    image: '/imagens/2206.jpg',
    session: {
      id: 'usr-guardian-01',
      name: 'Maria Ferreira',
      email: 'encarregado@kivora.ao',
      role: 'guardian',
      avatar: '/imagens/2206.jpg',
      title: 'Responsável Financeira',
      studentId: 'aluno-001',
      schoolName: 'Kivora Angola – Luanda',
    }
  }
];
