// ============================================================
// KIVORA ADMIN — Types & Interfaces
// ============================================================

export type EmpresaStatus = 'ativa' | 'suspensa' | 'expirada' | 'pendente';
export type LicencaStatus = 'ativa' | 'expirada' | 'suspensa' | 'a_expirar';
export type PagamentoStatus = 'pendente' | 'confirmado' | 'falhou' | 'reembolsado';
export type ParceiroStatus = 'ativo' | 'suspenso' | 'pendente';
export type TicketStatus = 'pendente' | 'em_atendimento' | 'resolvido' | 'fechado';
export type TicketPrioridade = 'baixa' | 'media' | 'alta' | 'urgente';

// ─── Tipos do Firebase Firestore ──────────────────────────────────────────
export type PlanType = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'semiannual' | 'annual' | 'quadrennial' | 'lifetime';
export type LicenseStatus = 'active' | 'expired' | 'revoked';

export interface KivoraLicense {
  id: string;                    // Chave KVRA-XXXX-XXXX-XXXX
  client_email: string;
  company_name: string;
  nif: string;
  plan_type: PlanType;
  status: LicenseStatus;
  hardware_id: string | null;    // Fingerprint gravado no 1º uso online
  created_at: number;
  expires_at: number | null;     // null = vitalício
  price_aoa?: number;
  notes?: string;
  activated_at?: number | null;
  extra_seats?: number;
  max_users?: number;
}

export interface Company {
  id: string;
  name: string;
  nif: string;
  email: string;
  phone: string;
  address?: string;
  status: 'active' | 'suspended' | 'blocked';
  createdAt: number;
}

export interface CreateLicenseParams {
  client_email: string;
  company_name: string;
  nif: string;
  plan_type: PlanType;
  expires_at: number | null;
  price_aoa?: number;
  notes?: string;
  extra_seats?: number;
}

export interface LicenseFilters {
  search?: string;
  status?: LicenseStatus | 'all';
  plan_type?: PlanType | 'all';
}

export interface Empresa {
  id: string;
  nome: string;
  nif: string;
  email: string;
  telefone: string;
  provincia: string;
  plano: string;
  status: EmpresaStatus;
  licencaId: string;
  parceiro?: string;
  ultimoAcesso: string;
  dataRegisto: string;
  computadores: { atual: number; maximo: number };
  noticias?: string;
}

export interface Licenca {
  id: string;
  codigo: string;
  empresaId: string;
  empresaNome: string;
  plano: string;
  periodicidade: 'mensal' | 'anual' | 'ilimitado';
  status: LicencaStatus;
  dataInicio: string;
  dataExpiracao: string;
  instalacoes: { atual: number; maximo: number };
  modulos: string[];
  parceiroId?: string;
  parceiroNome?: string;
  observacao?: string;
}

export interface Instalacao {
  id: string;
  licencaId: string;
  empresaNome: string;
  nomePC: string;
  so: string;
  versao: string;
  ultimaAtividade: string;
  dataAtivacao: string;
  status: 'ativo' | 'inativo' | 'bloqueado';
  ip?: string;
}

export interface Parceiro {
  id: string;
  nome: string;
  empresa?: string;
  email: string;
  telefone: string;
  tipo: 'revendedor' | 'consultor' | 'integrador';
  status: ParceiroStatus;
  provincia: string;
  clientes: number;
  vendasMes: number;
  comissaoPendente: number;
  comissaoPaga: number;
  dataEntrada: string;
  taxaComissao: number;
}

export interface Pagamento {
  id: string;
  empresaNome: string;
  tipo: 'licenca' | 'renovacao' | 'upgrade' | 'reembolso';
  plano: string;
  valor: number;
  status: PagamentoStatus;
  metodo: 'transferencia' | 'multicaixa' | 'dinheiro' | 'outro';
  data: string;
  referencia: string;
  parceiroNome?: string;
}

export interface Ticket {
  id: string;
  empresaNome: string;
  titulo: string;
  categoria: string;
  status: TicketStatus;
  prioridade: TicketPrioridade;
  dataAbertura: string;
  ultimaAtualizacao: string;
  agente?: string;
}

export interface AtividadeItem {
  id: string;
  tipo: 'empresa' | 'licenca' | 'parceiro' | 'pagamento' | 'alerta' | 'ticket';
  descricao: string;
  detalhe: string;
  tempo: string;
}

export interface AdminUser {
  id: string;
  nome: string;
  email: string;
  funcao: string;
  nivel: 'super_admin' | 'financeiro' | 'suporte' | 'gestor_parceiros';
  status: 'ativo' | 'inativo';
  ultimoAcesso: string;
}

export interface AuditLog {
  id: string;
  data: string;
  utilizador: string;
  acao: string;
  recurso: string;
  ip: string;
  nivel: 'info' | 'aviso' | 'critico';
}

export interface ComunicadoAdmin {
  id: string;
  titulo: string;
  canal: 'sistema' | 'whatsapp' | 'email';
  destinatarios: string;
  dataEnvio: string;
  autor: string;
  estado: 'enviado' | 'agendado' | 'rascunho';
  mensagem: string;
}

export interface PlanoProduto {
  id: string;
  nome: string;
  codigo: string;
  precoMensal: number;
  precoAnual: number;
  maxComputadores: number;
  modulos: string[];
  popular?: boolean;
  ativo: boolean;
}

export type AdminSection =
  | 'dashboard'
  | 'empresas'
  | 'empresa-detalhe'
  | 'licencas'
  | 'licenca-criar'
  | 'instalacoes'
  | 'parceiros'
  | 'parceiros-candidaturas'
  | 'pagamentos'
  | 'planos'
  | 'suporte'
  | 'relatorios'
  | 'comunicacao'
  | 'utilizadores'
  | 'auditoria'
  | 'configuracoes';
