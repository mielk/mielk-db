import { ConnectionData, WhereCondition, WhereOperator } from '../../src/models/sql';
import { TableFieldsMap } from '../../src/models/fields';
import { Delete } from '../../src/actions/delete';
import { getDelete } from '../../src/sqlBuilder';
import { createConnection, ResultSetHeader } from 'mysql2/promise';
import { DbConnectionError } from '../../src/errors/DbConnectionError';
import { SqlProcessingError } from '../../src/errors/SqlProcessingError';
import { MySqlDeleteResponse } from '../../src/models/responses';

const config: ConnectionData = {
	host: 'host',
	database: 'database',
	user: 'user',
	password: 'password',
};

const usersFieldsMap: TableFieldsMap = {
	id: 'user_id',
	name: 'user_name',
	isActive: 'is_active',
};

const sql: string = 'DELETE';

const createResultSetHeader = (affectedRows: number): ResultSetHeader => {
	return {
		constructor: {
			name: 'ResultSetHeader',
		},
		fieldCount: 0,
		affectedRows,
		insertId: 0,
		info: '',
		serverStatus: 2,
		warningStatus: 0,
		changedRows: 0,
	};
};

/* MOCKS */
jest.mock('../../src/sqlBuilder', () => ({ getDelete: jest.fn() }));
jest.mock('mysql2/promise', () => ({ createConnection: jest.fn() }));
const mockQuery: jest.MockedFunction<any> = jest.fn();
const mockCreateConnection: jest.MockedFunction<any> = (createConnection as jest.MockedFunction<any>).mockResolvedValue({
	query: mockQuery,
});
const mockGetDelete: jest.MockedFunction<any> = getDelete as jest.MockedFunction<any>;
mockGetDelete.mockReturnValue(sql);

describe('constructor', () => {
	test('should create new instance of Delete class', () => {
		const del: Delete = new Delete(config);
		expect(del).toBeInstanceOf(Delete);
	});
});

describe('from', () => {
	test('should assign new value to [_from] parameter', () => {
		const tableName = 'users';
		const del: Delete = new Delete(config).from(tableName);
		expect(del.___props().from).toEqual(tableName);
	});

	test('should throw an error if empty string is passed', () => {
		expect(() => {
			new Delete(config).from(' ');
		}).toThrow('Table name cannot be empty');
	});
});

describe('where', () => {
	test('should append new condition to [_where] array if condition parts are given', () => {
		const fieldName1: string = 'name';
		const operator1: WhereOperator = WhereOperator.Equal;
		const value1: string = 'John';
		const fieldName2: string = 'age';
		const operator2: WhereOperator = WhereOperator.Equal;
		const value2 = null;

		const del: Delete = new Delete(config).where(fieldName1, operator1, value1).where(fieldName2, operator2, value2);

		const where: WhereCondition[] = del.___props().where;
		expect(where.length).toEqual(2);
		expect(where[0]).toEqual({ field: fieldName1, operator: operator1, value: value1 });
		expect(where[1]).toEqual({ field: fieldName2, operator: operator2, value: value2 });
	});
});

describe('conditions', () => {
	test('should append new condition to [_where] array if condition objects are given', () => {
		const where1: WhereCondition = { field: 'name', operator: WhereOperator.Equal, value: 'John' };
		const where2: WhereCondition = { field: 'age', operator: WhereOperator.Equal, value: null };

		const del: Delete = new Delete(config).conditions(where1, where2);

		const where: WhereCondition[] = del.___props().where;
		expect(where.length).toEqual(2);
		expect(where[0]).toEqual(where1);
		expect(where[1]).toEqual(where2);
	});

	test('should append conditions to [_where] array if conditions objects are given as an array', () => {
		const where1: WhereCondition = { field: 'name', operator: WhereOperator.Equal, value: 'John' };
		const where2: WhereCondition = { field: 'age', operator: WhereOperator.Equal, value: null };

		const del: Delete = new Delete(config).conditions([where1, where2]);

		const where: WhereCondition[] = del.___props().where;
		expect(where.length).toEqual(2);
		expect(where[0]).toEqual(where1);
		expect(where[1]).toEqual(where2);
	});
});

