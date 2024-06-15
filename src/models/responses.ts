import { DbField } from './fields';
import { DbRecord } from './records';

/* Response received from mysql2/promise */
export interface QueryResponse {
	items: DbRecord[];
	rows: number;
	insertId: number;
	fields: DbField[];
}

/* Response returned by mielk-db.db */
export interface MySqlResponse {
	status: boolean;
	rows: number;
	items: DbRecord[];
}
