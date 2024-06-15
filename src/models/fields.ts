import { DbRecordSet, MultiRecordSet } from './records';

export interface IFieldsManager {
	getPropertyToDbFieldMap: (tableName: string) => Record<string, string>;
	convertMultiRecordset: (multiRs: MultiRecordSet) => MultiRecordSet;
	convertRecordset: (tableName: string, recordset: DbRecordSet) => DbRecordSet;
}

export interface FieldsSet {
	key: string;
	propertyToField: Record<string, string>;
	dependencies: Record<string, string>;
}

export interface DbTableDependency {
	field: string;
	relatedTable: string;
	relatedField: string;
}

export type FieldsMap = Record<string, string>;

export interface DbField {
	name: string;
	type?: number;
}
