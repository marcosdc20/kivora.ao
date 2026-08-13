import { useState, useEffect } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { Company, KivoraLicense } from '../types';

/**
 * Hook em tempo real para gerir empresas clientes no Firestore
 */
export function useCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'companies'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const data = querySnapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as Company[];
      setCompanies(data);
      setLoading(false);
    }, (error) => {
      console.error("Erro ao carregar empresas do Firebase:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addCompany = async (companyData: Omit<Company, 'id' | 'createdAt'>) => {
    try {
      const docRef = await addDoc(collection(db, 'companies'), {
        ...companyData,
        createdAt: Date.now()
      });
      return docRef.id;
    } catch (error) {
      console.error("Erro ao adicionar empresa no Firebase:", error);
      throw error;
    }
  };

  const updateCompany = async (id: string, data: Partial<Company>) => {
    try {
      await updateDoc(doc(db, 'companies', id), data);
    } catch (error) {
      console.error("Erro ao atualizar empresa no Firebase:", error);
      throw error;
    }
  };

  const deleteCompany = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'companies', id));
    } catch (error) {
      console.error("Erro ao apagar empresa no Firebase:", error);
      throw error;
    }
  };

  return { companies, loading, addCompany, updateCompany, deleteCompany };
}

/**
 * Hook em tempo real para gerir licenças Kivora no Firestore
 */
export function useLicenses() {
  const [licenses, setLicenses] = useState<KivoraLicense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'licenses'), orderBy('created_at', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const data = querySnapshot.docs.map((d) => {
        const docData = d.data();
        return {
          id: d.id,
          client_email: docData.client_email || '',
          company_name: docData.company_name || 'Sem Nome',
          nif: docData.nif || '999999999',
          plan_type: docData.plan_type || 'monthly',
          status: docData.status || 'active',
          hardware_id: docData.hardware_id ?? null,
          created_at: docData.created_at || Date.now(),
          expires_at: docData.expires_at ?? null,
          price_aoa: docData.price_aoa ?? 0,
          notes: docData.notes ?? '',
          activated_at: docData.activated_at ?? null,
          extra_seats: docData.extra_seats ?? 0,
          max_users: docData.max_users ?? 1,
        } as KivoraLicense;
      });
      setLicenses(data);
      setLoading(false);
    }, (error) => {
      console.error("Erro ao subscrever licenças do Firebase:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { licenses, loading };
}
