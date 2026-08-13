import {
  Empresa, Licenca, Instalacao, Parceiro,
  Pagamento, Ticket, AtividadeItem
} from './types';

// ============================================================
// MOCK DATA — KIVORA ADMIN
// ============================================================

export const MOCK_EMPRESAS: Empresa[] = [
  { id: 'e1', nome: 'ABC Comércio, Lda.', nif: '5000123456', email: 'abc@email.ao', telefone: '+244 923 111 222', provincia: 'Luanda', plano: 'Professional', status: 'ativa', licencaId: 'l1', parceiro: 'João Manuel', ultimoAcesso: 'Hoje 18:43', dataRegisto: '2024-03-15', computadores: { atual: 2, maximo: 3 } },
  { id: 'e2', nome: 'XYZ Supermercados, S.A.', nif: '5000234567', email: 'xyz@email.ao', telefone: '+244 923 222 333', provincia: 'Benguela', plano: 'Business', status: 'ativa', licencaId: 'l2', ultimoAcesso: 'Ontem 14:20', dataRegisto: '2024-01-08', computadores: { atual: 5, maximo: 5 } },
  { id: 'e3', nome: 'Farmácia Saúde Plus', nif: '5000345678', email: 'saude@email.ao', telefone: '+244 923 333 444', provincia: 'Huambo', plano: 'Standard', status: 'a_expirar' as any, licencaId: 'l3', parceiro: 'Maria Costa', ultimoAcesso: 'Há 3 dias', dataRegisto: '2023-11-20', computadores: { atual: 1, maximo: 2 } },
  { id: 'e4', nome: 'Restaurante Sabores, Lda.', nif: '5000456789', email: 'sabores@email.ao', telefone: '+244 923 444 555', provincia: 'Lubango', plano: 'Standard', status: 'expirada', licencaId: 'l4', ultimoAcesso: 'Há 15 dias', dataRegisto: '2023-06-01', computadores: { atual: 0, maximo: 1 } },
  { id: 'e5', nome: 'Construtora Ngola', nif: '5000567890', email: 'ngola@email.ao', telefone: '+244 923 555 666', provincia: 'Luanda', plano: 'Professional', status: 'pendente', licencaId: 'l5', parceiro: 'Pedro Lopes', ultimoAcesso: 'Nunca', dataRegisto: '2026-08-12', computadores: { atual: 0, maximo: 3 } },
  { id: 'e6', nome: 'Mercearia Central', nif: '5000678901', email: 'central@email.ao', telefone: '+244 923 666 777', provincia: 'Luanda', plano: 'Standard', status: 'suspensa', licencaId: 'l6', ultimoAcesso: 'Há 30 dias', dataRegisto: '2023-09-14', computadores: { atual: 1, maximo: 2 } },
  { id: 'e7', nome: 'Tech Angola, Lda.', nif: '5000789012', email: 'tech@email.ao', telefone: '+244 923 777 888', provincia: 'Luanda', plano: 'Business', status: 'ativa', licencaId: 'l7', parceiro: 'João Manuel', ultimoAcesso: 'Hoje 09:12', dataRegisto: '2024-05-22', computadores: { atual: 4, maximo: 5 } },
  { id: 'e8', nome: 'Clínica BelaVida', nif: '5000890123', email: 'bela@email.ao', telefone: '+244 923 888 999', provincia: 'Cabinda', plano: 'Standard', status: 'ativa', licencaId: 'l8', ultimoAcesso: 'Hoje 11:30', dataRegisto: '2024-07-01', computadores: { atual: 1, maximo: 2 } },
];

