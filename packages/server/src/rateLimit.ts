import { IncomingMessage } from 'node:http';

export interface RateLimiter {
  allow(key: string): boolean;
}

/**
 * Token bucket clasic pentru o singură cheie.
 */
export class TokenBucketRateLimiter implements RateLimiter {
  private readonly buckets = new Map<string, { tokens: number; last: number }>();

  constructor(
    public readonly capacity = 60,
    public readonly refillPerSec = 30
  ) {}

  allow(key: string): boolean {
    const now = Date.now();
    let b = this.buckets.get(key);
    if (!b) {
      b = { tokens: this.capacity, last: now };
      this.buckets.set(key, b);
    }
    const refill = ((now - b.last) / 1000) * this.refillPerSec;
    b.tokens = Math.min(this.capacity, b.tokens + refill);
    b.last = now;
    if (b.tokens < 1) return false;
    b.tokens -= 1;
    return true;
  }

  reset(): void {
    this.buckets.clear();
  }
}

export interface MultiDimensionCheckParams {
  ip: string;
  sessionToken?: string;
  actorId?: string;
}

export interface MultiDimensionCheckResult {
  allowed: boolean;
  rejectedDimension?: 'ip' | 'session' | 'identity';
}

/**
 * Rate Limiter Multi-Dimensional (Securitate P0).
 * Previne ocolirea limitării prin schimbarea arbitrară a actorId sau a headerelor neîncredere.
 * Validează simultan:
 * 1. Limită pe adresă IP (cu filtrare strictă a proxy-urilor de încredere)
 * 2. Limită pe sesiune validată (sessionToken)
 * 3. Limită pe identitate de actor (actorId autoritativ)
 */
export class MultiDimensionalRateLimiter {
  public readonly ipLimiter: TokenBucketRateLimiter;
  public readonly sessionLimiter: TokenBucketRateLimiter;
  public readonly identityLimiter: TokenBucketRateLimiter;
  public readonly trustedProxies: Set<string>;

  constructor(opts?: {
    ipCapacity?: number;
    ipRefillPerSec?: number;
    sessionCapacity?: number;
    sessionRefillPerSec?: number;
    identityCapacity?: number;
    identityRefillPerSec?: number;
    trustedProxies?: string[];
  }) {
    this.ipLimiter = new TokenBucketRateLimiter(
      opts?.ipCapacity ?? 60,
      opts?.ipRefillPerSec ?? 30
    );
    this.sessionLimiter = new TokenBucketRateLimiter(
      opts?.sessionCapacity ?? 60,
      opts?.sessionRefillPerSec ?? 30
    );
    this.identityLimiter = new TokenBucketRateLimiter(
      opts?.identityCapacity ?? 60,
      opts?.identityRefillPerSec ?? 30
    );
    this.trustedProxies = new Set(opts?.trustedProxies ?? ['127.0.0.1', '::1', 'localhost']);
  }

  /**
   * Extrage adresa IP reală a clientului.
   * Headerul X-Forwarded-For este luat în considerare EXCLUSIV dacă conexiunea provine
   * de la un proxy de încredere configurat (ex: reverse proxy intern, Cloudflare).
   * Orice X-Forwarded-For trimis de un peer neîncredere este ignorat (anti-spoofing).
   */
  public extractClientIp(req: IncomingMessage): string {
    const remote = req.socket.remoteAddress || '127.0.0.1';
    const cleanRemote = remote.replace(/^::ffff:/, ''); // normalize IPv4-mapped IPv6

    if (this.trustedProxies.has(cleanRemote) || this.trustedProxies.has(remote)) {
      const xForwarded = req.headers['x-forwarded-for'];
      if (typeof xForwarded === 'string' && xForwarded.trim().length > 0) {
        const parts = xForwarded.split(',').map(s => s.trim().replace(/^::ffff:/, ''));
        // Primul IP din lanț este IP-ul original al clientului raportat de proxy-ul de încredere
        if (parts.length > 0 && parts[0]) {
          return parts[0];
        }
      }
    }

    return cleanRemote;
  }

  /**
   * Verifică dacă cererea este permisă pe toate dimensiunile.
   * Dacă oricare dintre dimensiuni este depășită, cererea este respinsă (fail-closed).
   */
  public check(params: MultiDimensionCheckParams): MultiDimensionCheckResult {
    // 1. Verificare IP (dimensiunea obligatorie, independentă de sesiune)
    if (!this.ipLimiter.allow(`ip:${params.ip}`)) {
      return { allowed: false, rejectedDimension: 'ip' };
    }

    // 2. Verificare sesiune (dacă este furnizată)
    if (params.sessionToken) {
      if (!this.sessionLimiter.allow(`sess:${params.sessionToken}`)) {
        return { allowed: false, rejectedDimension: 'session' };
      }
    }

    // 3. Verificare identitate actor (dacă este autentificat)
    if (params.actorId) {
      if (!this.identityLimiter.allow(`actor:${params.actorId}`)) {
        return { allowed: false, rejectedDimension: 'identity' };
      }
    }

    return { allowed: true };
  }

  public resetAll(): void {
    this.ipLimiter.reset();
    this.sessionLimiter.reset();
    this.identityLimiter.reset();
  }
}
