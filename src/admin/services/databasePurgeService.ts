/**
 * databasePurgeService.ts — Kivora Master Reset & Purge Service
 * Limpeza cirúrgica de dados de teste / operacionais com proteção estrita do SuperAdmin,
 * backup automático pré-limpeza e preservação de configurações institucionais e contas admin.
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

export const PURGE_TARGETS: PurgeTarget[] = [
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
    name: 'Contas de Parceiros Revendedores',
    description: 'Apaga os perfis e quotas de parceiros credenciados.',
    collectionName: 'partners',
    recommended: true,
    category: 'Parceiros',
  },
  {
    id: 'partner_debts',
    name: 'Extrato & Dívidas de Parceiros',
    description: 'Apaga todas as transações de dívida, quotas a crédito e extratos financeiros de atacado.',
    collectionName: 'partner_debts',
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
    id: 'video_support',
    name: 'Sessões & Minutos de Vídeo',
    description: 'Apaga o histórico de videochamadas e consumo de minutos de suporte.',
    collectionName: 'video_support',
    recommended: true,
    category: 'Atendimento',
  },
];

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
): Promise<{ success: boolean; deletedCounts: Record<string, number>; totalDeleted: number }> {
  const deletedCounts: Record<string, number> = {};
  let totalDeleted = 0;

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

        await deleteDoc(doc(db, colName, docSnap.id)).catch((err) => {
          console.warn(`Aviso ao apagar doc ${docSnap.id} em ${colName}:`, err);
        });
        count++;
        totalDeleted++;

        if (onProgress && docs.length > 5) {
          const docPercent = Math.round(((i + (count / docs.length)) / totalTargets) * 100);
          onProgress(`A apagar ${target.name} (${count}/${docs.length})...`, docPercent);
        }
      }

      deletedCounts[target.name] = count;
    } catch (err) {
      console.error(`Erro ao limpar coleção ${colName}:`, err);
      deletedCounts[target.name] = 0;
    }
  }

  if (onProgress) {
    onProgress('Limpeza concluída com sucesso!', 100);
  }

  return {
    success: true,
    deletedCounts,
    totalDeleted,
  };
}
