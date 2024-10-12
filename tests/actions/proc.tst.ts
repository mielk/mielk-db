import { ConnectionData, WhereCondition, WhereOperator, RequestType } from '../../src/models/sql';
import { TableFieldsMap, DbStructure } from '../../src/models/fields';
import { Proc } from '../../src/actions/proc';
import { query } from '../../src/mysql';
import { getCallProc } from '../../src/sqlBuilder';
// import { MySqlResponse } from '../../src/models/responses';
import {
	Connection,
	FieldPacket,
	Query,
	QueryResult,
	QueryOptions,
	ResultSetHeader,
	createConnection,
} from 'mysql2/promise';

const config: ConnectionData = {
	host: 'localhost',
	user: 'root',
	password: 'BQC_7XXzum_YQ46FuN',
	database: 'ling',
};

// // const usersTable: string = 'users';
// const itemsFieldsMap: TableFieldsMap = { id: 'item_id', name: 'item_name' };
// const usersFieldsMap: TableFieldsMap = { id: 'user_id', name: 'user_name', isActive: 'is_active' };
// const structureItem = (table: string, fieldsMap: TableFieldsMap) => {
// 	return {
// 		table,
// 		view: table,
// 		key: 'id',
// 		fieldsMap,
// 	};
// };
// const dbStructure: DbStructure = {
// 	items: structureItem('items', itemsFieldsMap),
// 	users: structureItem('users', usersFieldsMap),
// };

// const sql: string = 'CALL PROC_NAME()';

// const originalRecordset = [
// 	{ user_id: 1, user_name: 'Adam' },
// 	{ user_id: 2, user_name: 'Bartek' },
// ];

// const convertedRecordset = [
// 	{ id: 1, name: 'Adam' },
// 	{ id: 2, name: 'Bartek' },
// ];

// const convertedRecordsets = {};

// // /* MOCKS */

// const mockFieldsMapper = {
// 	convertRecordset: jest.fn(() => convertedRecordset),
// 	convertMultiRecordset: jest.fn(() => convertedRecordsets),
// };
// jest.mock('../../src/factories/FieldsMapperFactory', () => ({
// 	create: jest.fn(() => mockFieldsMapper),
// }));
// jest.mock('../../src/sqlBuilder', () => ({ getCallProc: jest.fn() }));
// jest.mock('../../src/mysql', () => ({ query: jest.fn(() => ({ status: true, rows: 2, items: originalRecordset })) }));

// const mockGetCallProc: jest.MockedFunction<any> = getCallProc as jest.MockedFunction<any>;
// const mockMySqlQuery: jest.MockedFunction<any> = query as jest.MockedFunction<any>;

describe('test', () => {
	// test('trest', async () => {
	// 	//const name: string = 'testtt2';
	// 	// const name: string = 'SELECT * FROM languages';
	// 	// const proc: Proc = new Proc(config).name(name);
	// 	// const response: MySqlResponse = await proc.execute();
	// 	// console.log(response);
	// 	const sql: string = 'SELECT * FROM languages';
	// 	createConnection(config)
	// 		.then(async (connection: Connection) => {
	// 			try {
	// 				connection
	// 					// .query({ sql: sql, nestTables: true })
	// 					.execute(sql)
	// 					.then((response) => {
	// 						console.log(response);
	// 						const [data, fields] = response;
	// 						return data;
	// 					})
	// 					.catch((err: unknown) => {
	// 						throw new Error(`${'ERR_FETCHING'} | ${(err as Error).message}`);
	// 					});
	// 			} catch (err: unknown) {
	// 				throw new Error(`${'ERR_FETCHING'} | ${(err as Error).message}`);
	// 			}
	// 		})
	// 		.catch((err: unknown) => {
	// 			throw new Error(`${'ERR_CONNECTION'} | ${(err as Error).message}`);
	// 		});
	// });
	// //No return rs
	// const result = {
	//     fields: [],
	//     insertId: 0,
	//     items: [],
	//     rows: 0
	// }
	expect(1).toBe(1);
});

// describe('constructor', () => {
// 	test('should create new instance of Proc class', () => {
// 		const proc: Proc = new Proc(config);
// 		expect(proc).toBeInstanceOf(Proc);
// 	});
// });

// describe('name', () => {
// 	test('should assign new value to [_name] parameter', () => {
// 		const name = 'sp___proc_name';
// 		const proc: Proc = new Proc(config).name(name);
// 		expect(proc.___props().name).toEqual(name);
// 	});

// 	test('should throw an error if empty string is passed', () => {
// 		expect(() => {
// 			new Proc(config).name(' ');
// 		}).toThrow('Procedure name cannot be empty');
// 	});
// });

