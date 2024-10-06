import { ObjectOfPrimitives } from 'mielk-fn/lib/models/common.js';
import { Connection, FieldPacket, Query, QueryResult, ResultSetHeader, createConnection } from 'mysql2/promise';
import { ConnectionData } from './models/sql.js';
import { DbField } from './models/fields.js';
import { QueryResponse } from './models/responses.js';
import { SqlProcessingError } from './errors/SqlProcessingError.js';
import { DbConnectionError } from './errors/DbConnectionError.js';

const query = async (config: ConnectionData, sql: string): Promise<QueryResponse> => {
	const ERR_CONNECTION: string = 'Error while trying to establish connection';
	const ERR_PROCESSING: string = 'Error while processing given SQL';
	try {
		return createConnection(config).then(async (connection: Connection) => {
			try {
				return connection.execute(sql).then((response) => {
					const [data, fields] = response;
					const result: QueryResponse = createQueryResponse(data, fields);
					return result;
				});
			} catch (err: unknown) {
				throw new SqlProcessingError(`${ERR_PROCESSING} | ${(err as Error).message}`);
			}
		});
	} catch (err: unknown) {
		if (err instanceof SqlProcessingError) {
			throw err;
		} else {
			throw new DbConnectionError(`${ERR_CONNECTION} | ${(err as Error).message}`);
		}
	}
};

const createQueryResponse = (data: QueryResult, fieldPackets: FieldPacket[]): QueryResponse => {
	const fields: DbField[] = createFieldsArray(fieldPackets);
	if (Array.isArray(data)) {
		if (data.length === 0) {
			return { items: [], rows: 0, fields };
		} else {
			return { items: data as ObjectOfPrimitives[], rows: data.length, fields };
		}
	} else if (isResultSetHeader(data)) {
		return { items: [], rows: data.affectedRows, insertId: data.insertId, fields };
	} else {
		throw new Error('Unknown result from MySql');
	}
};

const isResultSetHeader = (value: any): value is ResultSetHeader =>
	value && typeof value === 'object' && 'affectedRows' in value;

const createFieldsArray = (fields: FieldPacket[]): DbField[] => (fields || []).map((field) => toDbFieldObject(field));

const toDbFieldObject = (field: FieldPacket): DbField => ({
	name: field.name,
	type: field.type,
});

export { query };
export default { query };
