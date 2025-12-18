# 🎓 Sistema de Gestão de Atividades Estudantis

Sistema completo para gerenciamento, validação e acompanhamento de horas complementares em instituições de ensino. O projeto permite que coordenadores criem turmas, monitores acompanhem o progresso e o sistema gere relatórios automáticos.

## ✨ Funcionalidades

### 🔐 Controle de Acesso

* 
**Coordenador:** Acesso total (Criar listas, cadastrar alunos, validar atividades, gerar relatórios).


* 
**Monitor:** Acesso de visualização (Acompanhar progresso e visualizar atividades).



### 📊 Gestão Acadêmica

* 
**Dashboard Interativo:** Visão geral de turmas, alunos e horas totais.


* 
**Listas de Atividades:** Configuração personalizada de carga horária total e limites por tipo de atividade.


* 
**Cadastro de Alunos:** Adição manual ou **Importação em massa via CSV**.



### 📝 Validação de Atividades

* Registro detalhado com tipo, horas, data e upload de comprovantes.


* 
**Validação de Regras:** Impede datas futuras e verifica limites de horas.


* Cálculo automático de progresso (barra de status).



### 🖨️ Relatórios e Exportação

* Geração de **Relatórios em PDF** prontos para impressão.


* Exportação de dados de alunos para **CSV**.



---

## 🚀 Como Rodar o Projeto

### Pré-requisitos

Antes de começar, você precisará ter instalado em sua máquina:

* [Node.js](https://nodejs.org/en/) (Versão 18 ou superior recomendada)
* npm ou yarn

### Passo a Passo

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/gestao-atividades-estudantis.git
cd gestao-atividades-estudantis

```


2. **Instale as dependências**
```bash
npm install
# ou
yarn install

```


3. **Configure as Variáveis de Ambiente (Opcional)**
O sistema se conecta a uma API padrão.

Crie um arquivo `.env` na raiz se desejar apontar para um backend específico:
```env
VITE_API_BASE=http://localhost:8080

```


4. **Execute o projeto**
```bash
npm run dev

```


5. **Acesse no navegador**
O servidor iniciará automaticamente na porta configurada (3000):
* Acesse: `http://localhost:3000` 





---

## 👥 Credenciais de Acesso (Demo)

Para testar as funcionalidades, utilize as contas de demonstração configuradas no sistema:

| Perfil | Email | Senha | Permissões |
| --- | --- | --- | --- |
| **Coordenador** | `coordenador@escola.com` | `123456` | Leitura e Escrita |
| **Monitor** | `monitor@escola.com` | `123456` | Apenas Leitura |

---

## 🛠️ Tecnologias Utilizadas

* 
**Core:** React 18, TypeScript, Vite.


* 
**Estilização:** Tailwind CSS v4, PostCSS.


* 
**Componentes UI:** Shadcn/ui (Radix UI base).


* 
**Ícones:** Lucide React.


* 
**Gráficos:** Recharts.


* 
**PDF/Export:** jsPDF, html2canvas.


* 
**Formulários:** React Hook Form.


* 
**Notificações:** Sonner.



---

## 📂 Estrutura do Projeto

```bash
src/
├── components/         # Componentes React
│   ├── ui/             # Componentes base (Shadcn)
│   ├── Dashboard.tsx   # Painel principal
│   ├── StudentsPage.tsx# Listagem de alunos
│   └── ...
├── utils/              # Funções auxiliares
│   ├── api.ts          # Camada de serviço API
│   ├── exportUtils.ts  # Lógica de PDF/CSV
│   └── dateUtils.ts    # Formatação de datas
├── types.ts            # Definições de Tipos TS
└── App.tsx             # Roteamento e Layout

```

---

## 📄 Licença

Este projeto é de uso privado para fins acadêmicos.
Ícones por [Lucide](https://lucide.dev) e componentes por [shadcn/ui](https://ui.shadcn.com).