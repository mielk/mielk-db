import { Connection, FieldPacket, QueryResult, ResultSetHeader, RowDataPacket, createConnection } from 'mysql2/promise';
import { ConnectionData } from './models/sql.js';
import { DbField, DbFieldsMap, TableFieldsMap } from './models/fields.js';
import { SqlProcessingError } from './errors/SqlProcessingError.js';
import { DbConnectionError } from './errors/DbConnectionError.js';
import { isObject } from 'mielk-fn/lib/methods/variables.js';
import { objects, regex } from 'mielk-fn';
import { DbRecordSet, MultiRecordSet, ProcCallPacket } from './models/records.js';
import globals from './globals.js';
import { IMySqlResponse, MySqlResponse } from './models/responses.js';

const getConnection = async (connectionData: ConnectionData): Promise<Connection> => {
	const ERR_CONNECTION: string = 'Error while trying to establish connection';
	return new Promise((resolve, reject) => {
		createConnection(connectionData)
			.then((connection: Connection) => {
				resolve(connection);
			})
			.catch((err: unknown) => {
				reject(new DbConnectionError(`${ERR_CONNECTION} | ${(err as Error).message}`));
			});
	});
};

const query = async (sql: string, connection: Connection): Promise<QueryResult> => {
	const ERR_EXECUTING: string = 'Error while executing SQL';

	return new Promise((resolve, reject) => {
		connection
			.query({ sql, nestTables: true })
			.then((response) => {
				const [result] = response;
				resolve(result);
			})
			.catch((err: unknown) => {
				reject(new SqlProcessingError(`${ERR_EXECUTING} | ${(err as Error).message}`));
			});
	});
};

const getResultSetHeader = async (sql: string, connectionData: ConnectionData): Promise<ResultSetHeader> => {
	const ERR_INVALID_RESPONSE: string = 'Invalid response from mysql2/promise';
	return new Promise<ResultSetHeader>(async (resolve, reject) => {
		try {
			const connection: Connection = await getConnection(connectionData);
			const response: QueryResult = await query(sql, connection);
			if (isResultSetHeader(response)) {
				resolve(response as ResultSetHeader);
			} else {
				reject(new SqlProcessingError(ERR_INVALID_RESPONSE));
			}
		} catch (err: unknown) {
			reject(err);
		}
	});
};

const getDbRecordset = async (sql: string, connectionData: ConnectionData): Promise<DbRecordSet> => {
	const ERR_INVALID_RESPONSE: string = 'Invalid response from mysql2/promise';
	return new Promise<DbRecordSet>(async (resolve, reject) => {
		try {
			const connection: Connection = await getConnection(connectionData);
			const response: QueryResult = await query(sql, connection);
			if (isRowDataPacket(response)) {
				resolve(response as DbRecordSet);
			} else {
				reject(new SqlProcessingError(ERR_INVALID_RESPONSE));
			}
		} catch (err: unknown) {
			reject(err);
		}
	});
};

const isResultSetHeader = (value: any): value is ResultSetHeader => {
	if (!value) return false;
	if (typeof value !== 'object') return false;
	if (!('affectedRows' in value)) return false;
	if (!('insertId' in value)) return false;
	if (!('info' in value)) return false;
	return true;
};

const isRowDataPacket = (value: any): value is RowDataPacket => {
	if (!value) return false;
	if (!Array.isArray(value)) return false;

	const arr: unknown[] = [...value];
	return arr.every((item) => isObject(item));
};

const getProcCallPacket = (value: any): ProcCallPacket | undefined => {
	if (!value) return undefined;
	if (isResultSetHeader(value)) return { items: [], header: value };
	if (!Array.isArray(value)) return undefined;

	const items = [...value];
	const [header] = items.splice(-1, 1);

	if (items.length === 0 && !header) return undefined;
	if (items.some((item: any) => !isRowDataPacket(item))) return undefined;

	return { items, header };
};

const getChangedRowsFromInfo = (info: string): number => {
	const regexPattern: string = 'Changed: (\\d+)';
	return regex.getCapturedNumber(info, regexPattern) || 0;
};

const createFieldsArray = (fields: FieldPacket[]): DbField[] => (fields || []).map((field) => toDbFieldObject(field));

const toDbFieldObject = (field: FieldPacket): DbField => ({
	name: field.name,
	type: field.type,
});

const toMultiRecordSet = (recordSets: DbRecordSet | DbRecordSet[]): MultiRecordSet => {
	if (Array.isArray(recordSets)) {
		if (recordSets.length === 0) return {};
		if (Array.isArray(recordSets[0])) {
			if (recordSets.length === 1) {
				const items = [...(recordSets[0] as DbRecordSet)];
				return { items };
			} else {
				const items: MultiRecordSet = {};
				let counter: number = 1;
				let nameCache: string = '';
				for (const rs of recordSets as DbRecordSet[]) {
					const name: string = getRsNameFromRecordset(rs) || '';
					if (name) {
						nameCache = name;
					} else if (nameCache) {
						items[nameCache] = rs;
						counter++;
						nameCache = '';
					} else {
						items[globals.getDefaultRsNameForIndex(counter)] = rs;
						counter++;
					}
				}
				return items;
			}
		} else {
			return { [globals.defaultRsName]: recordSets as DbRecordSet };
		}
	} else {
		return {};
	}
};

const getRsNameFromRecordset = (rs: DbRecordSet): string | undefined => {
	if (rs.length !== 1) return undefined;

	const obj = rs[0];
	const keys = Object.keys(obj);
	if (keys.length !== 1) return undefined;
	if (keys[0] !== globals.tableInfoRsColumn) return undefined;

	return obj[globals.tableInfoRsColumn] as string;
};

const toMySqlResponse = (response: IMySqlResponse): MySqlResponse => {
	const ERR_PROCESSING_RESPONSE: string = 'Error while converting response to MySqlResponse type';
	if (!objects.isNonEmptyObject(response)) {
		throw new Error(ERR_PROCESSING_RESPONSE);
	}

	const { items, affectedRows, changedRows, insertId } = response as any;
	if ([items, affectedRows, changedRows, insertId].every((i) => i === undefined)) {
		throw new Error(ERR_PROCESSING_RESPONSE);
	}

	return {
		operationType: response.operationType,
		items: items ? (Array.isArray(items) ? toMultiRecordSet(items) : items) : {},
		affectedRows: affectedRows || 0,
		changedRows: changedRows || 0,
		insertId: insertId || 0,
	};
};

const toDbFieldsMap = (fields: DbFieldsMap | TableFieldsMap | undefined): DbFieldsMap => {
	if (fields === undefined) {
		return {};
	} else if (objects.isNonEmptyObject(fields)) {
		if (Object.values(fields).every((f) => objects.isNonEmptyObject(f))) {
			//already map
			return fields as DbFieldsMap;
		} else {
			//single table fields
			return { items: fields as TableFieldsMap };
		}
	} else {
		return {};
	}
};

export {
	getConnection,
	query,
	getResultSetHeader,
	getDbRecordset,
	isResultSetHeader,
	isRowDataPacket,
	getProcCallPacket,
	createFieldsArray,
	getChangedRowsFromInfo,
	toMultiRecordSet,
	toMySqlResponse,
	toDbFieldsMap,
};
export default {
	getConnection,
	query,
	getResultSetHeader,
	getDbRecordset,
	isResultSetHeader,
	isRowDataPacket,
	getProcCallPacket,
	createFieldsArray,
	getChangedRowsFromInfo,
	toMultiRecordSet,
	toMySqlResponse,
	toDbFieldsMap,
};
