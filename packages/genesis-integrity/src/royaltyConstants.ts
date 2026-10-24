/**
 * Invariantele contractuale imuabile ale redevenței fondatorului.
 *
 * ATENȚIE: o constantă în cod NU creează un drept opozabil terților;
 * aceasta este o ancora tehnică dublată de licențe/contracte valabile.
 * Scriptul `scripts/royalty_guard.cjs` detectează orice modificare a acestor valori.
 */
export const ROYALTY_RATE = 0.05;
export const ROYALTY_RATE_BASIS_POINTS = 500; // 5% = 500 de puncte de bază
export const ROYALTY_FORMULA_ID = 'stupul-founder-royalty-v1';
export const ROYALTY_FORMULA_VERSION = '1.0.0';
export const CONSTITUTION_ID = 'stupul-genesis-constitution-v1';
