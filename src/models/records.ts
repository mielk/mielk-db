import { ResultSetHeader } from 'mysql2';

export interface DbRecord {
	[key: string]: string | number | boolean | null;
}

export type DbRecordSet = DbRecord[];

export type MultiRecordSet = Record<string, DbRecordSet>;

export type ProcCallPacket = {
	items: DbRecordSet[];
	header: ResultSetHeader;
};
