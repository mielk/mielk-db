import { FieldPacket, QueryResult, ResultSetHeader, createConnection } from 'mysql2/promise';
import { ConnectionData } from './models/sql';
import { DbField } from './models/fields';
import { QueryResponse } from './models/responses';
import { ObjectOfPrimitives } from './models/common';
import { Connection } from 'mysql2/typings/mysql/lib/Connection';

const query = async (config: ConnectionData, sql: string): Promise<QueryResponse> => {
	const connection = await createConnection(config);
	const [data, fields] = await connection.execute(sql);
	const result: QueryResponse = createQueryResponse(data, fields);
	return result;
};

const createQueryResponse = (data: QueryResult, fieldPackets: FieldPacket[]): QueryResponse => {
	const fields: DbField[] = createFieldsArray(fieldPackets);
	if (Array.isArray(data)) {
		if (data.length === 0) {
			return { items: [], rows: 0, insertId: 0, fields };
		} else {
			return { items: data as ObjectOfPrimitives[], rows: data.length, insertId: 0, fields };
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
