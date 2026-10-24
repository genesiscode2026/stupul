import { describe, it, expect } from 'vitest';
import {
  FOUNDER_PAYOUT_CONFIG,
  ExactRoyaltySettlementEngine,
  validateNoDivertedExpenses,
  BigIntRoyaltyReceipts,
} from '@stupul/domain';

describe('GENESIS v3.3 — Motor Canonic de Calcul și Decontare Redevență 5% pe BASE USDC', () => {

  // TEST 1: Configurația Imuabilă Canonică
  it('ROYALTY-01: Destinația fondatorului este canonică, imuabilă și pe rețeaua BASE în USDC', () => {
    expect(FOUNDER_PAYOUT_CONFIG.asset).toBe('USDC');
    expect(FOUNDER_PAYOUT_CONFIG.network).toBe('BASE');
    expect(FOUNDER_PAYOUT_CONFIG.chainId).toBe(8453);
    expect(FOUNDER_PAYOUT_CONFIG.usdcContractOnBase).toBe('0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913');
    expect(FOUNDER_PAYOUT_CONFIG.founderWallet).toBe('0xC6F86e170411182114FcCdb28793dC76B5e8D144');
    expect(FOUNDER_PAYOUT_CONFIG.royaltyBasisPoints).toBe(500); // 5.00%
    expect(FOUNDER_PAYOUT_CONFIG.decimals).toBe(6);
  });

  // TEST 2: Calcul BigInt fără pierdere de precizie IEEE 754
  it('ROYALTY-02: Calcul exact BigInt 500 bps (5.00%) din Baza Eligibilă', () => {
    // Încasări brute: 1.000.000,00 USD = 100.000.000 cenți
    // TVA / Impozite indirecte: 190.000,00 USD = 19.000.000 cenți
    // Rambursări: 20.000,00 USD = 2.000.000 cenți
    // Chargebacks: 5.000,00 USD = 500.000 cenți
    // Taxe procesator (Stripe): 29.000,00 USD = 2.900.000 cenți
    // Bază eligibilă = 100.000.000 - 24.400.000 = 75.600.000 cenți ($756.000,00)
    // Redevență 5% (500 bps) = 3.780.000 cenți ($37.800,00 exact)
    const receipts: BigIntRoyaltyReceipts = {
      grossSubunits: 100_000_000n,
      collectedTaxSubunits: 19_000_000n,
      refundsSubunits: 2_000_000n,
      chargebacksSubunits: 500_000n,
      processorFeesSubunits: 2_900_000n,
      currency: 'USD',
    };

    const res = ExactRoyaltySettlementEngine.calculateBigInt(receipts);

    expect(res.eligibleSubunits).toBe(75_600_000n);
    expect(res.royaltyGrossSubunits).toBe(3_780_000n);
    expect(res.withholdingTaxSubunits).toBe(0n);
    expect(res.netPayableSubunits).toBe(3_780_000n);
    expect(res.basisPointsUsed).toBe(500);
  });

  // TEST 3: Interzicerea strictă a deducerii cheltuielilor generale (Anti-Deterring)
  it('ROYALTY-03: Tentativa de a deduce salarii, chirii, marketing sau cloud hosting aruncă excepție', () => {
    expect(() => {
      validateNoDivertedExpenses({
        stripe_fee: 1500,
        marketing_costs: 5000,
      });
    }).toThrow(/cheltuială operațională\/generală interzisă/);

    expect(() => {
      validateNoDivertedExpenses({
        salaries: 20000,
      });
    }).toThrow(/cheltuială operațională\/generală interzisă/);

    expect(() => {
      validateNoDivertedExpenses({
        cloud_hosting: 3400,
      });
    }).toThrow(/cheltuială operațională\/generală interzisă/);
  });

  // TEST 4: Generare Calldata ERC-20 transfer(address,uint256)
  it('ROYALTY-04: Calldata-ul ERC-20 transfer este conform standardului EVM și conține destinația canonică', () => {
    // 37.800,00 USDC = 37.800.000.000 micro-USDC (6 zecimale)
    const microUsdc = 37_800_000_000n;
    const tx = ExactRoyaltySettlementEngine.generateErc20TransferCalldata(
      FOUNDER_PAYOUT_CONFIG.founderWallet,
      microUsdc
    );

    expect(tx.chainId).toBe(8453);
    expect(tx.contractAddress).toBe('0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913');
    expect(tx.recipientAddress).toBe('0xC6F86e170411182114FcCdb28793dC76B5e8D144');
    expect(tx.amountAtomicMicroUsdc).toBe(microUsdc);
    expect(tx.formattedUsdc).toBe('37800.000000 USDC');
    expect(tx.destinationVerified).toBe(true);

    // Verificăm structura calldata-ului:
    // 1. Selector: 0xa9059cbb (4 bytes = 10 caractere cu 0x)
    expect(tx.calldata.startsWith('0xa9059cbb')).toBe(true);
    // 2. Adresă recipient padding la 32 bytes (64 hex caractere)
    const addressChunk = tx.calldata.slice(10, 74);
    expect(addressChunk.length).toBe(64);
    expect(addressChunk.toLowerCase()).toContain('c6f86e170411182114fccdb28793dc76b5e8d144');
    // 3. Valoare amount padding la 32 bytes (64 hex caractere)
    const amountChunk = tx.calldata.slice(74, 138);
    expect(amountChunk.length).toBe(64);
    expect(BigInt('0x' + amountChunk)).toBe(microUsdc);
    // Lungime totală calldata = 10 + 64 + 64 = 138 caractere
    expect(tx.calldata.length).toBe(138);
  });

  // TEST 5: Blocaj Anti-Tamper la destinație (Fail-Closed)
  it('ROYALTY-05: Încercarea de redirecționare a redevenței către alt portofel este blocată fail-closed', () => {
    const hackerWallet = '0x000000000000000000000000000000000000dEaD';
    expect(() => {
      ExactRoyaltySettlementEngine.generateErc20TransferCalldata(
        hackerWallet,
        1_000_000n
      );
    }).toThrow(/SECURITATE P0 VIOLATĂ: Încercare de redirecționare a redevenței/);
  });

  // TEST 6: Reconciliere Completă Fiat -> Crypto BASE USDC
  it('ROYALTY-06: Reconcilierea emite un manifest complet de decontare cu jurnal de audit', () => {
    const manifest = ExactRoyaltySettlementEngine.reconcileAndCreateSettlement({
      settlementId: 'SETTLE-2026-Q4-001',
      periodStartMs: Date.now() - 30 * 86_400_000,
      periodEndMs: Date.now(),
      receipts: {
        grossSubunits: 50_000_000n, // $500,000 USD
        collectedTaxSubunits: 95_000_00n, // $95,000
        refundsSubunits: 10_000_00n, // $10,000
        chargebacksSubunits: 2_000_00n, // $2,000
        processorFeesSubunits: 14_500_00n, // $14,500
        currency: 'USD',
      },
    });

    expect(manifest.settlementId).toBe('SETTLE-2026-Q4-001');
    expect(manifest.calculation.eligibleSubunits).toBe(378_500_00n); // $378,500
    expect(manifest.calculation.royaltyGrossSubunits).toBe(18_925_00n); // $18,925 (5%)
    expect(manifest.payoutTx.amountAtomicMicroUsdc).toBe(18_925_000_000n);
    expect(manifest.payoutTx.formattedUsdc).toBe('18925.000000 USDC');
    expect(manifest.payoutTx.recipientAddress).toBe('0xC6F86e170411182114FcCdb28793dC76B5e8D144');
    expect(manifest.auditTrail.length).toBeGreaterThan(5);
  });

});
