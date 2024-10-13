import { Connection, createConnection, FieldPacket, QueryResult, ResultSetHeader } from 'mysql2/promise';
import mysql from '../src/mysql';
import { ConnectionData } from '../src/models/sql';
import { DbField } from '../src/models/fields';
import { DbRecord, DbRecordSet, ProcCallPacket } from '../src/models/records';
import globals from '../src/globals';

const config: ConnectionData = {
	host: 'host',
	database: 'database',
	user: 'user',
	password: 'password',
};

const sql: string = 'SELECT';

const createResultSetHeader = (insertId: number, affectedRows: number = 1, info: string = ''): ResultSetHeader => {
	return {
		constructor: {
			name: 'ResultSetHeader',
		},
		fieldCount: 0,
		affectedRows,
		insertId,
		info,
		serverStatus: 2,
		warningStatus: 0,
		changedRows: 0,
	};
};
const createFieldPacket = (fieldName: string, type: number): FieldPacket => {
	return Object.create({
		constructor: {
			name: 'FieldPackdet',
		},
		catalog: '',
		db: '',
		table: '',
		orgTable: '',
		name: fieldName,
		orgName: '',
		charsetNr: 0,
		length: 0,
		type: type,
		flags: 0,
		decimals: 0,
		default: '',
		zerofill: false,
		protocol41: false,
	});
};

const rs1: DbRecordSet = [
	{ id: 1, name: 'a' },
	{ id: 2, name: 'b' },
	{ id: 3, name: 'c' },
];
const rs2: DbRecordSet = [
	{ id: 4, name: 'd' },
	{ id: 5, name: 'e' },
	{ id: 6, name: 'f' },
];

/* MOCKS */
jest.mock('mysql2/promise', () => ({ createConnection: jest.fn() }));
const mockQuery: jest.MockedFunction<any> = jest.fn().mockResolvedValue([[{ id: 1 }], [{ id: 2 }]]);
const mockCreateConnection: jest.MockedFunction<any> = (createConnection as jest.MockedFunction<any>).mockResolvedValue({
	query: mockQuery,
});

afterEach(() => {
	jest.clearAllMocks();
});

describe('getConnection', () => {
	const getConnection = mysql.getConnection;

	test('should return Connection if returned by mysql2', async () => {
		const expected = { query: mockQuery };
		mockCreateConnection.mockResolvedValueOnce(expected);
		await getConnection(config).then((connection: Connection) => {
			expect(connection).toEqual(expected);
		});
	});

	test('should reject Promise if error is thrown by mysql2 createConnection', async () => {
		const message: string = 'err_message!';
		const expectedMessage: string = `Error while trying to establish connection | ${message}`;
		mockCreateConnection.mockRejectedValueOnce(new Error(message));
		await getConnection(config).catch((err: unknown) => {
			expect((err as Error).message).toEqual(expectedMessage);
			expect(err instanceof Error).toBeTruthy();
		});
	});
});

describe('query', () => {
	const query = mysql.query;

	test('should return QueryResult if returned by mysql2', async () => {
		// const header: ResultSetHeader = createResultSetHeader(0, 5);
		// const expected = { query: mockQuery };
		// mockCreateConnection.mockResolvedValueOnce(expected);
		// mockQuery.mockResolvedValueOnce([header, []]);
		// await query(sql, mockCreateConnection).then((result: QueryResult) => {
		// 	expect(result).toEqual(header);
		// });
	});
});

describe('getResultSetHeader', () => {
	const getResultSetHeader = mysql.getResultSetHeader;
});

describe('getDbRecordset,', () => {
	const getDbRecordset = mysql.getDbRecordset;
});

