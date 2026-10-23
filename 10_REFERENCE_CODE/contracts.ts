/** Referință de contracte de domeniu, NU aplicație de producție. */
export type ActorId = string;
export type ContributionKind = 'code'|'visual'|'systems'|'qa'|'security'|'documentation'|'civic'|'growth';
export interface Contribution { id:string; actorId:ActorId; kind:ContributionKind;
 evidenceHash:string; acceptedAtMs:number; rubricScore:number; impactWeight:1|2|3;
 reviewerIds:ActorId[]; reviewerIndependent:boolean; testsPassed:boolean;
 revoked:boolean; licenseAcceptanceRef:string; }
export interface LegalGate { operatorVerified:boolean; ipInventoryReviewed:boolean; licenseExecuted:boolean; counselApproved:boolean; taxPaymentReviewed:boolean; }
export function mayMonetize(g:LegalGate):boolean { return Object.values(g).every(Boolean); }
export function contributionAward(c:Contribution):number {
 if(c.revoked || !c.testsPassed || !c.reviewerIndependent ||
  c.reviewerIds.includes(c.actorId) || c.reviewerIds.length===0 ||
  c.licenseAcceptanceRef.length===0 || c.evidenceHash.length===0) return 0;
 return Math.min(100,Math.max(0,c.rubricScore))*c.impactWeight;
}
export function activeMerit(all:Contribution[], actorId:ActorId, atMs:number):number {
 return all.filter(c=>c.actorId===actorId).reduce((sum,c)=>{
  const age=(atMs-c.acceptedAtMs)/86400000;
  if(age<0 || age>90) return sum;
  return sum + contributionAward(c)*Math.pow(2,-age/45);
 },0);
}
export interface EligibleReceipts {gross:number; collectedTax:number; refunds:number; refundedChargebacks:number; directProcessorFees:number;}
export function calculateRoyalties(x:EligibleReceipts) {
 const positive=(n:number)=>{if(!Number.isFinite(n)||n<0) throw new Error('invalid financial input');return n;};
 const gross=positive(x.gross), tx=positive(x.collectedTax), rf=positive(x.refunds), cb=positive(x.refundedChargebacks),fee=positive(x.directProcessorFees);
 const eligible=Math.max(0,gross-tx-rf-cb-fee);
 // Model aritmetic, pentru bani reali folosește decimal fixed precision, reguli fiscale și validare operator.
 return {eligible,founderRoyaltyGross:eligible*0.05};
}
export function citizenVoteWeight(eligible:boolean, virtualCoins:number, parcels:number, operatorSharePercent:number):0|1 {
 void virtualCoins;void parcels;void operatorSharePercent; return eligible?1:0;
}
