/**
 * databasePurgeService.ts — Kivora Master Reset & Purge Service
 * Limpeza cirúrgica de dados de teste / operacionais com proteção estrita do SuperAdmin,
 * backup automático pré-limpeza, contagem de documentos em tempo real e preservação
 * de configurações institucionais, tabela de preços e contas admin.
 */

import {
  collection, getDocs, doc, deleteDoc
} from 'firebase/firestore';
import { db } from '../../lib/firebase';

export interface PurgeTarget {
  id: string;
  name: string;
  description: string;
  collectionName: string;
  subcollections?: string[];
  recommended: boolean;
  category: 'Licenciamento' | 'Parceiros' | 'Operações' | 'Atendimento' | 'Testes';
}

export const MASTER_ADMIN_EMAILS = [
  'admin@kivora.ao',
  'kivora.angola@gmail.com',
  'narcisomarcos826@gmail.com',
  'comercial@kivora.ao',
  'suporte@kivora.ao',
  'investidores@kivora.ao',
  'parceiros@kivora.ao'
];

export const PURGE_TARGETS: PurgeTarget[] = [
  {
    id: 'users',
    name: 'Contas de Acesso de Parceiros & Clientes',
    description: 'Apaga os logins, acessos e credenciais de revendedores e clientes (as contas de SuperAdmin são sempre preservadas).',
    collectionName: 'users',
    recommended: true,
    category: 'Parceiros',
  },
  {
    id: 'license_requests',
    name: 'Pedidos de Licença de Parceiros',
    description: 'Apaga todos os pedidos de emissão, aprovações pendentes e histórico de solicitações de licenças.',
    collectionName: 'license_requests',
    recommended: true,
    category: 'Licenciamento',
  },
  {
    id: 'licenses',
    name: 'Licenças de Software & Chaves',
    description: 'Apaga todas as licenças geradas (ativas, pendentes, expiradas e revogadas).',
    collectionName: 'licenses',
    recommended: true,
    category: 'Licenciamento',
  },
  {
    id: 'partners',
    name: 'Contas & Perfis de Parceiros Revendedores',
    description: 'Apaga os perfis e registos de parceiros credenciados na rede Kivora.',
    collectionName: 'partners',
    recommended: true,
    category: 'Parceiros',
  },
  {
    id: 'partner_debts',
    name: 'Extrato, Saldos & Dívidas de Parceiros',
    description: 'Apaga todas as transações financeiras, débitos de licenças a crédito e extratos de revenda.',
    collectionName: 'partner_debts',
    recommended: true,
    category: 'Parceiros',
  },
  {
    id: 'partner_quotas',
    name: 'Quotas & Limites de Crédito de Parceiros',
    description: 'Apaga as quotas atribuídas e saldos de crédito de atacado.',
    collectionName: 'partner_quotas',
    recommended: true,
    category: 'Parceiros',
  },
  {
    id: 'partner_applications',
    name: 'Candidaturas a Parceiro',
    description: 'Apaga todos os formulários e comprovativos bancários de candidaturas submetidas pelo site.',
    collectionName: 'partner_applications',
    recommended: true,
    category: 'Parceiros',
  },
  {
    id: 'companies',
    name: 'Empresas Clientes & NIFs',
    description: 'Apaga o registo de empresas clientes geradas e cadastradas.',
    collectionName: 'companies',
    recommended: true,
    category: 'Operações',
  },
  {
    id: 'empresas',
    name: 'Empresas (Legado)',
    description: 'Apaga a coleção secundária legada de empresas.',
    collectionName: 'empresas',
    recommended: true,
    category: 'Operações',
  },
  {
    id: 'support_tickets',
    name: 'Chamados de Suporte & Chat',
    description: 'Apaga todos os tickets de atendimento e histórico de mensagens de chat.',
    collectionName: 'support_tickets',
    subcollections: ['messages'],
    recommended: true,
    category: 'Atendimento',
  },
  {
    id: 'leads_demonstracao',
    name: 'Leads & Pedidos de Demonstração',
    description: 'Apaga todos os pedidos de demonstração e contactos comerciais do site.',
    collectionName: 'leads_demonstracao',
    recommended: true,
    category: 'Operações',
  },
  {
    id: 'trials',
    name: 'Histórico de Testes de 14 Dias (ERP)',
    description: 'Apaga a base de hardware_id para permitir que computadores de teste reativem os 14 dias.',
    collectionName: 'trials',
    recommended: true,
    category: 'Testes',
  },
  {
    id: 'subscription_invoices',
    name: 'Faturas & Faturação de Clientes',
    description: 'Apaga o histórico de faturas e subscrições criadas no painel.',
    collectionName: 'subscription_invoices',
    recommended: true,
    category: 'Operações',
  },
  {
    id: 'video_support_sessions',
    name: 'Sessões de Vídeo Suporte',
    description: 'Apaga o histórico de chamadas de vídeo e sessões de suporte.',
    collectionName: 'video_support_sessions',
    recommended: true,
    category: 'Atendimento',
  },
  {
    id: 'video_support_accounts',
    name: 'Saldos de Minutos de Vídeo',
    description: 'Apaga as contas de minutos pré-pagos de videochamadas.',
    collectionName: 'video_support_accounts',
    recommended: true,
    category: 'Atendimento',
  },
  {
    id: 'cloud_backups',
    name: 'Backups Nuvem do Kivora ERP Desktop',
    description: 'Apaga os arquivos de backup enviados para a nuvem pelo software desktop.',
    collectionName: 'cloud_backups',
    recommended: true,
    category: 'Testes',
  },
  {
    id: 'store_orders',
    name: 'Encomendas da Loja de Hardware',
    description: 'Apaga encomendas de TPAs, impressoras térmicas e periféricos da loja.',
    collectionName: 'store_orders',
    recommended: true,
    category: 'Operações',
  },
  {
    id: 'audit_logs',
    name: 'Trilha de Auditoria & Segurança AGT',
    description: 'Limpa o histórico de registos de auditoria e segurança perimetral.',
    collectionName: 'audit_logs',
    recommended: false,
    category: 'Testes',
  },
];

