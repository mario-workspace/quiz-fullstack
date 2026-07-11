declare module 'pg' {
  import type { EventEmitter } from 'events';

  export interface QueryResult<T = unknown> {
    rows: T[];
    rowCount: number | null;
    command?: string;
  }

  export interface PoolClient {
    query<T = unknown>(text: string, params?: readonly unknown[]): Promise<QueryResult<T>>;
    release(): void;
  }

  export class Pool extends EventEmitter {
    constructor(config?: { connectionString?: string });
    connect(): Promise<PoolClient>;
    query<T = unknown>(text: string, params?: unknown[]): Promise<QueryResult<T>>;
    end(): Promise<void>;
  }
}
