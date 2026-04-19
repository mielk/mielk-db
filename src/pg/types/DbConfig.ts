import { SshOptions } from "tunnel-ssh";

export interface PostgreDbConfig {
    provider: 'postgre',
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
    ssh?: SshOptions;
    max?: number;
    min?: number;
    idleTimeoutMillis?: number;
    connectionTimeoutMillis?: number;
}