import { DbField } from './fields';

export interface DbRecord {
	[key: string]: string | number | boolean | null | DbRecord | DbRecord[];
}

export type DbRecordSet = DbRecord[];

export type MultiRecordSet = Record<string, DbRecordSet>;
