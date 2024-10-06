export interface DbRecord {
	[key: string]: string | number | boolean | null;
}

export type StrictDbRecord = Omit<DbRecord, keyof any>;

export type DbRecordSet = DbRecord[];

export type MultiRecordSet = Record<string, DbRecordSet>;