// describe('parmas', () => {
// 	test('should append new params ', () => {
// 		const proc: Proc = new Proc(config).params(1, 'a', false);
// 		const params: (string | number | boolean | null)[] = proc.___props().params;
// 		expect(params.length).toEqual(3);
// 		expect(params[0]).toEqual(1);
// 		expect(params[1]).toEqual('a');
// 		expect(params[2]).toEqual(false);
// 	});
// });

// describe('execute', () => {
// 	afterEach(() => {
// 		jest.clearAllMocks();
// 	});

// 	test('should throw an error if invoked without the name', async () => {
// 		await expect(new Proc(config).params(1, 'a').execute()).rejects.toThrow(
// 			'PROC cannot be executed if [name] has not been set'
// 		);
// 	});

// 	test('sqlBuilder should be called once and with correct parameters if params are given', async () => {
// 		const name: string = 'proc_name';
// 		const params: (string | number | boolean | null)[] = [1, 'a'];

// 		const proc: Proc = new Proc(config).name(name).params(...params);
// 		await proc.execute().then(() => {
// 			expect(mockGetCallProc).toHaveBeenCalledTimes(1);
// 			expect(mockGetCallProc).toHaveBeenCalledWith(name, params);
// 		});
// 	});

// 	test('sqlBuilder should be called once and with correct parameters if no params are given', async () => {
// 		const name: string = 'proc_name';

// 		const proc: Proc = new Proc(config).name(name);
// 		await proc.execute().then(() => {
// 			expect(mockGetCallProc).toHaveBeenCalledTimes(1);
// 			expect(mockGetCallProc).toHaveBeenCalledWith(name, []);
// 		});
// 	});

// 	test('mysql should be called once and with correct parameters', async () => {
// 		const proc: Proc = new Proc(config).name('proc_name');

// 		mockGetCallProc.mockReturnValue(sql);

// 		await proc.execute().then(() => {
// 			expect(query).toHaveBeenCalledTimes(1);
// 			expect(query).toHaveBeenCalledWith(config, sql);
// 		});
// 	});

// 	test('if fieldsMap is specified, FieldsMapper should be invoked on the query result', async () => {
// 		const proc: Proc = new Proc(config).name('name');

// 		await proc.execute(usersFieldsMap).then(() => {
// 			// expect(mockFieldsMapper.convertMultiRecordset).toHaveBeenCalledTimes(1);
// 			// expect(mockFieldsMapper.convertMultiRecordset).toHaveBeenCalledWith(originalRecordset, usersFieldsMap);
// 		});
// 	});

// 	// test('if fieldsMap is not specified, FieldsMapper should not be invoked on the query result', async () => {
// 	// 	const object = { name: 'John', surname: 'Smith' };
// 	// 	const update: Update = new Update(config).from(usersTable).object(object).where('name', WhereOperator.Equal, null);

// 	// 	await update.execute().then(() => {
// 	// 		expect(mockFieldsMapper.convertRecordset).toHaveBeenCalledTimes(0);
// 	// 	});
// 	// });

// 	// test('should return correct result if fieldsMap is specified', async () => {
// 	// 	const object = { name: 'John', surname: 'Smith' };

// 	// 	const update: Update = new Update(config).from(usersTable).object(object).where('name', WhereOperator.Equal, null);

// 	// 	await update.execute(usersFieldsMap).then((result) => {
// 	// 		expect(result.status).toBeTruthy();
// 	// 		expect(result.rows).toEqual(2);
// 	// 		expect(result.items).toEqual(convertedRecordset);
// 	// 	});
// 	// });

// 	// test('should return correct result if fieldsMap is not specified', async () => {
// 	// 	const object = { name: 'John', surname: 'Smith' };

// 	// 	const update: Update = new Update(config).from(usersTable).object(object).where('name', WhereOperator.Equal, null);

// 	// 	await update.execute().then((result) => {
// 	// 		expect(result.status).toBeTruthy();
// 	// 		expect(result.rows).toEqual(2);
// 	// 		expect(result.items).toEqual(originalRecordset);
// 	// 		expect(result.message).toBeUndefined();
// 	// 	});
// 	// });

// 	// test('should return falsy status and error message result if error was thrown by mysql', async () => {
// 	// 	const errorMessage: string = 'Error message';
// 	// 	const object = { name: 'John', surname: 'Smith' };
// 	// 	const update: Update = new Update(config).from('table').object(object).where('name', WhereOperator.Equal, null);

// 	// 	mockMySqlQuery.mockImplementation(() => {
// 	// 		throw new Error(errorMessage);
// 	// 	});

// 	// 	await update.execute().then((result) => {
// 	// 		expect(result.status).toBeFalsy();
// 	// 		expect(result.rows).toBeUndefined();
// 	// 		expect(result.items).toBeUndefined();
// 	// 		expect(result.message).toEqual(errorMessage);
// 	// 	});
// 	// });
// });