export const MOCK_LICENCAS: Licenca[] = [
  { id: 'l1', codigo: 'KVR-PRO-8F4X-29KD-71LM', empresaId: 'e1', empresaNome: 'ABC Comércio, Lda.', plano: 'Professional', periodicidade: 'anual', status: 'ativa', dataInicio: '2026-01-15', dataExpiracao: '2027-01-15', instalacoes: { atual: 2, maximo: 3 }, modulos: ['Faturação', 'Stock', 'Financeiro', 'Clientes', 'Relatórios'], parceiroId: 'p1', parceiroNome: 'João Manuel' },
  { id: 'l2', codigo: 'KVR-BUS-7G3Y-18JC-60KN', empresaId: 'e2', empresaNome: 'XYZ Supermercados, S.A.', plano: 'Business', periodicidade: 'anual', status: 'ativa', dataInicio: '2026-02-01', dataExpiracao: '2027-02-01', instalacoes: { atual: 5, maximo: 5 }, modulos: ['Faturação', 'Stock', 'Financeiro', 'Clientes', 'Relatórios', 'RH'] },
  { id: 'l3', codigo: 'KVR-STD-6H2W-07IB-59JM', empresaId: 'e3', empresaNome: 'Farmácia Saúde Plus', plano: 'Standard', periodicidade: 'anual', status: 'a_expirar', dataInicio: '2025-08-20', dataExpiracao: '2026-09-10', instalacoes: { atual: 1, maximo: 2 }, modulos: ['Faturação', 'Stock', 'Clientes'], parceiroId: 'p2', parceiroNome: 'Maria Costa' },
  { id: 'l4', codigo: 'KVR-STD-5I1V-96HA-48IL', empresaId: 'e4', empresaNome: 'Restaurante Sabores', plano: 'Standard', periodicidade: 'mensal', status: 'expirada', dataInicio: '2025-07-01', dataExpiracao: '2026-07-01', instalacoes: { atual: 0, maximo: 1 }, modulos: ['Faturação', 'Clientes'] },
  { id: 'l5', codigo: 'KVR-PRO-4J0U-85GB-37HK', empresaId: 'e5', empresaNome: 'Construtora Ngola', plano: 'Professional', periodicidade: 'anual', status: 'ativa', dataInicio: '2026-08-13', dataExpiracao: '2027-08-13', instalacoes: { atual: 0, maximo: 3 }, modulos: ['Faturação', 'Stock', 'Financeiro', 'Clientes', 'Relatórios'], parceiroId: 'p3', parceiroNome: 'Pedro Lopes' },
];

export const MOCK_INSTALACOES: Instalacao[] = [
  { id: 'i1', licencaId: 'l1', empresaNome: 'ABC Comércio, Lda.', nomePC: 'PC-ADMIN', so: 'Windows 11 Pro', versao: 'v2026.08.13', ultimaAtividade: 'Hoje 18:43', dataAtivacao: '2026-01-16', status: 'ativo', ip: '192.168.1.10' },
  { id: 'i2', licencaId: 'l1', empresaNome: 'ABC Comércio, Lda.', nomePC: 'PC-CAIXA', so: 'Windows 10 Pro', versao: 'v2026.08.13', ultimaAtividade: 'Hoje 17:21', dataAtivacao: '2026-01-17', status: 'ativo', ip: '192.168.1.11' },
  { id: 'i3', licencaId: 'l2', empresaNome: 'XYZ Supermercados', nomePC: 'CAIXA-01', so: 'Windows 11 Home', versao: 'v2026.08.13', ultimaAtividade: 'Ontem 22:15', dataAtivacao: '2026-02-02', status: 'ativo', ip: '192.168.2.10' },
  { id: 'i4', licencaId: 'l2', empresaNome: 'XYZ Supermercados', nomePC: 'CAIXA-02', so: 'Windows 10 Pro', versao: 'v2026.07.01', ultimaAtividade: 'Há 2 dias', dataAtivacao: '2026-02-02', status: 'ativo', ip: '192.168.2.11' },
  { id: 'i5', licencaId: 'l3', empresaNome: 'Farmácia Saúde Plus', nomePC: 'FARMA-PC', so: 'Windows 11 Home', versao: 'v2026.06.15', ultimaAtividade: 'Há 3 dias', dataAtivacao: '2025-08-21', status: 'ativo', ip: '192.168.3.5' },
];

