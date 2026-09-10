/**
 * firestoreUtils.ts — Kivora Ecosystem Data Hardening
 * Higienização defensiva e universal para todas as operações com Google Cloud Firestore.
 * Previne falhas fatais em runtime causadas por campos com valor `undefined`.
 */

/**
 * Remove de forma recursiva todas as chaves com valor `undefined` de um objeto ou array,
 * preservando tipos nativos do Firestore (como Timestamp) e nulos intencionais.
 */
export function cleanFirestoreData<T extends Record<string, any>>(obj: T): Record<string, any> {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj
      .filter((item) => item !== undefined)
      .map((item) => (typeof item === 'object' && item !== null ? cleanFirestoreData(item) : item));
  }

  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) {
      continue;
    }
    // Preserva Timestamps do Firebase e instâncias de Date
    if (
      value !== null &&
      typeof value === 'object' &&
      !(value instanceof Date) &&
      typeof (value as any).toMillis !== 'function'
    ) {
      clean[key] = cleanFirestoreData(value);
    } else {
      clean[key] = value;
    }
  }
  return clean;
}
