import { CityStateDO } from './durableObjectCity.js';

export { CityStateDO };

export interface Env {
  CITY_STATE_DO: {
    idFromName(name: string): any;
    get(id: any): { fetch(request: Request): Promise<Response> };
  };
  ASSETS?: {
    fetch(request: Request): Promise<Response>;
  };
}

/**
 * Cloudflare Worker Principal pentru STUPUL.
 * Rutează cererile API către instanța unică autoritativă Durable Object (CityStateDO)
 * și servește frontend-ul static din Workers Static Assets (gratuit, Cloudflare free tier).
 */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Rutare /api/* către instanța unică Durable Object
    if (url.pathname.startsWith('/api/')) {
      const id = env.CITY_STATE_DO.idFromName('main-city');
      const stub = env.CITY_STATE_DO.get(id);
      return stub.fetch(request);
    }

    // Servire asset-uri statice Vite (HTML/CSS/JS) dacă sunt legate prin binding-ul ASSETS
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response(
      'STUPUL Edge Worker Activ. Pentru API folosiți rutele /api/health, /api/state, /api/command.',
      {
        status: 200,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      }
    );
  },
};
