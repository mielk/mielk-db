// import { ObjectOfPrimitives } from 'mielk-fn/lib/models/common.js';
// import { FieldPacket, QueryOptions, ResultSetHeader, RowDataPacket, createConnection } from 'mysql2/promise';
// import { ConnectionData } from '../src/models/sql';
// import { QueryResponse } from '../src/models/responses';
// import { query } from '../src/mysql';
// import { DbConnectionError } from '../src/errors/DbConnectionError';
// import { SqlProcessingError } from '../src/errors/SqlProcessingError';

// const config: ConnectionData = {
// 	host: 'host',
// 	database: 'database',
// 	user: 'username',
// 	password: 'password',
// };

// const mockFactory = (() => {
// 	function createFieldPacket(fieldName: string, type: number): FieldPacket {
// 		return Object.create({
// 			constructor: {
// 				name: 'FieldPackdet',
// 			},
// 			catalog: '',
// 			db: '',
// 			table: '',
// 			orgTable: '',
// 			name: fieldName,
// 			orgName: '',
// 			charsetNr: 0,
// 			length: 0,
// 			type: type,
// 			flags: 0,
// 			decimals: 0,
// 			default: '',
// 			zerofill: false,
// 			protocol41: false,
// 		});
// 	}

// 	function createResultSetHeader(rows: number, id: number): ResultSetHeader {
// 		return Object.create({
// 			constructor: {
// 				name: 'ResultSetHeader',
// 			},
// 			fieldCount: 0,
// 			affectedRows: rows,
// 			insertId: id,
// 			serverStatus: 2,
// 			warningCount: 0,
// 			info: '',
// 		});
// 	}

// 	function createRowDataPacket(properties: ObjectOfPrimitives): RowDataPacket {
// 		const obj = Object.create({
// 			constructor: {
// 				name: 'RowDataPacket',
// 			},
// 		});
// 		Object.entries(properties).forEach(([key, value]) => {
// 			obj[key] = value;
// 		});

// 		return obj;
// 	}

// 	const fieldPackets: FieldPacket[] = [
// 		createFieldPacket('user_id', 3),
// 		createFieldPacket('user_name', 253),
// 		createFieldPacket('is_active', 1),
// 	];

// 	const rowDataPackets: RowDataPacket[] = [
// 		createRowDataPacket({ user_id: 1, user_name: 'Adam', is_active: true }),
// 		createRowDataPacket({ user_id: 2, user_name: 'Bartek', is_active: false }),
// 		createRowDataPacket({ user_id: 3, user_name: 'Czesiek', is_active: true }),
// 	];

// 	return {
// 		fieldPackets,
// 		rowDataPackets,
// 		createResultSetHeader,
// 	};
// })();

// jest.mock('mysql2/promise', () => ({
// 	createConnection: jest.fn(),
// }));
// const mockQuery: jest.MockedFunction<any> = jest.fn();
// const mockCreateConnection: jest.MockedFunction<any> = (createConnection as jest.MockedFunction<any>).mockResolvedValue({
// 	query: mockQuery,
// });

// // mockCreateConnection.mockResolvedValueOnce({
// // 	query: mockQuery,
// // });

// describe('query', () => {
// 	afterEach(() => {
// 		jest.clearAllMocks();
// 	});

// 	test('throw connection error if connection could not been established', async () => {
// 		const error: Error = new Error('Connection failure');
// 		const expected: Error = new DbConnectionError('Error while trying to establish connection | ' + error.message);
// 		mockCreateConnection.mockImplementationOnce(() => {
// 			throw error;
// 		});

// 		await query(config, '').catch((err) => {
// 			expect(err instanceof DbConnectionError).toBeTruthy();
// 			expect(err.message).toEqual(expected.message);
// 		});
// 	});

