import { ConnectionData, OperationType } from '../../src/models/sql';
import { DbRecord } from '../../src/models/records';
import { TableFieldsMap, DbStructure } from '../../src/models/fields';
import { Insert } from '../../src/actions/insert';
import { getInsert, getSelect } from '../../src/sqlBuilder';
import { SqlProcessingError } from '../../src/errors/SqlProcessingError';
import { DbConnectionError } from '../../src/errors/DbConnectionError';
import { createConnection, ResultSetHeader } from 'mysql2/promise';
import { MySqlResponse } from '../../src/models/responses';

const config: ConnectionData = {
	host: 'host',
	database: 'database',
	user: 'user',
	password: 'password',
};

const sqlInsert: string = 'INSERT';
const sqlSelect: string = 'SELECT';
const object: DbRecord = { name: 'name', value: 5 };

const createResultSetHeader = (insertId: number, affectedRows: number = 1): ResultSetHeader => {
	return {
		constructor: {
			name: 'ResultSetHeader',
		},
		fieldCount: 0,
		affectedRows,
		insertId,
		info: '',
		serverStatus: 2,
		warningStatus: 0,
		changedRows: 0,
	};
};

const usersTable: string = 'users';
const itemsFieldsMap: TableFieldsMap = { id: 'item_id', name: 'item_name' };
const usersFieldsMap: TableFieldsMap = { id: 'user_id', name: 'user_name', isActive: 'is_active' };
const structureItem = (table: string, fieldsMap: TableFieldsMap) => {
	return {
		table,
		view: table,
		key: 'id',
		fieldsMap,
	};
};
const dbStructure: DbStructure = {
	items: structureItem('items', itemsFieldsMap),
	users: structureItem('users', usersFieldsMap),
};

const convertedRecordset = [
	{ id: 1, name: 'Adam' },
	{ id: 2, name: 'Bartek' },
];

/* MOCKS */

const mockFieldsMapper = {
	convertRecordset: jest.fn(() => convertedRecordset),
};
jest.mock('../../src/factories/FieldsMapperFactory', () => ({
	create: jest.fn(() => mockFieldsMapper),
}));
jest.mock('../../src/sqlBuilder', () => ({
	getSelect: jest.fn(),
	getInsert: jest.fn(),
}));
// jest.mock('../../src/mysql', () => ({
// 	query: jest.fn(),
// }));
jest.mock('mysql2/promise', () => ({ createConnection: jest.fn() }));
const mockQuery: jest.MockedFunction<any> = jest.fn().mockResolvedValue([[{ id: 1 }], [{ id: 2 }]]);
const mockCreateConnection: jest.MockedFunction<any> = (createConnection as jest.MockedFunction<any>).mockResolvedValue({
	query: mockQuery,
});
const mockGetInsert: jest.MockedFunction<any> = getInsert as jest.MockedFunction<any>;
const mockGetSelect: jest.MockedFunction<any> = getSelect as jest.MockedFunction<any>;
mockGetSelect.mockReturnValue(sqlSelect);
mockGetInsert.mockReturnValue(sqlInsert);
// mockMySqlQuery.mockResolvedValue({ rows: 1, items: [object], insertId: 100 });

describe('constructor', () => {
	test('should create new instance of Insert class', () => {
		const insert: Insert = new Insert(config);
		expect(insert).toBeInstanceOf(Insert);
	});
});

describe('into', () => {
	test('should assign new value to [_into] parameter', () => {
		const tableName: string = 'users';
		const insert: Insert = new Insert(config).into(tableName);
		expect(insert.___props().into).toEqual(tableName);
	});

	test('should throw an error if empty string is passed', () => {
		expect(() => {
			new Insert(config).into(' ');
		}).toThrow('Table name cannot be empty');
	});
});

describe('object', () => {
	test('should assign new value to [_object] parameter', () => {
		const insert: Insert = new Insert(config).object(object);
		expect(insert.___props().object).toEqual(object);
	});

	test('should throw an error if the given object is empty', () => {
		expect(() => {
			new Insert(config).object({});
		}).toThrow('Object cannot be empty');
	});
});

