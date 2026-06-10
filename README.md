# 🎮 GG Mates

**Plataforma Social para Encontrar Companheiros de Jogo**

Proposta de Tema — Projeto Final React

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%2B%20Auth-FFCA28?logo=firebase&logoColor=black)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2024-F7DF1E?logo=javascript&logoColor=black)

📅 *2 de junho de 2026*

---

## 📋 Descrição Resumida

O **GG Mates** é uma plataforma social web destinada a jogadores que procuram companheiros de jogo compatíveis. A aplicação permite que qualquer utilizador registado publique um perfil de jogo descrevendo o título que joga, a sua plataforma, nível de skill, disponibilidade horária e estilo de jogo — tornando-se assim visível para a restante comunidade.

Outros utilizadores podem explorar os perfis publicados, filtrar por plataforma, região ou nível de competência, guardar favoritos para contactar mais tarde, e enviar pedidos de parceria diretamente ao autor do perfil.

O público-alvo são jogadores de qualquer nível e género — desde casuais a competitivos — que querem expandir o seu círculo de jogo de forma organizada e segura.

---

## 🗂️ Modelo de Dados — As Três Entidades

### Entidade 1: Utilizador

Representa qualquer pessoa registada na plataforma. Pode publicar perfis de jogo, interagir com perfis de outros jogadores e gerir os seus favoritos.

| Campo | Tipo | Notas |
|---|---|---|
| Email | String | Identificador único — formato válido obrigatório |
| Palavra-passe | String | Mín. 6 car., letras + números + carácter especial |
| Primeiro Nome | String | Mínimo 2 caracteres |
| Apelido | String | Mínimo 2 caracteres |
| Data de Nascimento | Data | Derivada de idade entre 18 e 120 anos |
| Username / Gamertag | String | Identificador público único na plataforma |
| Plataforma Principal | String | PC, PS5, Xbox, Nintendo Switch, Mobile |

### Entidade 2: Perfil de Jogo (Recurso Principal)

É o objeto central da aplicação. Cada utilizador pode publicar um ou mais perfis de jogo, correspondendo cada um a um título diferente ou a uma forma distinta de jogar. Cada perfil pertence a um único utilizador (o seu autor).

| Campo | Tipo | Notas |
|---|---|---|
| Nome do Jogo | String (texto) | Ex: Valorant, FIFA 25, Minecraft |
| Descrição / Estilo de Jogo | String (texto) | Como joga, o que procura, tipo de equipa |
| Nível de Skill | Numérico (1–10) | Auto-avaliação do jogador |
| Nº Máximo de Parceiros | Numérico | Quantos jogadores procura (1 a 10) |
| Disponível para Parceiros | Booleano | Se está a aceitar pedidos de parceria |
| Data de Publicação | Data | Gerada automaticamente no momento de criação |
| Plataforma | String | PC, PS5, Xbox, Nintendo Switch, Mobile |
| Região / Fuso Horário | String | Ex: Europa Ocidental, GMT+1, Lisboa |

> **Nota:** Este recurso cumpre todos os requisitos obrigatórios com 2 campos de texto, 2 campos numéricos, 1 booleano e 1 data — totalizando 8 campos, acima do mínimo de 6.

### Entidade 3: Pedido de Parceria (Interação)

Representa a ação de um utilizador não-autor que envia uma mensagem ao dono de um perfil de jogo, apresentando-se e propondo jogar juntos. Cada pedido está associado a um utilizador e a um perfil de jogo.

| Campo | Tipo | Notas |
|---|---|---|
| Data/Hora de Criação | Data | Gerada automaticamente pelo sistema |
| Mensagem de Apresentação | String | Texto livre; não pode estar vazio |

---

## ✅ Justificação de Cumprimento dos Requisitos

### As Três Entidades Obrigatórias

- **Utilizador** ✔️ — contém todos os 5 campos obrigatórios + 2 adicionais (Gamertag e Plataforma Principal).
- **Recurso Principal** ✔️ — Perfil de Jogo com 8 campos, cobrindo todos os tipos obrigatórios.
- **Interação** ✔️ — Pedido de Parceria com data/hora automática e conteúdo textual não vazio.

### Páginas Obrigatórias — Mapeamento para o Tema

| Página Obrigatória | Equivalente no GG Mates |
|---|---|
| Iniciar Sessão | Página de Login — email + palavra-passe |
| Registar | Criar conta de jogador com todos os campos do Utilizador |
| Página Inicial / Pesquisa | Explorar Jogadores — tabela com todos os posts de jogo publicados |
| Nova Thread | Publicar post de jogo — formulário com campos do Perfil |
| Ver Thread | Ver Post de Jogo / Perfil de Jogador — detalhes do perfil + envio de Pedido de Parceria |
| Editar Thread | Editar Post de jogo — apenas pelo autor do perfil |
| As minhas Threads | Os Meus Posts — gestão dos perfis publicados pelo utilizador |
| Favoritos | Favoritos — posts de jogo guardados para contactar depois |
| Perfil | O Meu Perfil — dados do utilizador autenticado |
| Atualizar Perfil | Editar Perfil de Utilizador |
| Todos os Utilizadores | Gestão de Utilizadores — apenas para administrador |

