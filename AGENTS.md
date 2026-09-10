# AGENTS.md — Regras deste Projeto (KIVORA SOFT)
> Coloque este arquivo na raiz de cada projeto (ou em `.agents/rules/project.md`).
> Ele complementa o GEMINI.md global — não o substitui.

## Stack e convenções
- Linguagem/Framework: React 18 + Vite + TypeScript + Tailwind CSS + Tauri v2 (Desktop Offline-First) / Supabase (Cloud Sync)
- Estilo: Componentes funcionais, named exports, tipagem rigorosa, sem `any`
- Banco de dados: SQLite local via Tauri IPC + Supabase PostgreSQL
- Testes: Vitest — testes unitários e de integração contínua

## Regras de qualidade obrigatórias
1. Nenhum commit pode conter:
   - segredos/chaves de API hardcoded
   - `console.log`/`print` de debug esquecido
   - código comentado sem explicação do porquê está comentado
2. Toda função pública/exportada precisa de um comentário curto explicando o "porquê", não o "o quê".
3. Antes de marcar uma tarefa como concluída, o agente deve:
   - Rodar o build e os testes (ver GEMINI.md seção 1)
   - Listar explicitamente quais arquivos foram alterados e por quê
4. Ao integrar com uma API externa ou biblioteca nova, o agente deve primeiro citar a documentação/assinatura real, nunca assumir de memória.

## Modo de execução recomendado
- Para tarefas novas/complexas: use **Plan Mode** primeiro, revise o plano, só depois execute.
- Para bugs pontuais: use modo rápido seguindo o Protocolo de Auto-Correção do GEMINI.md.
- Nunca use modo "Autopilot" total em mudanças que tocam autenticação, pagamentos, ou billing/faturação (relevante para KIVORA SOFT e VukaPay) — sempre revisão humana nesses módulos.

## Contexto de negócio (KIVORA SOFT)
- Regras fiscais/legais aplicáveis: DP 71/25, CIVA, PGC-AO, Decreto Presidencial 292/18 (Regime das Facturas) — sempre confirmar antes de gerar cálculo fiscal, nunca assumir alíquota de cabeça.
- Marca Oficial: **KIVORA SOFT**
- Convenções de nomenclatura de domínio: Nomes de módulos em português de Angola, código em inglês/TypeScript.

## Disciplina de Âmbito e Controlo de Versões (OBRIGATÓRIO)

### 1. Âmbito estrito
- Só modifica os ficheiros, funções ou componentes directamente necessários para cumprir a tarefa pedida.
- Nunca "aproveites" para corrigir, refatorizar, renomear ou reorganizar código fora do âmbito pedido.
- Se, para completar a tarefa, fores obrigado a alterar código partilhado/central (ex.: Fiscal Engine, autenticação, modelos de dados usados por vários módulos), **pára e pergunta antes de avançar**, explicando o motivo e o impacto esperado.
- No final de cada tarefa, lista explicitamente todos os ficheiros alterados.

### 2. Nunca partas o que já funciona
- Antes de alterar uma função ou componente já existente e funcional, confirma que a alteração é aditiva (acrescenta) e não substitutiva (reescreve), a menos que a tarefa peça explicitamente uma reescrita.
- Não elimines, comentes ou "simplifiques" código funcional que não está relacionado com a tarefa pedida.

### 3. Controlo de versões (git)
- Assume que o estado do repositório antes de começares a tarefa é o "último estado bom conhecido".
- No final da tarefa, resume claramente o que foi alterado para facilitar um commit granular.

### 4. Checklist de fumo (smoke test) antes de dar a tarefa como concluída
Confirma mentalmente que os seguintes fluxos críticos do KIVORA SOFT continuam intactos:
- Login e autenticação
- Criação e emissão de Factura / Factura-Recibo
- Entrada de Stock Multi-Artigo (A Prazo / Pronto Pagamento)
- Cálculo de IRT e INSS no payroll
- Geração de Recibo de Vencimento
- Gravação e leitura de dados do Fiscal Engine

### 5. Quando em dúvida, pergunta — não improvises
É preferível parar e perguntar do que assumir e quebrar algo que já funcionava.

## 6. Governança e Blindagem Permanente do Firebase (Kivora Ecosystem)
> O Cloud Firestore (`faturasimples`) é o backend unificado compartilhado pelo **Kivora Soft Desktop** e pelo **Site / Portais Web**.

### Invariantes de Segurança Intocáveis (Proibido Regredir)
1. **Emissão de Licenças (`/licenses`):** Apenas administradores autenticados podem criar ou apagar licenças (`isAdmin()`). Proibida criação anónima por padrão regex.
2. **Ativação Segura do Desktop (`/licenses/{id}` update):** A atualização de hardware pelo executável Tauri deve permitir estritamente `['hardware_id', 'hostname', 'activated_at', 'status', 'updated_at', 'nif', 'company_name']` sem permitir alteração de plano ou expiração.
3. **Auditoria Fiscal AGT (`/audit_logs`):** Append-Only contínuo e estritamente imutável (`allow update: if false`).
4. **Anti-Fraude de Trial (`/trials`):** Imutável após o primeiro registo (`allow update: if false`), vinculado unicamente ao `hardware_id`.
5. **Isolamento de Backups (`/cloud_backups`):** Proteção anti cross-tenant. Escrita exige correspondência obrigatória de `tenant_id`.
6. **Compatibilidade dos Portais:** Manter compatibilidade com o login sem token do `authService.ts` para parceiros e clientes em `/users` e `/partners`.
7. **Fecho Zero-Trust:** Bloqueio global padrão obrigatório (`match /{document=**} { allow read, write: if false; }`).
8. **Paridade Absoluta:** O ficheiro `firestore.rules` deve manter-se 100% idêntico entre o projeto do ERP e o projeto do site.

