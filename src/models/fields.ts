import { DbRecordSet, MultiRecordSet } from './records.js';

export type DbStructure = Record<string, DbTable>;

export interface DbTable {
	table: string;
	view?: string;
	key: string;
	fieldsMap: TableFieldsMap;
	foreignKeys?: DbForeignKey[];
}

export type TableFieldsMap = Record<string, string>;

export type DbFieldsMap = Record<string, TableFieldsMap>;

export interface DbForeignKey {
	field: string;
	table: string;
}

export interface DbField {
	name: string;
	type?: number;
}

export interface IFieldsMapper {
	convertRecordset: (recordset: DbRecordSet, fieldsMap: TableFieldsMap) => DbRecordSet;
	convertMultiRecordset: (rescordsets: MultiRecordSet, fieldsMaps: DbFieldsMap) => MultiRecordSet;
}

export type JsonPrimitive = string | number | boolean | Date | null;

export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export type JsonRecordSet = { [key: string]: JsonValue };