describe('execute', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	test('should throw an error if invoked without table name', async () => {
		const id: number = 5;
		await expect(new Delete(config).where('id', WhereOperator.Equal, id).execute()).rejects.toThrow(
			'DELETE cannot be executed if [tableName] has not been set'
		);
	});

	test('should throw an error if no WHERE condition is set', async () => {
		const tableName: string = 'users';
		await expect(new Delete(config).from(tableName).execute()).rejects.toThrow(
			'DELETE cannot be executed without any condition'
		);
	});

	test('sqlBuilder should be called once and with correct parameters if fieldsMap is not specified', async () => {
		const tableName: string = 'users';
		const where1: WhereCondition = { field: 'name', operator: WhereOperator.Equal, value: null };
		const del: Delete = new Delete(config).from(tableName).conditions(where1);

		mockQuery.mockResolvedValueOnce([createResultSetHeader(1), []]);

		await del.execute().then(() => {
			expect(getDelete).toHaveBeenCalledTimes(1);
			expect(getDelete).toHaveBeenCalledWith(tableName, [where1], {});
		});
	});

	test('sqlBuilder should be called once and with correct parameters if fieldsMap is specified', async () => {
		const tableName: string = 'users';
		const where1: WhereCondition = { field: 'name', operator: WhereOperator.Equal, value: null };
		const del: Delete = new Delete(config).from(tableName).conditions(where1);

		mockQuery.mockResolvedValueOnce([createResultSetHeader(1), []]);

		await del.execute(usersFieldsMap).then(() => {
			expect(mockGetDelete).toHaveBeenCalledTimes(1);
			expect(mockGetDelete).toHaveBeenCalledWith(tableName, [where1], usersFieldsMap);
		});
	});

	test('should throw an error if connection to the database failed', async () => {
		const message: string = 'err!!';
		const expectedMessage: string = `Error while trying to establish connection | ${message}`;
		const where1: WhereCondition = { field: 'name', operator: WhereOperator.Equal, value: null };

		mockCreateConnection.mockRejectedValueOnce(new Error(message));

		expect.assertions(2);

		await new Delete(config)
			.from('users')
			.conditions(where1)
			.execute()
			.catch((err: unknown) => {
				expect((err as Error).message).toEqual(expectedMessage);
				expect(err instanceof DbConnectionError).toBeTruthy();
			});
	});

	test('should throw an error if there is an error in SQL execution', async () => {
		const message: string = 'err';
		const expectedMessage: string = `Error while executing SQL | ${message}`;
		const where1: WhereCondition = { field: 'name', operator: WhereOperator.Equal, value: null };

		mockQuery.mockRejectedValueOnce(new Error(message));

		expect.assertions(2);

		await new Delete(config)
			.from('users')
			.conditions(where1)
			.execute()
			.catch((err: unknown) => {
				expect((err as Error).message).toEqual(expectedMessage);
				expect(err instanceof SqlProcessingError).toBeTruthy();
			});
	});

	test('should throw an error if there is an unexecpted response from mysql2/promise', async () => {
		const expectedMessage: string = `Invalid response from mysql2/promise`;
		const where1: WhereCondition = { field: 'name', operator: WhereOperator.Equal, value: null };

		mockQuery.mockResolvedValue([[{ value: 123 }], []]);

		expect.assertions(2);

		await new Delete(config)
			.from('users')
			.conditions(where1)
			.execute()
			.catch((err: unknown) => {
				expect((err as Error).message).toEqual(expectedMessage);
				expect(err instanceof SqlProcessingError).toBeTruthy();
			});
	});

	test('should return correct value', async () => {
		const affectedRows: number = 2;
		const del: Delete = new Delete(config).from('users').where('name', WhereOperator.Equal, null);
		const expectedResponse: MySqlDeleteResponse = { affectedRows: 1 };

		mockQuery.mockResolvedValue([createResultSetHeader(affectedRows), []]);

		await del.execute().then((response: MySqlDeleteResponse) => {
			expect(response.affectedRows).toBe(2);
		});
	});
});