describe('isResultSetHeader', () => {
	const isResultSetHeader = mysql.isResultSetHeader;

	test('return false for string', async () => {
		expect(isResultSetHeader('a')).toBeFalsy();
	});

	test('return false for number', async () => {
		expect(isResultSetHeader(1)).toBeFalsy();
	});

	test('return false for boolean', async () => {
		expect(isResultSetHeader(true)).toBeFalsy();
	});

	test('return false for empty array', async () => {
		expect(isResultSetHeader([])).toBeFalsy();
	});

	test('return false for non empty array', async () => {
		expect(isResultSetHeader([1, 2])).toBeFalsy();
	});

	test('return false for empty object', async () => {
		expect(isResultSetHeader({})).toBeFalsy();
	});

	test('return false if affectedRows missing', async () => {
		const object = { insertId: 1, info: '' };
		expect(isResultSetHeader(object)).toBeFalsy();
	});

	test('return false if insertId missing', async () => {
		const object = { affectedRows: 1, info: '' };
		expect(isResultSetHeader(object)).toBeFalsy();
	});

	test('return false if info missing', async () => {
		const object = { affectedRows: 1, insertId: 4 };
		expect(isResultSetHeader(object)).toBeFalsy();
	});

	test('return true if all information in place', async () => {
		const object = { affectedRows: 1, insertId: 4, info: '' };
		expect(isResultSetHeader(object)).toBeTruthy();
	});
});

describe('isRowDataPacket', () => {
	const isRowDataPacket = mysql.isRowDataPacket;

	test('return false for string', async () => {
		expect(isRowDataPacket('a')).toBeFalsy();
	});

	test('return false for number', async () => {
		expect(isRowDataPacket(1)).toBeFalsy();
	});

	test('return false for boolean', async () => {
		expect(isRowDataPacket(true)).toBeFalsy();
	});

	test('return false for non empty array', async () => {
		expect(isRowDataPacket([1, 2])).toBeFalsy();
	});

	test('return false for empty object', async () => {
		expect(isRowDataPacket({})).toBeFalsy();
	});

	test('return false if ResultSetHeader is given', async () => {
		const object = { affectedRows: 1, insertId: 4, info: '' };
		expect(isRowDataPacket(object)).toBeFalsy();
	});

	test('return true for empty array', async () => {
		expect(isRowDataPacket([])).toBeTruthy();
	});

	test('return true if array of objects is given', async () => {
		const arr = [{ id: 1, name: 'a' }, { id: 2, name: 'b', is_active: true }, { id: 3 }];
		expect(isRowDataPacket(arr)).toBeTruthy();
	});
});

describe('getProcCallPacket', () => {
	const getProcCallPacket = mysql.getProcCallPacket;

	test('return undefined for string', async () => {
		expect(getProcCallPacket('a')).toBeUndefined();
	});

	test('return undefined for number', async () => {
		expect(getProcCallPacket(1)).toBeUndefined();
	});

	test('return undefined for boolean', async () => {
		expect(getProcCallPacket(true)).toBeUndefined();
	});

	test('return undefined for non empty array', async () => {
		expect(getProcCallPacket([1, 2])).toBeUndefined();
	});

	test('return undefined for empty object', async () => {
		expect(getProcCallPacket({})).toBeUndefined();
	});

	test('return undefined for empty array', async () => {
		expect(getProcCallPacket([])).toBeUndefined();
	});

	test('return undefined if only array of records is given', async () => {
		const arr = [{ id: 1, name: 'a' }, { id: 2, name: 'b', is_active: true }, { id: 3 }];
		expect(getProcCallPacket(arr)).toBeUndefined();
	});

	test('return proper object if only ResultSetHeader is given', async () => {
		const header: ResultSetHeader = createResultSetHeader(4, 1, '');
		const expected: ProcCallPacket = { items: [], header };
		expect(getProcCallPacket(header)).toEqual(expected);
	});
	test('return proper object  if an array of records and header is given', async () => {
		const header: ResultSetHeader = createResultSetHeader(0, 2);
		const arr: DbRecordSet = [{ id: 1, name: 'a' }, { id: 2, name: 'b', is_active: true }, { id: 3 }];
		const expected: ProcCallPacket = { items: [arr], header };
		expect(getProcCallPacket([arr, header])).toEqual(expected);
	});

	test('return undefined if header and data are swapped', async () => {
		const header: ResultSetHeader = createResultSetHeader(0, 2);
		const arr: DbRecordSet = [{ id: 1, name: 'a' }, { id: 2, name: 'b', is_active: true }, { id: 3 }];
		expect(getProcCallPacket([header, arr])).toBeUndefined();
	});

	test('return undefined if one of RowDataPacket is incorrect', async () => {
		const header: ResultSetHeader = createResultSetHeader(0, 2);
		const arr: DbRecordSet = [{ id: 1, name: 'a' }, { id: 2, name: 'b', is_active: true }, { id: 3 }];
		const arr2: number[] = [1, 2, 3];
		expect(getProcCallPacket([arr, arr2, header])).toBeUndefined();
	});

	test('return proper object  if more data packets are given', async () => {
		const header: ResultSetHeader = createResultSetHeader(0, 2);
		const arr: DbRecordSet = [{ id: 1, name: 'a' }, { id: 2, name: 'b', is_active: true }, { id: 3 }];
		const arr2: DbRecordSet = [
			{ name: 'xyz', value: 123 },
			{ name: 'def', value: 15 },
		];
		const expected: ProcCallPacket = { items: [arr, arr2], header };
		expect(getProcCallPacket([arr, arr2, header])).toEqual(expected);
	});
});

