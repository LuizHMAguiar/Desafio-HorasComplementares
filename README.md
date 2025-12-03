# Sistema de Gestão de Atividades Estudantis

Sistema completo para gestão de atividades complementares estudantis com controle de carga horária, upload de documentos e geração de relatórios.

## 🚀 Instalação e Execução

### Pré-requisitos
- Node.js (versão 16 ou superior)
- npm ou yarn

### Instalação

```bash
# Instalar dependências
npm install

# Executar em modo de desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build de produção
npm run preview
```

O sistema estará disponível em `http://localhost:5173`

## 👥 Credenciais de Acesso

### Coordenador (acesso completo)
- Email: coordenador@faculdade.edu.br
- Senha: coord123

### Monitor (acesso de visualização)
- Email: monitor@faculdade.edu.br
- Senha: monitor123

## 📁 Estrutura do Projeto

```
/
├── src/
│   └── main.tsx              # Entry point da aplicação
├── components/
│   ├── Dashboard.tsx         # Dashboard principal
│   ├── ListsPage.tsx         # Gestão de listas de atividades
│   ├── StudentsPage.tsx      # Gestão de estudantes
│   ├── StudentProfile.tsx    # Perfil e atividades do estudante
│   ├── ReportPage.tsx        # Relatórios para impressão
│   ├── LoginPage.tsx         # Página de autenticação
│   ├── Navbar.tsx            # Barra de navegação
│   └── ui/                   # Componentes de UI reutilizáveis
├── utils/
│   ├── exportUtils.ts        # Funções de export (CSV, PDF)
│   └── dateUtils.ts          # Funções de manipulação de datas
├── styles/
│   └── globals.css           # Estilos globais
└── App.tsx                   # Componente principal

```

## ✨ Funcionalidades

### Coordenador
- ✅ Criar e editar listas de atividades
- ✅ Adicionar e importar estudantes via CSV
- ✅ Registrar atividades complementares
- ✅ Upload de documentos comprobatórios
- ✅ Gerar relatórios completos
- ✅ Exportar dados em CSV
- ✅ Imprimir relatórios em PDF

### Monitor
- ✅ Visualizar listas de atividades
- ✅ Acompanhar progresso dos estudantes
- ✅ Visualizar atividades registradas
- ✅ Gerar relatórios

## 🎯 Características Técnicas

- **Frontend**: React 18 + TypeScript
- **Estilização**: Tailwind CSS
- **Componentes UI**: shadcn/ui
- **Ícones**: Lucide React
- **Gráficos**: Recharts
- **Notificações**: Sonner
- **Build Tool**: Vite

## 📊 Validações Implementadas

- ✅ Datas não podem ser posteriores à data atual
- ✅ Upload de arquivos com limite de 10MB
- ✅ Tipos de arquivo permitidos: PDF, JPG, PNG, DOC, DOCX
- ✅ CSV com validação de colunas obrigatórias
- ✅ Formulários com validação de campos

## 📤 Importação de Estudantes

O sistema aceita arquivos CSV com as seguintes colunas:

| Nome | CPF | Curso | Turma |
|------|-----|-------|-------|
| João da Silva | 123.456.789-00 | Engenharia Civil | 2024.1 |
| Maria Santos | 234.567.890-11 | Engenharia Mecânica | 2024.1 |

Baixe o modelo CSV através do botão "Baixar Modelo" na página de estudantes.

## 🎨 Design

Interface limpa e profissional com:
- Navegação intuitiva baseada em roles
- Feedback visual com toasts
- Barras de progresso
- Filtros de busca
- Dashboards diferenciados por perfil

## 📝 Licença

Este projeto é propriedade privada.
