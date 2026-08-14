import { useState, useEffect, useCallback } from 'react';
import {
  collection, addDoc, query, orderBy, onSnapshot,
  doc, updateDoc, deleteDoc, getDocs
} from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { db, auth } from '../../lib/firebase';
import type { Company, KivoraLicense } from '../types';

/**
 * Hook para monitorizar o utilizador autenticado no Firebase Auth
 */
export function useFirebaseAuth() {
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { currentUser, authLoading };
}

/**
 * Converte de forma resiliente qualquer tipo de data do Firestore para timestamp numérico em ms
 */
function parseTimestamp(val: any, fallbackTs?: any): number {
  if (typeof val === 'number') return val;
  if (val && typeof val.toMillis === 'function') return val.toMillis();
  if (val && typeof val.toDate === 'function') return val.toDate().getTime();
  if (fallbackTs && typeof fallbackTs.toMillis === 'function') return fallbackTs.toMillis();
  if (fallbackTs && typeof fallbackTs.toDate === 'function') return fallbackTs.toDate().getTime();
  if (typeof val === 'string') {
    const parsed = Date.parse(val);
    if (!isNaN(parsed)) return parsed;
  }
  return Date.now();
}

/**
 * Hook em tempo real para gerir empresas clientes no Firestore
 */
export function useCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'companies'));
      const data = snap.docs.map((d) => {
        const docData = d.data();
        return {
          id: d.id,
          name: docData.name || 'Sem Denominação',
          nif: docData.nif || '',
          email: docData.email || '',
          phone: docData.phone || '',
          address: docData.address || '',
          status: docData.status || 'active',
          createdAt: parseTimestamp(docData.createdAt, docData._created_at_ts),
        } as Company;
      });
      setCompanies(data);
      setError(null);
    } catch (err: any) {
      console.warn('Erro ao consultar empresas no Firestore:', err);
      if (err.message?.includes('permission') || err.code === 'permission-denied') {
        setError('Permissão insuficiente no Firestore. É necessário autenticar como Administrador no Firebase.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let unsubscribeSnapshot = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'companies'), orderBy('createdAt', 'desc'));
        unsubscribeSnapshot = onSnapshot(
          q,
          (querySnapshot) => {
            const data = querySnapshot.docs.map((d) => {
              const docData = d.data();
              return {
                id: d.id,
                name: docData.name || 'Sem Denominação',
                nif: docData.nif || '',
                email: docData.email || '',
                phone: docData.phone || '',
                address: docData.address || '',
                status: docData.status || 'active',
                createdAt: parseTimestamp(docData.createdAt, docData._created_at_ts),
              } as Company;
            });
            setCompanies(data);
            setLoading(false);
            setError(null);
          },
          (err) => {
            console.warn('onSnapshot companies falhou, tentando fallback getDocs...', err);
            fetchCompanies();
          }
        );
      } catch {
        fetchCompanies();
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeSnapshot();
    };
  }, [fetchCompanies]);

  const addCompany = async (companyData: Omit<Company, 'id' | 'createdAt'>) => {
    try {
      const docRef = await addDoc(collection(db, 'companies'), {
        ...companyData,
        createdAt: Date.now(),
      });
      return docRef.id;
    } catch (err) {
      console.error('Erro ao adicionar empresa no Firebase:', err);
      throw err;
    }
  };

  const updateCompany = async (id: string, data: Partial<Company>) => {
    try {
      await updateDoc(doc(db, 'companies', id), data);
    } catch (err) {
      console.error('Erro ao atualizar empresa no Firebase:', err);
      throw err;
    }
  };

  const deleteCompany = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'companies', id));
    } catch (err) {
      console.error('Erro ao apagar empresa no Firebase:', err);
      throw err;
    }
  };

  return { companies, loading, error, addCompany, updateCompany, deleteCompany, refresh: fetchCompanies };
}

/**
 * Hook em tempo real para gerir licenças Kivora no Firestore (faturasimples)
 */
export function useLicenses() {
  const [licenses, setLicenses] = useState<KivoraLicense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLicenses = useCallback(async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'licenses'));
      const data = snap.docs.map((d) => {
        const docData = d.data();
        const created = parseTimestamp(docData.created_at, docData._created_at_ts);
        const expires = docData.expires_at ? parseTimestamp(docData.expires_at, docData._expires_at_ts) : null;
        const activated = docData.activated_at ? parseTimestamp(docData.activated_at) : null;

        return {
          id: d.id,
          client_email: docData.client_email || '',
          company_name: docData.company_name || 'Visual Software',
          nif: docData.nif || '',
          plan_type: docData.plan_type || 'monthly',
          status: docData.status || 'active',
          hardware_id: docData.hardware_id ?? null,
          created_at: created,
          expires_at: expires,
          price_aoa: docData.price_aoa ?? 2500,
          notes: docData.notes ?? '',
          activated_at: activated,
          extra_seats: docData.extra_seats ?? 0,
          max_users: docData.max_users ?? 1,
        } as KivoraLicense;
      });

      // Ordenar por data de criação desc
      data.sort((a, b) => b.created_at - a.created_at);

      setLicenses(data);
      setError(null);
    } catch (err: any) {
      console.warn('Erro ao consultar licenças no Firestore:', err);
      if (err.message?.includes('permission') || err.code === 'permission-denied') {
        setError('Permissão insuficiente no Firestore. É necessário autenticar como Administrador no Firebase.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let unsubscribeSnapshot = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'licenses'), orderBy('created_at', 'desc'));
        unsubscribeSnapshot = onSnapshot(
          q,
          (querySnapshot) => {
            const data = querySnapshot.docs.map((d) => {
              const docData = d.data();
              const created = parseTimestamp(docData.created_at, docData._created_at_ts);
              const expires = docData.expires_at ? parseTimestamp(docData.expires_at, docData._expires_at_ts) : null;
              const activated = docData.activated_at ? parseTimestamp(docData.activated_at) : null;

              return {
                id: d.id,
                client_email: docData.client_email || '',
                company_name: docData.company_name || 'Visual Software',
                nif: docData.nif || '',
                plan_type: docData.plan_type || 'monthly',
                status: docData.status || 'active',
                hardware_id: docData.hardware_id ?? null,
                created_at: created,
                expires_at: expires,
                price_aoa: docData.price_aoa ?? 2500,
                notes: docData.notes ?? '',
                activated_at: activated,
                extra_seats: docData.extra_seats ?? 0,
                max_users: docData.max_users ?? 1,
              } as KivoraLicense;
            });

            setLicenses(data);
            setLoading(false);
            setError(null);
          },
          (err) => {
            console.warn('onSnapshot licenses ordenado falhou, tentando fallback getDocs...', err);
            fetchLicenses();
          }
        );
      } catch {
        fetchLicenses();
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeSnapshot();
    };
  }, [fetchLicenses]);

  return { licenses, loading, error, refresh: fetchLicenses };
}
