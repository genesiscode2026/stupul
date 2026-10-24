import { createHash } from 'node:crypto';

/** SHA-256 hex digest (algoritm standard, auditabil). */
export function sha256Hex(input: string | Buffer): string {
  return createHash('sha256').update(input).digest('hex');
}

/** Serializare JSON canonică, deterministă (chei sortate recursiv). */
export function canonicalJsonStringify(obj: unknown): string {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return '[' + obj.map(canonicalJsonStringify).join(',') + ']';
  }
  const keys = Object.keys(obj as Record<string, unknown>).sort();
  const entries = keys.map(k => `${JSON.stringify(k)}:${canonicalJsonStringify((obj as Record<string, unknown>)[k])}`);
  return '{' + entries.join(',') + '}';
}

/** Hash determinist al unui obiect (folosit pentru manifest și jurnale). */
export function hashObject(obj: unknown): string {
  return sha256Hex(canonicalJsonStringify(obj));
}