describe('createFieldsArray', () => {
	const createFieldsArray = mysql.createFieldsArray;

	test('return empty array for empty input', async () => {
		expect(createFieldsArray([])).toEqual([]);
	});

	test('return properly converted array', async () => {
		const arr: FieldPacket[] = [createFieldPacket('a', 1), createFieldPacket('name', 24)];
		const expected: DbField[] = [
			{ name: 'a', type: 1 },
			{ name: 'name', type: 24 },
		];
		expect(createFieldsArray(arr)).toEqual(expected);
	});
});

describe('getChangedRowsFromInfo', () => {
	const getChangedRowsFromInfo = mysql.getChangedRowsFromInfo;

	test('return zero for string without changedRows part', async () => {
		const text: string = 'some text';
		expect(getChangedRowsFromInfo(text)).toEqual(0);
	});

	test('return proper value if included in base string', async () => {
		const value: number = 15;
		const text: string = `Affected: 20 rows; Changed: ${value} rows; Status: 1`;
		expect(getChangedRowsFromInfo(text)).toEqual(value);
	});
});

describe('toMultiRecordSet', () => {
	const toMultiRecordSet = mysql.toMultiRecordSet;

	test('return empty object if empty string is given', async () => {
		expect(toMultiRecordSet([])).toEqual({});
	});

	test('return proper MultiRecordSet if plain recordset is given', async () => {
		expect(toMultiRecordSet(rs1)).toEqual({ items: rs1 });
	});

	test('return proper MultiRecordSet if an array with a single recordset is given', async () => {
		expect(toMultiRecordSet([rs1])).toEqual({ items: rs1 });
	});

	test('return proper MultiRecordSet if anonymous recordsets is given', async () => {
		const recordsets: DbRecordSet[] = [rs1, rs2];
		expect(toMultiRecordSet(recordsets)).toEqual({ items_1: rs1, items_2: rs2 });
	});

	test('return proper MultiRecordSet if non-anonymous recordsets is given', async () => {
		const recordsets: DbRecordSet[] = [
			[{ [globals.tableInfoRsColumn]: 'tableA' }],
			rs1,
			[{ [globals.tableInfoRsColumn]: 'tableB' }],
			rs2,
		];
		console.log(recordsets);
		console.log(toMultiRecordSet(recordsets));
		expect(toMultiRecordSet(recordsets)).toEqual({ tableA: rs1, tableB: rs2 });
	});

	test('return proper MultiRecordSet if rs name is missing for some recordsets', async () => {
		const rs3: DbRecordSet = [{ id: 8, value: 'h' }];
		const recordsets: DbRecordSet[] = [
			[{ [globals.tableInfoRsColumn]: 'tableA' }],
			rs1,
			rs2,
			[{ [globals.tableInfoRsColumn]: 'tableC' }],
			rs3,
		];
		console.log(recordsets);
		console.log(toMultiRecordSet(recordsets));
		expect(toMultiRecordSet(recordsets)).toEqual({ tableA: rs1, items_2: rs2, tableC: rs3 });
	});
});