// 	test('re-throw an error if connection was established but there was an error in SQL', async () => {
// 		const err: Error = new Error('SQL error');
// 		const expected: Error = new SqlProcessingError('Error while executing SQL | ' + err.message);
// 		mockCreateConnection.mockResolvedValueOnce({
// 			query: jest.fn(() => {
// 				throw err;
// 			}),
// 		});

// 		await query(config, '').catch((err) => {
// 			expect(err instanceof SqlProcessingError).toBeTruthy();
// 			expect(err.message).toEqual(expected.message);
// 		});
// 	});

// 	test('mysql2 functions are called only once', async () => {
// 		const sql: string = 'sql';
// 		const expectedOptions: QueryOptions = { sql, nestTables: true };

// 		const result = await query(config, sql).catch((err) => {});

// 		expect(createConnection).toHaveBeenCalledTimes(1);
// 		expect(createConnection).toHaveBeenCalledWith(config);
// 		expect(mockQuery).toHaveBeenCalledTimes(1);
// 		expect(mockQuery).toHaveBeenCalledWith(expectedOptions);
// 	});

// 	test('query should handle SELECT statement if proper result returned by database', async () => {
// 		// mockCreateConnection.mockResolvedValueOnce({
// 		// 	execute: jest.fn().mockResolvedValue([mockFactory.rowDataPackets, mockFactory.fieldPackets]),
// 		// });
// 		mockQuery.mockResolvedValue([mockFactory.rowDataPackets, mockFactory.fieldPackets]);

// 		const expected: QueryResponse = {
// 			info: {
// 				affectedRows: 0,
// 			},
// 			records: [
// 				{
// 					items: [
// 						{ user_id: 1, user_name: 'Adam', is_active: true },
// 						{ user_id: 2, user_name: 'Bartek', is_active: false },
// 						{ user_id: 3, user_name: 'Czesiek', is_active: true },
// 					],
// 					fields: [
// 						{ name: 'user_id', type: 3 },
// 						{ name: 'user_name', type: 253 },
// 						{ name: 'is_active', type: 1 },
// 					],
// 				},
// 			],
// 		};

// 		await expect(query(config, 'sql')).resolves.toEqual(expected);
// 	});

// 	// test('query should handle INSERT statement', async () => {
// 	// 	mockCreateConnection.mockResolvedValue({
// 	// 		execute: jest.fn().mockResolvedValue([mockFactory.createResultSetHeader(1, 1), undefined]),
// 	// 	});

// 	// 	const expected: QueryResponse = {
// 	// 		items: [],
// 	// 		rows: 1,
// 	// 		insertId: 1,
// 	// 		fields: [],
// 	// 	};

// 	// 	await expect(query(config, '')).resolves.toEqual(expected);
// 	// });

// 	// test('query should handle UPDATE statement', async () => {
// 	// 	mockCreateConnection.mockResolvedValue({
// 	// 		execute: jest.fn().mockResolvedValue([mockFactory.createResultSetHeader(3, 0), undefined]),
// 	// 	});

// 	// 	const expected: QueryResponse = {
// 	// 		items: [],
// 	// 		rows: 3,
// 	// 		insertId: 0,
// 	// 		fields: [],
// 	// 	};

// 	// 	await expect(query(config, '')).resolves.toEqual(expected);
// 	// });

// 	// test('query should handle DELETE statement', async () => {
// 	// 	mockCreateConnection.mockResolvedValue({
// 	// 		execute: jest.fn().mockResolvedValue([mockFactory.createResultSetHeader(1, 0), undefined]),
// 	// 	});

// 	// 	const expected: QueryResponse = {
// 	// 		items: [],
// 	// 		rows: 1,
// 	// 		insertId: 0,
// 	// 		fields: [],
// 	// 	};

// 	// 	await expect(query(config, '')).resolves.toEqual(expected);
// 	// });

// 	// it('should handle procedures with a single recordset as an output', async () => {});

// 	// it('should handle procedures with a multiple recordsets as an output', async () => {});
// });
