import { Pool, PoolClient } from "pg";
import { getPool } from "./pool.js";
import { Msg } from "../../internal/messaging/messageTags.js";

let client: PoolClient | null = null;

export async function withTransaction<T>(
    fn: () => Promise<T>
): Promise<T> {
    try {
		await beginTransaction();
        const result = await fn();
		await commitTransaction();
        return result;
    } catch (err) {
		await rollbackTransaction();
        throw err;
    } finally {
		if (client) {
            client.release();
            client = null;
        }
    }
}

export const getClient = (): PoolClient | null => client;

export async function beginTransaction(): Promise<void> {
	if (client) throw new Error(Msg.pg.transactions.alreadyActive);

	const pool: Pool = await getPool();
	client = await pool.connect();
	await client.query('BEGIN');

}

export async function commitTransaction(): Promise<void> {
	if (!client) throw new Error(Msg.pg.transactions.noActiveTransactionToCommit);
	await client.query('COMMIT');
}

export async function rollbackTransaction(): Promise<void> {
	if (!client) throw new Error(Msg.pg.transactions.noActiveTransactionToRollback);
	await client.query('ROLLBACK');
}