export const MOCK_PARCEIROS: Parceiro[] = [
  { id: 'p1', nome: 'João Manuel', empresa: 'JM Tech Solutions', email: 'joao@jmtech.ao', telefone: '+244 923 100 200', tipo: 'revendedor', status: 'ativo', provincia: 'Luanda', clientes: 18, vendasMes: 126000, comissaoPendente: 65000, comissaoPaga: 120000, dataEntrada: '2023-05-10', taxaComissao: 10 },
  { id: 'p2', nome: 'Maria Costa', empresa: undefined, email: 'maria.costa@email.ao', telefone: '+244 924 200 300', tipo: 'consultor', status: 'ativo', provincia: 'Benguela', clientes: 9, vendasMes: 54000, comissaoPendente: 18000, comissaoPaga: 72000, dataEntrada: '2023-08-15', taxaComissao: 10 },
  { id: 'p3', nome: 'Pedro Lopes', empresa: 'PLopes Informática', email: 'pedro@plopes.ao', telefone: '+244 925 300 400', tipo: 'integrador', status: 'ativo', provincia: 'Luanda', clientes: 12, vendasMes: 84000, comissaoPendente: 28000, comissaoPaga: 56000, dataEntrada: '2024-01-20', taxaComissao: 10 },
  { id: 'p4', nome: 'Ana Rodrigues', empresa: 'AR Digital', email: 'ana@ardigital.ao', telefone: '+244 926 400 500', tipo: 'revendedor', status: 'pendente', provincia: 'Huambo', clientes: 0, vendasMes: 0, comissaoPendente: 0, comissaoPaga: 0, dataEntrada: '2026-08-10', taxaComissao: 10 },
  { id: 'p5', nome: 'Carlos Ferreira', empresa: undefined, email: 'carlos@email.ao', telefone: '+244 927 500 600', tipo: 'revendedor', status: 'suspenso', provincia: 'Luanda', clientes: 5, vendasMes: 0, comissaoPendente: 12000, comissaoPaga: 48000, dataEntrada: '2022-11-03', taxaComissao: 10 },
];

export const MOCK_PAGAMENTOS: Pagamento[] = [
  { id: 'pg1', empresaNome: 'ABC Comércio, Lda.', tipo: 'licenca', plano: 'Professional Anual', valor: 120000, status: 'confirmado', metodo: 'transferencia', data: '2026-01-15', referencia: 'REF-2026-001', parceiroNome: 'João Manuel' },
  { id: 'pg2', empresaNome: 'XYZ Supermercados', tipo: 'licenca', plano: 'Business Anual', valor: 200000, status: 'confirmado', metodo: 'multicaixa', data: '2026-02-01', referencia: 'REF-2026-002' },
  { id: 'pg3', empresaNome: 'Construtora Ngola', tipo: 'licenca', plano: 'Professional Anual', valor: 120000, status: 'pendente', metodo: 'transferencia', data: '2026-08-12', referencia: 'REF-2026-047', parceiroNome: 'Pedro Lopes' },
  { id: 'pg4', empresaNome: 'Farmácia Saúde Plus', tipo: 'renovacao', plano: 'Standard Anual', valor: 72000, status: 'pendente', metodo: 'dinheiro', data: '2026-08-10', referencia: 'REF-2026-046', parceiroNome: 'Maria Costa' },
  { id: 'pg5', empresaNome: 'Restaurante Sabores', tipo: 'licenca', plano: 'Standard Mensal', valor: 15000, status: 'falhou', metodo: 'multicaixa', data: '2026-07-01', referencia: 'REF-2026-038' },
  { id: 'pg6', empresaNome: 'Tech Angola, Lda.', tipo: 'upgrade', plano: 'Business Anual', valor: 80000, status: 'confirmado', metodo: 'transferencia', data: '2026-05-22', referencia: 'REF-2026-028', parceiroNome: 'João Manuel' },
];

export const MOCK_TICKETS: Ticket[] = [
  { id: 't1', empresaNome: 'ABC Comércio', titulo: 'Erro ao emitir fatura com QR Code', categoria: 'Faturação', status: 'em_atendimento', prioridade: 'alta', dataAbertura: '2026-08-13', ultimaAtualizacao: 'Hoje 16:30', agente: 'Suporte Nível 2' },
  { id: 't2', empresaNome: 'XYZ Supermercados', titulo: 'Impressora térmica não responde', categoria: 'POS', status: 'pendente', prioridade: 'urgente', dataAbertura: '2026-08-13', ultimaAtualizacao: 'Hoje 14:00' },
  { id: 't3', empresaNome: 'Tech Angola', titulo: 'Como exportar SAF-T?', categoria: 'Contabilidade', status: 'resolvido', prioridade: 'baixa', dataAbertura: '2026-08-11', ultimaAtualizacao: 'Ontem 10:15', agente: 'Suporte Nível 1' },
  { id: 't4', empresaNome: 'Farmácia Saúde Plus', titulo: 'Erro de licença no segundo PC', categoria: 'Licenciamento', status: 'pendente', prioridade: 'alta', dataAbertura: '2026-08-12', ultimaAtualizacao: 'Ontem 18:00' },
];

