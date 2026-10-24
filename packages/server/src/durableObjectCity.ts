import { Authority } from './authority.js';
import { StateDB } from './db.js';
import { DurableObjectSqlStorageAdapter } from './storageAdapter.js';
import { EngineCommand } from '@stupul/engine';

export interface DurableObjectStateLike {
  storage: {
    sql?: any;
    get(key: string): Promise<any>;
    put(key: string, value: any): Promise<void>;
  };
}

/**
 * Server Autoritativ STUPUL rulat ca Cloudflare Durable Object (CityStateDO).
 * Oferă execuție unică și stare sincronă SQLite pe edge (ctx.storage.sql).
 */
export class CityStateDO {
  private authority: Authority;
  private state: DurableObjectStateLike;
  private env: unknown;

  constructor(state: DurableObjectStateLike, env: unknown) {
    this.state = state;
    this.env = env;
    const adapter = new DurableObjectSqlStorageAdapter(state.storage?.sql);
    this.authority = new Authority(new StateDB(adapter));
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Actor-Id, X-Session-Token',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method === 'GET' && url.pathname.endsWith('/api/health')) {
      return Response.json({
        ok: true,
        version: this.authority.getVersion(),
        tick: this.authority.getState().tick,
        writeDisabled: this.authority.isWriteDisabled(),
      }, { headers: corsHeaders });
    }

    if (request.method === 'GET' && url.pathname.endsWith('/api/state')) {
      return Response.json({
        version: this.authority.getVersion(),
        state: this.authority.getState(),
      }, { headers: corsHeaders });
    }

    if (request.method === 'GET' && url.pathname.endsWith('/api/events')) {
      const since = Number(url.searchParams.get('since') ?? '0');
      return Response.json({
        events: this.authority.getEventsSince(since),
      }, { headers: corsHeaders });
    }

    if (request.method === 'POST' && url.pathname.endsWith('/api/command')) {
      const body = (await request.json()) as {
        commandId?: string;
        actorId?: string;
        command?: EngineCommand;
      };

      if (!body?.commandId || !body?.command) {
        return Response.json({ error: 'commandId and command required' }, { status: 400, headers: corsHeaders });
      }

      const actorId = body.actorId || 'anonymous';
      const result = this.authority.applyCommand(body.command, body.commandId, actorId);

      if (result.applied) {
        return Response.json(
          { applied: true, version: result.version, state: result.state, events: result.events },
          { headers: corsHeaders }
        );
      } else if (result.idempotentReplay) {
        return Response.json(
          { applied: false, replayed: true, version: result.version, state: result.state, events: [] },
          { headers: corsHeaders }
        );
      } else {
        return Response.json(
          { applied: false, error: result.error },
          { status: 409, headers: corsHeaders }
        );
      }
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders });
  }
}
