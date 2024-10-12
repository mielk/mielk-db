import { Connection, FieldPacket, QueryResult, ResultSetHeader, RowDataPacket, createConnection } from 'mysql2/promise';
import { ConnectionData } from './models/sql.js';
import { DbField } from './models/fields.js';
import { SqlProcessingError } from './errors/SqlProcessingError.js';
import { DbConnectionError } from './errors/DbConnectionError.js';
import { isObject } from 'mielk-fn/lib/methods/variables.js';
import regex from 'mielk-fn/lib/methods/regex.js';
import { DbRecordSet } from './models/records.js';

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

const isRowDataPacket = (value: any): boolean => {
	if (!value) return false;
	if (!Array.isArray(value)) return false;

	const arr: unknown[] = [...value];
	return arr.every((item) => isObject(item));
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

export {
	getConnection,
	query,
	isResultSetHeader,
	isRowDataPacket,
	createFieldsArray,
	getChangedRowsFromInfo,
	getResultSetHeader,
	getDbRecordset,
};
export default {
	getConnection,
	query,
	isResultSetHeader,
	isRowDataPacket,
	createFieldsArray,
	getChangedRowsFromInfo,
	getResultSetHeader,
	getDbRecordset,
};
