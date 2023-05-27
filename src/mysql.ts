import { FieldPacket, OkPacket, ResultSetHeader, RowDataPacket, createConnection } from 'mysql2/promise';
import { ConnectionData, DbField, QueryResponse, KeyValue } from './models/statement';

const query = async (config: ConnectionData, sql: string): Promise<QueryResponse> => {
	const connection = await createConnection(config);
	const [data, fields] = await connection.execute(sql);
	const result = createQueryResponse(data, fields);
	return result;
};

const createQueryResponse = (
	data: RowDataPacket[][] | RowDataPacket[] | OkPacket | OkPacket[] | ResultSetHeader,
	fieldPackets: FieldPacket[]
): QueryResponse => {
	const fields = createFieldsArray(fieldPackets);
	console.log(data);
	if (Array.isArray(data)) {
		if (data.length === 0) {
			return { items: [], rows: 0, insertId: 0, fields };
		} else {
			return { items: data as KeyValue[], rows: data.length, insertId: 0, fields };
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