/**
 * Consulta em tempo real o Firebase para saber quantos documentos existem em cada coleção
 */
export async function getLiveCollectionCounts(): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};
  for (const target of PURGE_TARGETS) {
    try {
      const snap = await getDocs(collection(db, target.collectionName));
      if (target.id === 'users') {
        const nonAdmins = snap.docs.filter((d) => {
          const u = d.data();
          const email = (u.email || '').toLowerCase().trim();
          return u.role !== 'admin' && !MASTER_ADMIN_EMAILS.includes(email) && !email.endsWith('@kivora.ao');
        });
        counts[target.id] = nonAdmins.length;
      } else {
        counts[target.id] = snap.docs.length;
      }
    } catch {
      counts[target.id] = 0;
    }
  }
  return counts;
}

/**
 * Faz backup integral de todas as coleções selecionadas antes de apagar qualquer documento
 */
export async function createPrePurgeBackup(targetCollectionNames: string[]): Promise<string> {
  const backupData: Record<string, any[]> = {};

  for (const colName of targetCollectionNames) {
    try {
      const snap = await getDocs(collection(db, colName));
      backupData[colName] = snap.docs.map(d => ({ _docId: d.id, ...d.data() }));
    } catch (err) {
      console.warn(`Erro ao exportar coleção ${colName}:`, err);
      backupData[colName] = [];
    }
  }

  const exportPayload = {
    system: 'KIVORA CLOUD ECOSYSTEM — SEGURANÇA MÁXIMA',
    purpose: 'Backup Automático de Segurança Pré-Limpeza (Master Reset)',
    timestamp: new Date().toISOString(),
    collections: backupData,
  };

  const jsonString = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const now = new Date();
  const dateFormatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}h${String(now.getMinutes()).padStart(2, '0')}`;
  const filename = `backup_seguranca_kivora_pre_purge_${dateFormatted}.json`;

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return filename;
}

/**
 * Executa a limpeza cirúrgica de documentos das coleções selecionadas
 */
export async function executePurge(
  targetCollectionIds: string[],
  onProgress?: (step: string, percent: number) => void
): Promise<{
  success: boolean;
  deletedCounts: Record<string, number>;
  totalDeleted: number;
  failedCount: number;
  errors: string[];
}> {
  const deletedCounts: Record<string, number> = {};
  let totalDeleted = 0;
  let failedCount = 0;
  const errors: string[] = [];

  const targets = PURGE_TARGETS.filter(t => targetCollectionIds.includes(t.id));
  const totalTargets = targets.length;

  for (let i = 0; i < totalTargets; i++) {
    const target = targets[i];
    const colName = target.collectionName;
    const progressPercent = Math.round(((i) / totalTargets) * 100);

    if (onProgress) {
      onProgress(`A carregar documentos de ${target.name}...`, progressPercent);
    }

    try {
      const snap = await getDocs(collection(db, colName));
      let count = 0;

      const docs = snap.docs;
      for (const docSnap of docs) {
        // Se for a coleção `users`, preservar rigorosamente utilizadores administradores
        if (colName === 'users') {
          const u = docSnap.data();
          const email = (u.email || '').toLowerCase().trim();
          if (u.role === 'admin' || MASTER_ADMIN_EMAILS.includes(email) || email.endsWith('@kivora.ao')) {
            continue; // Pula sem apagar a conta admin
          }
        }

        if (target.subcollections && target.subcollections.length > 0) {
          for (const sub of target.subcollections) {
            try {
              const subSnap = await getDocs(collection(db, colName, docSnap.id, sub));
              for (const subDoc of subSnap.docs) {
                await deleteDoc(doc(db, colName, docSnap.id, sub, subDoc.id)).catch(() => {});
              }
            } catch {}
          }
        }

        try {
          await deleteDoc(doc(db, colName, docSnap.id));
          count++;
          totalDeleted++;
        } catch (delErr: any) {
          failedCount++;
          errors.push(`[${colName}/${docSnap.id}] ${delErr.message}`);
          console.warn(`Falha ao apagar doc ${docSnap.id} em ${colName}:`, delErr);
        }

        if (onProgress && docs.length > 5) {
          const docPercent = Math.round(((i + (count / docs.length)) / totalTargets) * 100);
          onProgress(`A apagar ${target.name} (${count}/${docs.length})...`, docPercent);
        }
      }

      deletedCounts[target.name] = count;
    } catch (err: any) {
      console.error(`Erro ao consultar coleção ${colName}:`, err);
      deletedCounts[target.name] = 0;
      errors.push(`[${colName}] ${err.message}`);
    }
  }

  if (onProgress) {
    onProgress('Limpeza concluída com sucesso!', 100);
  }

  return {
    success: failedCount === 0,
    deletedCounts,
    totalDeleted,
    failedCount,
    errors,
  };
}
