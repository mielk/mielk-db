import { ConnectionData } from '../../src/models/sql';
import { Proc } from '../../src/actions/proc';
import { getCallProc } from '../../src/sqlBuilder';
import { ResultSetHeader, createConnection } from 'mysql2/promise';
import { MySqlProcResponse } from '../../src/models/responses';
import { DbRecordSet } from '../../lib/models/records';

const createResultSetHeader = (affectedRows: number = 1, changedRows: number = 1): ResultSetHeader => {
	return {
		constructor: {
			name: 'ResultSetHeader',
		},
		fieldCount: 0,
		affectedRows,
		insertId: 0,
		info: `Rows matched: ${affectedRows}  Changed: ${changedRows}  Warnings: 0`,
		serverStatus: 2,
		warningStatus: 0,
		changedRows,
	};
};

const config: ConnectionData = {
	host: 'host',
	database: 'database',
	user: 'user',
	password: 'password',
};

const procName: string = 'PROC_NAME';
const sql: string = `CALL ${procName}()`;

// const originalRecordset = [
// 	{ user_id: 1, user_name: 'Adam' },
// 	{ user_id: 2, user_name: 'Bartek' },
// ];

const rs: DbRecordSet = [
	{ id: 1, name: 'Adam' },
	{ id: 2, name: 'Bartek' },
];

// const convertedRecordsets = {};

/* MOCKS */

const mockFieldsMapper = {
	convertRecordset: jest.fn(() => rs),
};
jest.mock('../../src/factories/FieldsMapperFactory', () => ({
	create: jest.fn(() => mockFieldsMapper),
}));

jest.mock('../../src/sqlBuilder', () => ({ getCallProc: jest.fn() }));
jest.mock('mysql2/promise', () => ({ createConnection: jest.fn() }));
const mockQuery: jest.MockedFunction<any> = jest.fn().mockResolvedValue([[{ id: 1 }], [{ id: 2 }]]);
const mockCreateConnection: jest.MockedFunction<any> = (createConnection as jest.MockedFunction<any>).mockResolvedValue({
	query: mockQuery,
});
const mockGetProc: jest.MockedFunction<any> = getCallProc as jest.MockedFunction<any>;
mockGetProc.mockReturnValue(sql);

describe('constructor', () => {
	test('should create new instance of Proc class', () => {
		const proc: Proc = new Proc(config);
		expect(proc).toBeInstanceOf(Proc);
	});
});

describe('name', () => {
	test('should assign new value to [_name] parameter', () => {
		const name = 'sp___proc_name';
		const proc: Proc = new Proc(config).name(name);
		expect(proc.___props().name).toEqual(name);
	});

	test('should throw an error if empty string is passed', () => {
		expect(() => {
			new Proc(config).name(' ');
		}).toThrow('Procedure name cannot be empty');
	});
});

describe('params', () => {
	test('should append new params ', () => {
		const proc: Proc = new Proc(config).params(1, 'a', false);
		const params: (string | number | boolean | null)[] = proc.___props().params;
		expect(params.length).toEqual(3);
		expect(params[0]).toEqual(1);
		expect(params[1]).toEqual('a');
		expect(params[2]).toEqual(false);
	});
});

describe('execute', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	test('should throw an error if invoked without the name', async () => {
		await expect(new Proc(config).params(1, 'a').execute()).rejects.toThrow(
			'PROC cannot be executed if [name] has not been set'
		);
	});

	test('should return correct result if no result set is returned', async () => {
		const proc: Proc = new Proc(config).name(procName);
		const affectedRows: number = 4;
		const changedRows: number = 3;

		mockQuery.mockResolvedValueOnce([createResultSetHeader(affectedRows, changedRows), []]);

		await proc.execute().then((result: MySqlProcResponse) => {
			expect(result).toBeTruthy();
			expect(result.affectedRows).toEqual(affectedRows);
			expect(result.changedRows).toEqual(changedRows);
			expect(result.items).toEqual({});
		});
	});

	test('should return correct result if a single result set is returned', async () => {
		const proc: Proc = new Proc(config).name(procName);
		const affectedRows: number = 4;
		const changedRows: number = 3;

		mockQuery.mockResolvedValueOnce([[rs, createResultSetHeader(affectedRows, changedRows)], []]);

		await proc.execute().then((result: MySqlProcResponse) => {
			expect(result).toBeTruthy();
			expect(result.affectedRows).toEqual(affectedRows);
			expect(result.changedRows).toEqual(changedRows);
			expect(result.items).toEqual({ items: rs });
		});
	});

	test('should return correct result if anonymous result sets are returned', async () => {
		const proc: Proc = new Proc(config).name(procName);
		const affectedRows: number = 8;
		const changedRows: number = 5;
		const rs2: DbRecordSet = [
			{ id: 1, value: 'a' },
			{ id: 2, value: 'b' },
		];

		mockQuery.mockResolvedValueOnce([[rs, rs2, createResultSetHeader(affectedRows, changedRows)], []]);

		await proc.execute().then((result: MySqlProcResponse) => {
			expect(result).toBeTruthy();
			expect(result.affectedRows).toEqual(affectedRows);
			expect(result.changedRows).toEqual(changedRows);
			expect(result.items).toEqual({ items_1: rs, items_2: rs2 });
		});
	});

	test('should return correct result if non-anonymous result sets are returned', async () => {
		const proc: Proc = new Proc(config).name(procName);
		const affectedRows: number = 8;
		const changedRows: number = 5;
		const rs2: DbRecordSet = [
			{ id: 1, value: 'a' },
			{ id: 2, value: 'b' },
		];

		mockQuery.mockResolvedValueOnce([
			[
				[{ recordsetName: 'ABC' }],
				rs,
				[{ recordsetName: 'DEF' }],
				rs2,
				createResultSetHeader(affectedRows, changedRows),
			],
			[],
		]);

		await proc.execute().then((result: MySqlProcResponse) => {
			expect(result).toBeTruthy();
			expect(result.affectedRows).toEqual(affectedRows);
			expect(result.changedRows).toEqual(changedRows);
			expect(result.items).toEqual({ ABC: rs, DEF: rs2 });
		});
	});
});