export const MOCK_ATIVIDADE: AtividadeItem[] = [
  { id: 'a1', tipo: 'empresa', descricao: 'Nova empresa registada', detalhe: 'Construtora Ngola', tempo: 'Há 2 horas' },
  { id: 'a2', tipo: 'licenca', descricao: 'Licença criada', detalhe: 'KVR-PRO-4J0U — Professional', tempo: 'Há 2 horas' },
  { id: 'a3', tipo: 'parceiro', descricao: 'Novo parceiro aprovado', detalhe: 'Pedro Lopes — PLopes Informática', tempo: 'Há 3 horas' },
  { id: 'a4', tipo: 'pagamento', descricao: 'Pagamento confirmado', detalhe: 'Tech Angola — 80.000 Kz', tempo: 'Há 5 horas' },
  { id: 'a5', tipo: 'alerta', descricao: 'Licença expira em 28 dias', detalhe: 'Farmácia Saúde Plus — KVR-STD-6H2W', tempo: 'Há 6 horas' },
  { id: 'a6', tipo: 'ticket', descricao: 'Novo ticket urgente', detalhe: 'XYZ Supermercados — Impressora POS', tempo: 'Há 7 horas' },
];

export const CHART_RECEITA = [
  { mes: 'Mar', valor: 14200000 },
  { mes: 'Abr', valor: 16800000 },
  { mes: 'Mai', valor: 18500000 },
  { mes: 'Jun', valor: 19200000 },
  { mes: 'Jul', valor: 21400000 },
  { mes: 'Ago', valor: 24580000 },
];

export const CHART_EMPRESAS = [
  { mes: 'Mar', valor: 42 },
  { mes: 'Abr', valor: 38 },
  { mes: 'Mai', valor: 55 },
  { mes: 'Jun', valor: 47 },
  { mes: 'Jul', valor: 61 },
  { mes: 'Ago', valor: 72 },
];

export const CHART_LICENCAS = [
  { mes: 'Mar', novas: 38, expiradas: 8 },
  { mes: 'Abr', novas: 35, expiradas: 12 },
  { mes: 'Mai', novas: 52, expiradas: 9 },
  { mes: 'Jun', novas: 44, expiradas: 15 },
  { mes: 'Jul', novas: 58, expiradas: 11 },
  { mes: 'Ago', novas: 65, expiradas: 7 },
];

export const CHART_PLANOS = [
  { name: 'Standard', value: 512, color: '#94a3b8' },
  { name: 'Professional', value: 389, color: '#2563eb' },
  { name: 'Business', value: 166, color: '#0ea5e9' },
];

export const MOCK_ADMIN_USERS = [
  { id: 'u1', nome: 'Adelino Costa', email: 'admin@kivora.ao', funcao: 'Director Geral & CTO', nivel: 'super_admin' as const, status: 'ativo' as const, ultimoAcesso: 'Hoje 18:45' },
  { id: 'u2', nome: 'Marcos Cruz', email: 'marcos@kivora.ao', funcao: 'Director Operacional', nivel: 'super_admin' as const, status: 'ativo' as const, ultimoAcesso: 'Hoje 17:30' },
  { id: 'u3', nome: 'Beatriz Santos', email: 'finanças@kivora.ao', funcao: 'Responsável Financeiro', nivel: 'financeiro' as const, status: 'ativo' as const, ultimoAcesso: 'Hoje 14:10' },
  { id: 'u4', nome: 'Edson Silva', email: 'suporte@kivora.ao', funcao: 'Chefe de Suporte Técnico', nivel: 'suporte' as const, status: 'ativo' as const, ultimoAcesso: 'Hoje 16:50' },
  { id: 'u5', nome: 'Helena Matos', email: 'parceiros@kivora.ao', funcao: 'Gestora de Parceiros', nivel: 'gestor_parceiros' as const, status: 'ativo' as const, ultimoAcesso: 'Ontem 11:20' },
];

