import { DbRecordSet, MultiRecordSet } from './records.js';
import { OperationType } from './sql.js';

/* Response returned by mielk-db.mysql */

export type MySqlSelectResponse = {
	operationType: OperationType.Select;
	items: DbRecordSet;
};

export type MySqlInsertResponse = {
	operationType: OperationType.Insert;
	insertId: number;
	affectedRows: number;
};

export type MySqlUpdateResponse = {
	operationType: OperationType.Update;
	affectedRows: number;
	changedRows: number;
};

export type MySqlDeleteResponse = {
	operationType: OperationType.Delete;
	affectedRows: number;
};

export type MySqlProcResponse = {
	operationType: OperationType.Proc;
	affectedRows: number;
	changedRows: number;
	items: MultiRecordSet;
};

export type MySqlResponse = {
	operationType: OperationType;
	affectedRows: number;
	changedRows: number;
	insertId: number;
	items: MultiRecordSet;
};

export interface IMySqlResponse {
	operationType: OperationType;
	affectedRows?: number;
	changedRows?: number;
	insertId?: number;
	items?: MultiRecordSet | DbRecordSet;
}
