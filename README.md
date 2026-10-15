# Portal CEIA — Protótipos

Este repositório contém os **protótipos navegáveis** de algumas funcionalidades do **Portal CEIA** (front-end).

O objetivo é servir como referência visual e de comportamento das telas — por isso **não há back-end**: todos os dados são fictícios (_mock_) e ficam guardados no próprio navegador (`localStorage`).

---

## Algumas funcionalidades implementadas

- **Central de Solicitações** (ajuste de PTR, passagens e diárias, compras e pagamentos, certificados).
- **Controle de Cadastramento**.
- **Notas fiscais**. 
- **fluxo de pagamento**.
- **Projetos de pesquisa**.
- **Painel PMO**.
- **Carta SEBRAE** e **Formulário Complementar**.
- **Equipe Administrativa**.

**Troca de perfil** em tempo real, que muda o menu e o que cada usuário enxerga.

---

## Tecnologias

Construído com **React 19 + TypeScript**, usando **TanStack Start/Router**, **Vite**, **Tailwind CSS** e componentes **shadcn/ui**.

---

## Como rodar

Você precisa ter o **[Node.js](https://nodejs.org/)** (versão 20 ou superior) instalado. O projeto usa **[Bun](https://bun.sh/)**, mas você também pode usar o **npm**.

```bash
# 1. Clone o repositório
git clone <url-do-repositorio>
cd ceia-portal-prototipos

# 2. Instale as dependências
bun install        # ou: npm install

# 3. Rode o projeto
bun run dev        # ou: npm run dev
```

Depois é só abrir **http://localhost:5173** no navegador.

---

## Como usar

- Ao abrir, você já cai direto na área do perfil ativo.
- No topo do menu lateral existe um **seletor de perfil**. Troque de perfil para ver como o portal muda para cada tipo de usuário (coordenação, administração, PMO, pesquisador, etc.).
- Navegue pelo menu lateral para explorar as telas.

> 💡 Como os dados são fictícios, você pode clicar e testar à vontade — nada é salvo em servidor.

---

## Comandos úteis

| Comando          | O que faz                                    |
| ---------------- | -------------------------------------------- |
| `bun run dev`    | Roda o projeto em modo desenvolvimento.      |
| `bun run build`  | Gera a versão de produção.                    |
| `bun run preview`| Pré-visualiza a versão de produção.          |
| `bun run lint`   | Verifica problemas no código.                |
| `bun run format` | Formata o código automaticamente.            |