export const MOCK_AUDIT_LOGS = [
  { id: 'log-101', data: '2026-08-13 18:45:12', utilizador: 'Adelino Costa', acao: 'Emissão de Licença Anual', recurso: 'ABC Comércio, Lda. (KVR-PRO-8F4X)', ip: '197.249.12.44', nivel: 'info' as const },
  { id: 'log-102', data: '2026-08-13 17:30:05', utilizador: 'Marcos Cruz', acao: 'Alteração de Estado de Empresa', recurso: 'Mercearia Central (Suspensa -> Ativa)', ip: '197.249.12.45', nivel: 'aviso' as const },
  { id: 'log-103', data: '2026-08-13 16:20:00', utilizador: 'Beatriz Santos', acao: 'Confirmação de Pagamento', recurso: 'REF-2026-002 (200.000 Kz)', ip: '197.249.10.12', nivel: 'info' as const },
  { id: 'log-104', data: '2026-08-13 15:10:44', utilizador: 'Sistema Kivora', acao: 'Tentativa de Acesso Falhada', recurso: 'Login Admin (IP suspeito)', ip: '41.222.180.5', nivel: 'critico' as const },
  { id: 'log-105', data: '2026-08-13 14:05:19', utilizador: 'Edson Silva', acao: 'Fecho de Ticket de Suporte', recurso: 'Ticket #T3 (Tech Angola)', ip: '197.249.12.50', nivel: 'info' as const },
];

export const MOCK_COMUNICADOS = [
  { id: 'com-01', titulo: 'Atualização Obrigatoria de Versão v2026.08.15', canal: 'sistema' as const, destinatarios: 'Todas as Empresas Clientes', dataEnvio: '2026-08-10', autor: 'Adelino Costa', estado: 'enviado' as const, mensagem: 'Lançamos a nova atualização do Kivora Desktop com compatibilidade total com o modelo de SAF-T da AGT 2026.' },
  { id: 'com-02', titulo: 'Campanha de Comissões de Renovação para Parceiros', canal: 'email' as const, destinatarios: 'Rede de Parceiros Angola', dataEnvio: '2026-08-01', autor: 'Helena Matos', estado: 'enviado' as const, mensagem: 'Parceiros que renovarem mais de 10 licenças este mês recebem +5% de bónus direto.' },
  { id: 'com-03', titulo: 'Aviso de Manutenção Programada dos Servidores de Licenciamento', canal: 'whatsapp' as const, destinatarios: 'Todos os Clientes', dataEnvio: '2026-08-20', autor: 'Marcos Cruz', estado: 'agendado' as const, mensagem: 'Os servidores de validação de licenças passarão por manutenção domingo das 02h às 04h.' },
];

export const MOCK_PLANOS = [
  { id: 'p-std', nome: 'Kivora Standard', codigo: 'STD-ANG', precoMensal: 15000, precoAnual: 150000, maxComputadores: 2, modulos: ['Faturação Certificada AGT', 'Gestão de Clientes', 'POS Básico', 'Controlo de Caixa'], popular: false, ativo: true },
  { id: 'p-pro', nome: 'Kivora Professional', codigo: 'PRO-ANG', precoMensal: 35000, precoAnual: 350000, maxComputadores: 5, modulos: ['Faturação Certificada AGT', 'Gestão de Stock Multi-Armazém', 'Gestão Financeira & Bancos', 'POS Multicaixa', 'Comissões & Vendedores'], popular: true, ativo: true },
  { id: 'p-bus', nome: 'Kivora Business / Enterprise', codigo: 'BUS-ANG', precoMensal: 75000, precoAnual: 750000, maxComputadores: 15, modulos: ['Tudo do Professional', 'Módulo Recursos Humanos & Salários', 'Relatórios Fiscais SAF-T', 'Multi-Moeda', 'Suporte Prioritário 24/7'], popular: false, ativo: true },
];

export const MOCK_REGIONAL_STATS = [
  { provincia: 'Luanda', empresas: 620, receita: 85400000, parceiros: 14 },
  { provincia: 'Benguela', empresas: 180, receita: 24500000, parceiros: 5 },
  { provincia: 'Huíla (Lubango)', empresas: 140, receita: 19800000, parceiros: 4 },
  { provincia: 'Huambo', empresas: 95, receita: 12400000, parceiros: 3 },
  { provincia: 'Cabinda', empresas: 60, receita: 8900000, parceiros: 2 },
  { provincia: 'Outras Províncias', empresas: 82, receita: 11200000, parceiros: 4 },
];
