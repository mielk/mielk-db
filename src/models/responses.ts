import { DbField } from './fields';
import { DbRecordSet } from './records';

/* Response received from mysql2/promise */
export interface QueryResponse {
	rows: number;
	fields: DbField[];
	items: DbRecordSet;
	insertId?: number;
}

/* Response returned by mielk-db.db */
export interface MySqlResponse {
	status: boolean;
	rows?: number;
	items?: DbRecordSet;
	message?: string;
}
