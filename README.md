Baseado na análise completa do código fonte do seu projeto, identifiquei que ele está muito bem estruturado e utiliza tecnologias modernas (Tailwind v4, Shadcn/ui, Vite).

Não encontrei erros críticos na estrutura ou lógica descrita no código. No entanto, o **README atual pode ser enriquecido** para refletir melhor a complexidade das regras de negócio (como o cálculo de horas válidas com teto por tipo) e as bibliotecas específicas que você utilizou.

Aqui está uma versão aprimorada e profissional do `README.md` para o seu portfólio ou repositório:

```markdown
# 🎓 Sistema de Gestão de Atividades Complementares

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)

Uma solução completa para o gerenciamento, validação e acompanhamento de horas complementares em instituições de ensino. O sistema automatiza o cálculo de horas válidas, aplica regras de teto por categoria e gera relatórios detalhados para coordenadores e alunos.

---

## ✨ Funcionalidades Principais

### 📊 Painel de Controle (Dashboard)
- **Visão Geral:** Métricas em tempo real sobre total de alunos, listas ativas e horas cadastradas.
- **Gráficos e Indicadores:** Acompanhamento visual do progresso das turmas.

### 👥 Gestão de Estudantes e Listas
- **Listas Personalizadas:** Criação de turmas com configurações específicas de carga horária total e teto máximo por tipo de atividade.
- **Importação em Massa:** Suporte para upload de arquivos `.csv` para cadastro rápido de múltiplos alunos.
- **Perfis Individuais:** Página detalhada de cada aluno com histórico de atividades e barra de progresso.

### 📝 Validação e Regras de Negócio
- **Cálculo Inteligente:** O sistema diferencia **Horas Brutas** de **Horas Válidas**, aplicando automaticamente o limite máximo permitido por tipo de atividade (ex: Pesquisa, Extensão, Monitoria).
- **Feedback Visual:** Alertas visuais quando um aluno excede o limite de horas em uma categoria específica.
- **Status Automático:** Atualização dinâmica do status ("Em andamento" ou "Concluído") com base no cumprimento da carga horária.

### 🖨️ Relatórios e Exportação
- **Geração de PDF:** Relatórios formatados prontos para impressão ou arquivo digital.
- **Exportação CSV:** Download de dados consolidados dos alunos para planilhas externas.
- **Comprovantes:** Upload e visualização de documentos comprobatórios (PDF/Imagens).

---

## 🛠️ Tecnologias Utilizadas

O projeto foi desenvolvido com foco em performance, acessibilidade e experiência do desenvolvedor:

* **Core:** [React 18](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
* **Estilização:** [Tailwind CSS v4](https://tailwindcss.com/) (com variáveis CSS nativas e Oklch colors)
* **Componentes UI:** [Shadcn/ui](https://ui.shadcn.com/) (Radix UI primitives)
* **Ícones:** [Lucide React](https://lucide.dev/)
* **Visualização de Dados:** [Recharts](https://recharts.org/)
* **Formulários:** [React Hook Form](https://react-hook-form.com/)
* **Utilitários:** `sonner` (toasts), `jspdf` & `html2canvas` (geração de PDF), `date-fns` (manipulação de datas)

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
* Node.js (v18 ou superior)
* Gerenciador de pacotes (npm, yarn ou pnpm)

### Passo a Passo

1.  **Clone o repositório**
    ```bash
    git clone [https://github.com/LuizHMAguiar/Desafio-HorasComplementares]
    cd desafio-horascomplementares
    ```

2.  **Instale as dependências**
    ```bash
    npm install
    ```

3.  **Configure o Ambiente (Opcional)**
    O sistema já vem configurado para conectar a uma API padrão. Caso queira apontar para um backend local ou específico, crie um arquivo `.env`:
    ```env
    VITE_API_BASE="[https://sua-api-customizada.com](https://sua-api-customizada.com)"
    ```

4.  **Inicie o servidor de desenvolvimento**
    ```bash
    npm run dev
    ```

5.  **Acesse a aplicação**
    Abra `http://localhost:3000` (ou a porta indicada no terminal).

---

## 🔐 Credenciais de Acesso (Demo)

Para testar as diferentes permissões do sistema, utilize as contas abaixo:

| Perfil | Email | Senha | Permissões |
| :--- | :--- | :--- | :--- |
| **Coordenador** | `coordenador@escola.com` | `123456` | Leitura, Escrita, Edição, Relatórios |
| **Monitor** | `monitor@escola.com` | `123456` | Apenas Leitura e Visualização |

---

## 📂 Estrutura do Projeto

```bash
src/
├── components/         # Componentes React modularizados
│   ├── ui/             # Biblioteca de componentes base (Buttons, Cards, Inputs)
│   ├── Dashboard.tsx   # Lógica do painel principal
│   ├── StudentProfile.tsx # Lógica de perfil e cálculo de horas
│   └── ...
├── utils/              # Funções auxiliares
│   ├── api.ts          # Camada de comunicação com o Backend
│   ├── calculations.ts # Regras de negócio (cálculo de horas válidas)
│   └── exportUtils.ts  # Geradores de PDF e CSV
├── types.ts            # Definições de interfaces TypeScript
└── App.tsx             # Roteamento e gerenciamento de estado global

```

---

## 📄 Licença

Este projeto é desenvolvido para fins acadêmicos e educacionais. Componentes visuais utilizam a licença MIT via shadcn/ui.