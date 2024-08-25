export interface DbRecord {
	// [key: string]: string | number | boolean | null | DbRecord | DbRecord[];
	[key: string]: string | number | boolean | null;
}

export type DbRecordSet = DbRecord[];

export type MultiRecordSet = Record<string, DbRecordSet>;
