import { Pool, PoolClient } from 'pg';
import { PostgreDbConfig } from '../types/DbConfig.js';
import { QueryExecutor } from '../types/Executor.js';
import { getClient } from './transaction.js';
import { Msg } from '../../msg/messageTags.js';

let config: PostgreDbConfig | null = null;
let pool: Pool | null = null;

export const initDb = (dbConfig: PostgreDbConfig): void => {
	config = {
		max: 10,
		min: 0,
		idleTimeoutMillis: 30_000,
		connectionTimeoutMillis: 10_000,
		...dbConfig
	};
}

export async function getPool(): Promise<Pool> {
	if (pool) return pool;
	if (config === null) throw new Error(Msg.pg.connection.notInitialized);

	pool = new Pool(config);

	pool.on('error', (err) => {
		console.error(Msg.pg.connection.postgreConnectionError, err);
	});

	return pool;
}

export async function getQueryExecutor(): Promise<QueryExecutor>{
	const client: PoolClient | null = getClient();
	if (client) {
		return client;
	} else {
		return await getPool();
	}
}
