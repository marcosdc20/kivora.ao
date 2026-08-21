/**
 * supportService.ts — Kivora Unified Realtime Support Service
 * Sincronização multilateral no Firebase Firestore (/support_tickets)
 * Conecta: Cliente <-> Parceiro/Admin, Parceiro <-> Admin, Admin <-> Todos
 */

import {
  collection, doc, setDoc, updateDoc,
  query, orderBy, onSnapshot, arrayUnion
} from 'firebase/firestore';
import { db } from '../../lib/firebase';

export interface SupportMessage {
  id: string;
  sender_name: string;
  sender_role: 'client' | 'partner' | 'admin';
  sender_email?: string;
  text: string;
  timestamp: number;
}

export interface SupportTicket {
  id: string;
  ticket_number: string;
  company_name: string;
  nif?: string;
  contact_email: string;
  contact_phone?: string;
  subject: string;
  category: 'faturacao' | 'tecnico' | 'licenciamento' | 'multiloja';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: number;
  remote_code?: string;
  messagesCount: number;
  partner_id?: string;       // Código ou ID do parceiro que ativou a licença
  partner_name?: string;     // Nome do parceiro
  target_type: 'partner' | 'admin'; // 'partner' se foi aberto para o parceiro, 'admin' se foi para o admin
  created_by_role: 'client' | 'partner' | 'admin';
  messages: SupportMessage[];
}

export interface CreateTicketDTO {
  company_name: string;
  nif?: string;
  contact_email: string;
  contact_phone?: string;
  subject: string;
  category: 'faturacao' | 'tecnico' | 'licenciamento' | 'multiloja';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  initial_message: string;
  remote_code?: string;
  partner_id?: string;
  partner_name?: string;
  target_type: 'partner' | 'admin';
  created_by_role: 'client' | 'partner' | 'admin';
  sender_name: string;
}

/** Cria um novo ticket com mensagem inicial no Firestore */
export async function createSupportTicket(data: CreateTicketDTO): Promise<SupportTicket> {
  const tkId = `tk_${Date.now()}`;
  const now = Date.now();
  const tkNum = `TK-2026/${String(Math.floor(Math.random() * 9000) + 1000)}`;

  const firstMsg: SupportMessage = {
    id: `msg_${now}`,
    sender_name: data.sender_name || 'Utilizador',
    sender_role: data.created_by_role || 'partner',
    sender_email: data.contact_email || '',
    text: data.initial_message || 'Chamado aberto.',
    timestamp: now
  };

  const newTicket: SupportTicket = {
    id: tkId,
    ticket_number: tkNum,
    company_name: data.company_name || 'Parceiro Kivora',
    nif: data.nif || '',
    contact_email: data.contact_email || '',
    contact_phone: data.contact_phone || '',
    subject: data.subject || 'Chamado de Suporte',
    category: data.category || 'tecnico',
    priority: data.priority || 'medium',
    status: 'open',
    createdAt: now,
    remote_code: data.remote_code || '',
    messagesCount: 1,
    partner_id: data.partner_id || '',
    partner_name: data.partner_name || '',
    target_type: data.target_type || 'admin',
    created_by_role: data.created_by_role || 'partner',
    messages: [firstMsg]
  };

  await setDoc(doc(db, 'support_tickets', tkId), newTicket, { merge: true });
  return newTicket;
}

/** Envia uma mensagem para o ticket no Firestore */
export async function sendTicketMessage(
  ticketId: string,
  message: { sender_name: string; sender_role: 'client' | 'partner' | 'admin'; sender_email?: string; text: string }
): Promise<void> {
  const newMsg: SupportMessage = {
    id: `msg_${Date.now()}`,
    sender_name: message.sender_name || 'Utilizador',
    sender_role: message.sender_role || 'partner',
    sender_email: message.sender_email || '',
    text: message.text || '',
    timestamp: Date.now()
  };

  await updateDoc(doc(db, 'support_tickets', ticketId), {
    messages: arrayUnion(newMsg),
    status: message.sender_role === 'admin' || message.sender_role === 'partner' ? 'in_progress' : 'open',
    updatedAt: Date.now()
  });
}

/** Altera o estado do ticket (ex: 'resolved', 'closed', 'in_progress') */
export async function updateTicketStatus(
  ticketId: string,
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
): Promise<void> {
  await updateDoc(doc(db, 'support_tickets', ticketId), {
    status,
    updatedAt: Date.now()
  });
}

