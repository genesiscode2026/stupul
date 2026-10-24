import { EngineCommand, GameState, reduce } from '@stupul/engine';

export interface MultiplayerStatus {
  connected: boolean;
  serverVersion: number;
  actorId: string;
  isGuest: boolean;
}

export type StateListener = (state: GameState, version: number) => void;
export type EventListener = (eventMessage: string) => void;

class MultiplayerClient {
  private actorId: string;
  private eventSource: EventSource | null = null;
  private stateListeners: Set<StateListener> = new Set();
  private eventListeners: Set<EventListener> = new Set();
  private isServerAvailable = false;
  private serverVersion = 0;
  private sessionToken: string | null = null;

  constructor() {
    // Generăm un actorId per sesiune de browser (distinct între ferestre/profiluri diferite)
    let id: string | null = null;
    try {
      id = sessionStorage.getItem('stupul_browser_actor_id');
      if (!id) {
        id = 'cetatean_local';
      }
      this.sessionToken = sessionStorage.getItem('stupul_session_token');
    } catch {
      id = 'cetatean_local';
    }
    this.actorId = id;
  }


  public getActorId(): string {
    return this.actorId;
  }

  public setActorId(id: string): void {
    this.actorId = id;
    try {
      sessionStorage.setItem('stupul_browser_actor_id', id);
    } catch {
      // Ignoră erorile storage
    }
  }

  public setSessionToken(token: string | null): void {
    this.sessionToken = token;
    try {
      if (token) {
        sessionStorage.setItem('stupul_session_token', token);
      } else {
        sessionStorage.removeItem('stupul_session_token');
      }
    } catch {
      // Ignoră erorile storage
    }
  }

  public isConnected(): boolean {
    return this.isServerAvailable;
  }

  public getVersion(): number {
    return this.serverVersion;
  }

  /**
   * Inițializează conexiunea SSE la serverul autoritativ.
   * Dacă serverul nu este disponibil, clientul funcționează transparent în mod local (offline fallback).
   */
  public connect(onState: StateListener, onEvent?: EventListener): () => void {
    this.stateListeners.add(onState);
    if (onEvent) this.eventListeners.add(onEvent);

    if (typeof window === 'undefined' || typeof EventSource === 'undefined') {
      return () => {
        this.stateListeners.delete(onState);
        if (onEvent) this.eventListeners.delete(onEvent);
      };
    }

    if (!this.eventSource) {
      this.initEventSource();
    }

    return () => {
      this.stateListeners.delete(onState);
      if (onEvent) this.eventListeners.delete(onEvent);
    };
  }

  private initEventSource(): void {
    try {
      const es = new EventSource('/api/stream');
      this.eventSource = es;

      es.addEventListener('open', () => {
        this.isServerAvailable = true;
      });

      es.addEventListener('init', (e: MessageEvent) => {
        try {
          const payload = JSON.parse(e.data);
          this.isServerAvailable = true;
          this.serverVersion = payload.version || this.serverVersion;
          const st = payload.state || payload;
          if (st && st.gridHeight) {
            for (const listener of this.stateListeners) {
              listener(st, this.serverVersion);
            }
          }
        } catch (err) {
          console.warn('[Multiplayer] Failed parsing init event:', err);
        }
      });

      es.addEventListener('update', (e: MessageEvent) => {
        try {
          const payload = JSON.parse(e.data);
          this.serverVersion = payload.version || this.serverVersion;
          const st = payload.state || payload;
          if (st && st.gridHeight) {
            for (const listener of this.stateListeners) {
              listener(st, this.serverVersion);
            }
          }
          const events = payload.events || (Array.isArray(payload) ? payload : null);
          if (events && Array.isArray(events)) {
            for (const ev of events) {
              for (const el of this.eventListeners) {
                el(ev);
              }
            }
          }
        } catch (err) {
          console.warn('[Multiplayer] Failed parsing update event:', err);
        }
      });

      es.onerror = () => {
        this.isServerAvailable = false;
        // EventSource va reîncerca automat reconectarea
      };
    } catch {
      this.isServerAvailable = false;
    }
  }

  /**
   * Trimite o comandă către serverul autoritativ.
   * Dacă serverul e activ: POST /api/command.
   * Dacă serverul returnează 409 (Conflict de concurență): raportează eroarea fără modificare locală.
   * Dacă serverul e indisponibil (offline demo): execută direct prin reducer local.
   */
  public async dispatchCommand(
    cmd: EngineCommand,
    currentState: GameState
  ): Promise<{ success: boolean; nextState: GameState; error?: string; events: string[] }> {
    // Îmbogățim comanda cu actorId-ul curent dacă nu este specificat
    const enrichedCmd = { ...cmd } as Record<string, unknown>;
    if (!enrichedCmd.actorId) {
      enrichedCmd.actorId = this.actorId;
    }

    const commandId = `cmd_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Actor-Id': this.actorId,
      };
      if (this.sessionToken) {
        headers['Authorization'] = `Bearer ${this.sessionToken}`;
      }

      const res = await fetch('/api/command', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          commandId,
          actorId: this.actorId,
          command: enrichedCmd,
        }),
      });

      if (res.status === 200) {
        const body = await res.json();
        this.isServerAvailable = true;
        this.serverVersion = body.version;
        return {
          success: true,
          nextState: body.state,
          events: body.events ?? [],
        };
      }

      if (res.status === 409) {
        const body = await res.json().catch(() => ({ error: 'Conflict de concurență (parcelă ocupată sau resursă indisponibilă)' }));
        return {
          success: false,
          nextState: currentState,
          error: body.error || 'Conflict de concurență 409',
          events: [],
        };
      }

      if (res.status === 429) {
        return {
          success: false,
          nextState: currentState,
          error: 'Rată de comenzi depășită (rate limit). Te rugăm să aștepți o clipă.',
          events: [],
        };
      }
    } catch {
      // Conexiunea la server a eșuat -> fallback local offline
    }

    // Fallback Offline: execuție directă în reducerul local
    const localResult = reduce(currentState, enrichedCmd as unknown as EngineCommand);
    if (localResult.success) {
      return {
        success: true,
        nextState: localResult.nextState,
        events: localResult.eventsEmitted,
      };
    }
    return {
      success: false,
      nextState: currentState,
      error: localResult.error,
      events: [],
    };
  }

  public disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.stateListeners.clear();
    this.eventListeners.clear();
    this.isServerAvailable = false;
  }
}

export const multiplayerClient = new MultiplayerClient();
