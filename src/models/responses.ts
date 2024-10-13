import { ResultSetHeader } from 'mysql2';
import { DbRecord, MultiRecordSet } from './records.js';
import { DbField } from './fields.js';

/* Response returned by mielk-db.mysql */

// export type ResultSetInfo = {
// 	affectedRows: number;
// 	insertId?: number;
// };

// export type QueryDataSet = {
// 	items: DbRecord[];
// 	fields: DbField[];
// };

// export type QueryResponse = {
// 	info: ResultSetInfo;
// 	records: QueryDataSet[];
// };

// /* Response returned by mielk-db.db */
// export interface MySqlResponse {
// 	status: boolean;
// 	state: MySqlResponseState;
// 	records: MultiRecordSet;
// }

// export interface MySqlResponseState {
// 	affectedRows?: number;
// 	insertId?: number;
// }

export type MySqlSelectResponse = {
	items: DbRecord[];
};

export type MySqlInsertResponse = {
	insertId: number;
	affectedRows: number;
};

export type MySqlUpdateResponse = {
	affectedRows: number;
	changedRows: number;
};

export type MySqlDeleteResponse = {
	affectedRows: number;
};

export type MySqlProcResponse = {
	affectedRows: number;
	changedRows: number;
	items: MultiRecordSet;
};
