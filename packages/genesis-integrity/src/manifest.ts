import { hashObject } from './hash.js';
import { signPayload, KeyPair } from './sign.js';
import {
  ROYALTY_FORMULA_ID,
  ROYALTY_FORMULA_VERSION,
  ROYALTY_RATE_BASIS_POINTS,
  CONSTITUTION_ID,
} from './royaltyConstants.js';

export interface ManifestContent {
  constitutionId: string;
  version: string;
  documentHashes: Record<string, string>;
  royaltyFormulaId: string;
  royaltyFormulaVersion: string;
  royaltyRateBasisPoints: number;
  licenseVersionIds: string[];
  approvalPolicy: string;
  createdAtIso: string;
}

export interface ManifestSignature {
  signerId: string;
  publicKeyPem: string;
  signature: string;
  signedAtIso: string;
}

export interface ManifestChangeRecord {
  seq: number;
  atIso: string;
  reason: string;
  contentHashBefore: string;
  contentHashAfter: string;
  approverIds: string[];
}

export interface GenesisManifest {
  manifestId: string;
  content: ManifestContent;
  signatures: ManifestSignature[];
  changeHistory: ManifestChangeRecord[];
}

export function contentHash(content: ManifestContent): string {
  return hashObject(content);
}

export function buildInitialManifest(params: {
  manifestId: string;
  version: string;
  documentHashes: Record<string, string>;
  licenseVersionIds?: string[];
  approvalPolicy?: string;
  createdAtIso?: string;
}): GenesisManifest {
  const content: ManifestContent = {
    constitutionId: CONSTITUTION_ID,
    version: params.version,
    documentHashes: params.documentHashes,
    royaltyFormulaId: ROYALTY_FORMULA_ID,
    royaltyFormulaVersion: ROYALTY_FORMULA_VERSION,
    royaltyRateBasisPoints: ROYALTY_RATE_BASIS_POINTS,
    licenseVersionIds: params.licenseVersionIds ?? [],
    approvalPolicy: params.approvalPolicy ?? 'any-change-requires-independent-approvals',
    createdAtIso: params.createdAtIso ?? new Date().toISOString(),
  };
  return {
    manifestId: params.manifestId,
    content,
    signatures: [],
    changeHistory: [],
  };
}

export function signManifest(
  manifest: GenesisManifest,
  signerId: string,
  keyPair: KeyPair,
  signedAtIso?: string,
): GenesisManifest {
  const signature = signPayload(keyPair.privateKeyPem, contentHash(manifest.content));
  return {
    ...manifest,
    signatures: [
      ...manifest.signatures,
      {
        signerId,
        publicKeyPem: keyPair.publicKeyPem,
        signature,
        signedAtIso: signedAtIso ?? new Date().toISOString(),
      },
    ],
  };
}

export function appendManifestChange(
  manifest: GenesisManifest,
  nextContent: ManifestContent,
  approverIds: string[],
  reason: string,
  atIso?: string,
): GenesisManifest {
  const prev = contentHash(manifest.content);
  const nextHash = contentHash(nextContent);
  return {
    ...manifest,
    content: nextContent,
    signatures: [],
    changeHistory: [
      ...manifest.changeHistory,
      {
        seq: manifest.changeHistory.length + 1,
        atIso: atIso ?? new Date().toISOString(),
        reason,
        contentHashBefore: prev,
        contentHashAfter: nextHash,
        approverIds,
      },
    ],
  };
}