---

## 🔍 Filtragem e Ordenação na Página Inicial

**Filtros (mínimo 3 exigidos):**

1. Campo de texto → **Plataforma** (ex: filtrar apenas perfis de PC ou PS5)
2. Intervalo numérico 1 → **Categoria de jogos** (TripleA, indie, estratégia, etc.)
3. Intervalo numérico 2 → **Ano de lançamento**

**Ordenação (mínimo 3 categorias exigidas):**

1. Por **Nível de dificuldade** (1 a 5)
2. Por **Data de Publicação** do Post
3. Por **Nome do Jogo** (ordem alfabética)

---

## ⭐ Conceito de Favorito

O conceito de favorito é completamente natural neste contexto: um jogador pode guardar perfis de outros jogadores que acha interessantes para os contactar mais tarde através de um Pedido de Parceria. Este comportamento replica o que acontece em plataformas reais como o Discord ou o Reddit (r/LFG).

---

## 💬 Lógica das Interações

O fluxo de interação respeita todas as regras do enunciado:

- O utilizador não-autor vê apenas os seus próprios Pedidos de Parceria na página de detalhe do perfil.
- O autor do perfil vê todos os Pedidos de Parceria que recebeu, com o nome completo, email e mensagem de cada candidato.
- Cada interação inclui data/hora de criação (automática) e conteúdo textual não vazio.

---

## 🛡️ Regras de Validação Adicionais do Recurso Principal

As seguintes validações específicas ao tema serão implementadas para o Post de Jogo:

- **Nome do Jogo:** mínimo 2 caracteres, máximo 50 caracteres.
- **Descrição:** mínimo 10 caracteres, máximo 500 caracteres.
- **Nível de Dificuldade:** valor inteiro entre 1 e 5.
- **Nº Máximo de Jogadores:** valor inteiro entre 1 e 10.
- **Plataforma:** seleção a partir de lista pré-definida (PC, PS5, Xbox, Nintendo Switch, Mobile).
- **Região:** select box com NA, SA, Europe, Asia, Australia.

---

## 💡 Complexidade e Originalidade

O GG Mates não foi mencionado nem sugerido como exemplo nas aulas. O tema é suficientemente complexo para suportar todos os requisitos obrigatórios:

- O Post de Jogo tem 8 campos com todos os tipos de dados obrigatórios.
- A plataforma tem um fluxo de utilização realista e reconhecível (semelhante ao r/LFG do Reddit ou ao recurso "Looking For Group" do Discord).
- O conceito de favorito, interação e administração encaixam naturalmente, sem forçar nada.

---

## 👥 Estrutura de Páginas e Divisão de Tarefas

### Programador A — 5 dias

| Página | Nome no GG Mates | Dias |
|---|---|---|
| Novo Recurso | Publicar Perfil de Jogo | 1 |
| Ver Thread + Editar Thread | Ver Perfil + Editar Post de Jogo | 1 |
| As minhas Threads | As minhas Threads | 1 |
| Favoritos | Favoritos | 1 |
| Pesquisa (Página Inicial) | Explorar Jogadores | 1 |

### Programador B — 5 dias

| Página | Nome no GG Mates | Dias |
|---|---|---|
| Iniciar Sessão | Login | 0,5 |
| Registar | Criar Conta | 1 |
| Perfil + Atualizar Perfil | Perfil + Editar Perfil de Utilizador | 1 |
| Todos os Utilizadores | Gestão de Utilizadores (admin) | 1 |
| Interações (Ver Recurso) | Pedidos de Parceria (Ver Perfil) | 1,5 |

---

## 🔄 Fluxo Principal da Aplicação

1. O utilizador acede à aplicação e inicia sessão (ou regista uma nova conta).
2. É redirecionado para a página **"Explorar Jogadores"**, onde vê todos os perfis publicados.
3. Pode filtrar por plataforma, categoria e ano de lançamento do jogo.
4. Abre o detalhe de um perfil e envia um **Pedido de Parceria** com uma mensagem de apresentação.
5. Pode guardar posts como **favoritos** para revisitar mais tarde.
6. O autor do post recebe pedidos, vê quem os enviou e a mensagem de cada um, para moderação.
7. O utilizador gere os seus próprios posts em **"Os Meus Posts"** (criar, editar, eliminar).

---

## 🧰 Stack Tecnológico

| Camada | Tecnologia | Utilização |
|---|---|---|
| Interface | React + JavaScript | Componentes, routing, estado global |
| Estilo | CSS / CSS Modules | Design responsivo (Desktop, Tablet, Mobile) |
| Base de Dados | Firebase Firestore | Armazenamento das 3 entidades |
| Autenticação | Firebase Authentication | Login, registo, sessão (60 min) |

---

## 🚀 Como Executar

```bash
# Clonar o repositório
git clone https://github.com/<utilizador>/ggmates.git
cd ggmates

# Instalar as dependências
npm install

# Iniciar o servidor de desenvolvimento
npm run dev
```

A aplicação fica disponível em `http://localhost:5173`.