describe('execute', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	test('should throw an error if invoked without table name', async () => {
		await expect(new Insert(config).object(object).execute()).rejects.toThrow(
			'INSERT cannot be executed if [tableName] has not been set'
		);
	});

	test('should throw an error if invoked without object', async () => {
		const tableName: string = 'users';
		new Insert(config)
			.into(tableName)
			.execute()
			.catch((err) => {
				expect(err.message).toBe('INSERT cannot be executed if [object] has not been set');
			});
	});

	test('sqlBuilder should be called once and with correct parameters if fieldsMap is not specified', async () => {
		const tableName: string = 'users';
		const insert: Insert = new Insert(config).into(tableName).object(object);
		const props = insert.___props();

		mockQuery.mockResolvedValueOnce([createResultSetHeader(1), []]);

		await insert.execute().then(() => {
			expect(getInsert).toHaveBeenCalledTimes(1);
			expect(getInsert).toHaveBeenCalledWith(tableName, props.object, {});
		});
	});

	test('sqlBuilder should be called once and with correct parameters if fieldsMap is specified', async () => {
		const tableName: string = 'users';
		const insert: Insert = new Insert(config).into(tableName).object(object);
		const props: Record<string, any> = insert.___props();

		mockQuery.mockResolvedValueOnce([createResultSetHeader(1), []]);

		await insert.execute(usersFieldsMap).then(() => {
			expect(getInsert).toHaveBeenCalledTimes(1);
			expect(getInsert).toHaveBeenCalledWith(tableName, props.object, usersFieldsMap);
		});
	});

	test('should throw an error if connection to the database failed', async () => {
		const message: string = 'err';
		const expectedMessage: string = `Error while trying to establish connection | ${message}`;
		const object = { id: 1, name: 'abc' };

		mockCreateConnection.mockRejectedValueOnce(new Error(message));

		expect.assertions(2);

		await new Insert(config)
			.into('users')
			.object(object)
			.execute()
			.catch((err: unknown) => {
				expect((err as Error).message).toEqual(expectedMessage);
				expect(err instanceof DbConnectionError).toBeTruthy();
			});
	});

	test('should throw an error if there is an error in SQL execution', async () => {
		const message: string = 'err';
		const expectedMessage: string = `Error while executing SQL | ${message}`;
		const object = { id: 1, name: 'abc' };

		mockQuery.mockRejectedValueOnce(new Error(message));

		expect.assertions(2);

		await new Insert(config)
			.into('users')
			.object(object)
			.execute()
			.catch((err: unknown) => {
				expect((err as Error).message).toEqual(expectedMessage);
				expect(err instanceof SqlProcessingError).toBeTruthy();
			});
	});

	test('should throw an error if there is an unexecpted response from mysql2/promise', async () => {
		const expectedMessage: string = `Invalid response from mysql2/promise`;
		const object = { id: 1, name: 'abc' };

		mockQuery.mockResolvedValue([2, 3, [{ value: 123 }], []]);

		expect.assertions(2);

		await new Insert(config)
			.into('users')
			.object(object)
			.execute()
			.catch((err: unknown) => {
				expect((err as Error).message).toEqual(expectedMessage);
				expect(err instanceof SqlProcessingError).toBeTruthy();
			});
	});

	test('should return correct value if successful', async () => {
		const insertId: number = 2;
		const affectedRows: number = 1;
		const object = { id: 1, name: 'abc' };
		const insert: Insert = new Insert(config).into('users').object(object);
		const expectedResponse: MySqlResponse = {
			operationType: OperationType.Insert,
			affectedRows,
			changedRows: 0,
			insertId,
			items: {},
		};

		mockQuery.mockResolvedValue([createResultSetHeader(insertId, affectedRows), []]);

		await insert.execute().then((response: MySqlResponse) => {
			expect(response).toEqual(expectedResponse);
		});
	});
});
