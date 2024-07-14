import { DbRecordSet, MultiRecordSet } from './records';

export type DbStructure = Record<string, DbTable>;

export interface DbTable {
	tableName: string;
	key: string;
	fieldsMap: DbFieldsMap;
	foreignKeys?: DbForeignKey[];
}

export type DbFieldsMap = Record<string, string>;

export interface DbForeignKey {
	field: string;
	table: string;
}

export interface DbField {
	name: string;
	type?: number;
}

export interface IFieldsManager {
	getFieldsMap: (name: string) => Record<string, string> | null;
	getFieldName: (name: string, property: string) => string | null;
	convertRecordset: (name: string, recordset: DbRecordSet) => DbRecordSet;
	// convertMultiRecordset: (multiRs: MultiRecordSet) => MultiRecordSet;
}