/** Subscrição em Tempo Real para Tickets do Cliente (filtrado por email ou NIF) */
export function subscribeClientTickets(
  emailOrNif: string,
  onUpdate: (tickets: SupportTicket[]) => void
) {
  const q = query(collection(db, 'support_tickets'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    const list: SupportTicket[] = [];
    const term = emailOrNif.toLowerCase().trim();
    snap.forEach((d) => {
      const data = d.data() as any;
      const matchEmail = (data.contact_email || '').toLowerCase().includes(term);
      const matchNif = (data.nif || '').includes(term);
      if (!term || matchEmail || matchNif) {
        list.push({
          id: d.id,
          ticket_number: data.ticket_number || `TK-${d.id.slice(-4)}`,
          company_name: data.company_name || 'Empresa Cliente',
          nif: data.nif || '',
          contact_email: data.contact_email || '',
          contact_phone: data.contact_phone || '',
          subject: data.subject || 'Chamado de Apoio',
          category: data.category || 'tecnico',
          priority: data.priority || 'medium',
          status: data.status || 'open',
          createdAt: Number(data.createdAt) || Date.now(),
          remote_code: data.remote_code || '',
          messagesCount: Array.isArray(data.messages) ? data.messages.length : (data.messagesCount || 1),
          partner_id: data.partner_id || '',
          partner_name: data.partner_name || '',
          target_type: data.target_type || 'admin',
          created_by_role: data.created_by_role || 'client',
          messages: Array.isArray(data.messages) ? data.messages : [
            { id: '1', sender_name: 'Suporte', sender_role: 'admin', text: data.subject || 'Ticket aberto', timestamp: data.createdAt || Date.now() }
          ]
        });
      }
    });
    onUpdate(list);
  }, (err) => console.warn('Erro ao escutar tickets do cliente:', err));
}

/** Subscrição em Tempo Real para Tickets do Parceiro (clientes do parceiro e chamados abertos pelo parceiro) */
export function subscribePartnerTickets(
  partnerCode: string,
  onUpdateOrEmail: ((tickets: { clientTickets: SupportTicket[]; adminTickets: SupportTicket[] }) => void) | string,
  maybeOnUpdate?: (tickets: { clientTickets: SupportTicket[]; adminTickets: SupportTicket[] }) => void
) {
  const onUpdate = typeof onUpdateOrEmail === 'function' ? onUpdateOrEmail : maybeOnUpdate;
  const partnerEmail = typeof onUpdateOrEmail === 'string' ? onUpdateOrEmail : '';
  if (!onUpdate) return () => {};

  const q = query(collection(db, 'support_tickets'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    const clientTickets: SupportTicket[] = [];
    const adminTickets: SupportTicket[] = [];
    const pCode = (partnerCode || '').toLowerCase().trim();
    const pEmail = (partnerEmail || '').toLowerCase().trim();

    snap.forEach((d) => {
      const data = d.data() as any;
      const tk: SupportTicket = {
        id: d.id,
        ticket_number: data.ticket_number || `TK-${d.id.slice(-4)}`,
        company_name: data.company_name || 'Empresa Cliente',
        nif: data.nif || '',
        contact_email: data.contact_email || '',
        contact_phone: data.contact_phone || '',
        subject: data.subject || 'Chamado',
        category: data.category || 'tecnico',
        priority: data.priority || 'medium',
        status: data.status || 'open',
        createdAt: Number(data.createdAt) || Date.now(),
        remote_code: data.remote_code || '',
        messagesCount: Array.isArray(data.messages) ? data.messages.length : (data.messagesCount || 1),
        partner_id: data.partner_id || '',
        partner_name: data.partner_name || '',
        target_type: data.target_type || 'admin',
        created_by_role: data.created_by_role || 'client',
        messages: Array.isArray(data.messages) ? data.messages : []
      };

      const matchPartner = 
        (pCode && tk.partner_id?.toLowerCase().includes(pCode)) ||
        (pCode && tk.contact_email?.toLowerCase().includes(pCode)) ||
        (pEmail && tk.contact_email?.toLowerCase().includes(pEmail)) ||
        (pEmail && tk.partner_id?.toLowerCase().includes(pEmail)) ||
        (pCode && pCode.includes(tk.partner_id?.toLowerCase() || '')) ||
        (pCode && pCode.includes(tk.contact_email?.toLowerCase() || ''));

      // Se foi o parceiro que abriu para o Admin
      if (tk.created_by_role === 'partner' && (matchPartner || !pCode)) {
        adminTickets.push(tk);
      }
      // Se é um ticket aberto pelo cliente direcionado para este parceiro
      else if (tk.target_type === 'partner' && matchPartner) {
        clientTickets.push(tk);
      }
      // Fallback: se tiver o ID do parceiro associado
      else if (matchPartner) {
        clientTickets.push(tk);
      }
    });

    onUpdate({ clientTickets, adminTickets });
  }, (err) => console.warn('Erro ao escutar tickets do parceiro:', err));
}
