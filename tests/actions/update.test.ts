import { ConnectionData, WhereCondition, WhereOperator, RequestType } from '../../src/models/sql';
import { TableFieldsMap, DbStructure } from '../../src/models/fields';
import { Update } from '../../src/actions/update';
import { isResultSetHeader, query } from '../../src/mysql';
import { getUpdate } from '../../src/sqlBuilder';
// import { MySqlResponse, QueryResponse } from '../../src/models/responses';
import { DbConnectionError } from '../../src/errors/DbConnectionError';
import { SqlProcessingError } from '../../src/errors/SqlProcessingError';
import { createConnection, ResultSetHeader } from 'mysql2/promise';
import { ObjectOfAny } from 'mielk-fn/lib/models/common';
import { MySqlUpdateResponse } from '../../src/models/responses';

const config: ConnectionData = {
	host: 'host',
	database: 'database',
	user: 'user',
	password: 'password',
};

const sql: string = 'UPDATE';
const usersTable: string = 'users';
const usersFieldsMap: TableFieldsMap = { id: 'user_id', name: 'user_name', isActive: 'is_active' };
const originalRecordset = [
	{ user_id: 1, user_name: 'Adam' },
	{ user_id: 2, user_name: 'Bartek' },
];
const convertedRecordset = [
	{ id: 1, name: 'Adam' },
	{ id: 2, name: 'Bartek' },
];

const createResultSetHeader = (affectedRows: number = 6, changedRows: number = 3): ResultSetHeader => {
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

/* MOCKS */
const mockFieldsMapper = {
	convertRecordset: jest.fn(() => convertedRecordset),
};
jest.mock('../../src/factories/FieldsMapperFactory', () => ({
	create: jest.fn(() => mockFieldsMapper),
}));
jest.mock('../../src/sqlBuilder', () => ({ getUpdate: jest.fn() }));
jest.mock('mysql2/promise', () => ({ createConnection: jest.fn() }));
const mockQuery: jest.MockedFunction<any> = jest.fn();
const mockCreateConnection: jest.MockedFunction<any> = (createConnection as jest.MockedFunction<any>).mockResolvedValue({
	query: mockQuery,
});
const mockGetUpdate: jest.MockedFunction<any> = getUpdate as jest.MockedFunction<any>;

describe('constructor', () => {
	test('should create new instance of Update class', () => {
		const update: Update = new Update(config);
		expect(update).toBeInstanceOf(Update);
	});
});

describe('from', () => {
	test('should assign new value to [_from] parameter', () => {
		const tableName = 'users';
		const update: Update = new Update(config).from(tableName);
		expect(update.___props().from).toEqual(tableName);
	});

	test('should throw an error if empty string is passed', () => {
		expect(() => {
			new Update(config).from(' ');
		}).toThrow('Table name cannot be empty');
	});
});

describe('object', () => {
	test('should assign new value to [_object] parameter', () => {
		const object = { name: 'name', value: 5 };
		const update: Update = new Update(config).object(object);
		expect(update.___props().object).toEqual(object);
	});

	test('should throw an error if the given object is empty', () => {
		expect(() => {
			new Update(config).object({});
		}).toThrow('Object cannot be empty');
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

		const update: Update = new Update(config).where(fieldName1, operator1, value1).where(fieldName2, operator2, value2);

		const where: WhereCondition[] = update.___props().where;
		expect(where.length).toEqual(2);
		expect(where[0]).toEqual({ field: fieldName1, operator: operator1, value: value1 });
		expect(where[1]).toEqual({ field: fieldName2, operator: operator2, value: value2 });
	});
});

describe('conditions', () => {
	test('should append new condition to [_where] array if condition objects are given', () => {
		const where1: WhereCondition = { field: 'name', operator: WhereOperator.Equal, value: 'John' };
		const where2: WhereCondition = { field: 'age', operator: WhereOperator.Equal, value: null };

		const update: Update = new Update(config).conditions(where1, where2);

		const where: WhereCondition[] = update.___props().where;
		expect(where.length).toEqual(2);
		expect(where[0]).toEqual(where1);
		expect(where[1]).toEqual(where2);
	});

	test('should append conditions to [_where] array if conditions objects are given as an array', () => {
		const where1: WhereCondition = { field: 'name', operator: WhereOperator.Equal, value: 'John' };
		const where2: WhereCondition = { field: 'age', operator: WhereOperator.Equal, value: null };

		const update: Update = new Update(config).conditions([where1, where2]);

		const where: WhereCondition[] = update.___props().where;
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
		const object = { name: 'John', surname: 'Smith' };
		const id: number = 5;
		await expect(new Update(config).object(object).where('id', WhereOperator.Equal, id).execute()).rejects.toThrow(
			'UPDATE cannot be executed if [tableName] has not been set'
		);
	});

	test('should throw an error if invoked without object', async () => {
		const id: number = 5;
		await expect(new Update(config).from(usersTable).where('id', WhereOperator.Equal, id).execute()).rejects.toThrow(
			'UPDATE cannot be executed if [object] has not been set'
		);
	});

	test('should throw an error if no WHERE condition is set', async () => {
		const object = { name: 'John', surname: 'Smith' };
		await expect(new Update(config).from(usersTable).object(object).execute()).rejects.toThrow(
			'UPDATE cannot be executed without any condition'
		);
	});

	test('sqlBuilder should be called once and with correct parameters if fieldsMap is not specified', async () => {
		const object = { name: 'John', surname: 'Smith' };
		const update: Update = new Update(config).from(usersTable).object(object).where('name', WhereOperator.Equal, null);

		mockQuery.mockResolvedValueOnce([createResultSetHeader(2, 1), []]);

		await update.execute().then(() => {
			const props = update.___props();
			expect(getUpdate).toHaveBeenCalledTimes(1);
			expect(getUpdate).toHaveBeenCalledWith(usersTable, props.object, props.where, {});
		});
	});

	test('sqlBuilder should be called once and with correct parameters if fieldsMap is specified', async () => {
		const object = { name: 'John', surname: 'Smith' };

		const update: Update = new Update(config).from(usersTable).object(object).where('name', WhereOperator.Equal, null);

		mockQuery.mockResolvedValueOnce([createResultSetHeader(2, 1), []]);

		await update.execute(usersFieldsMap).then(() => {
			const props = update.___props();
			expect(getUpdate).toHaveBeenCalledTimes(1);
			expect(getUpdate).toHaveBeenCalledWith(usersTable, props.object, props.where, usersFieldsMap);
		});
	});

	test('should throw an error if connection to the database failed', async () => {
		const message: string = 'err';
		const expectedMessage: string = `Error while trying to establish connection | ${message}`;
		const object: ObjectOfAny = { id: 1, name: 'A' };
		const where1: WhereCondition = { field: 'name', operator: WhereOperator.Equal, value: null };

		mockCreateConnection.mockRejectedValueOnce(new Error(message));

		expect.assertions(2);

		await new Update(config)
			.from('users')
			.conditions(where1)
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
		const object: ObjectOfAny = { id: 1, name: 'A' };
		const where1: WhereCondition = { field: 'name', operator: WhereOperator.Equal, value: null };

		mockQuery.mockRejectedValueOnce(new Error(message));

		expect.assertions(2);

		await new Update(config)
			.from('users')
			.conditions(where1)
			.object(object)
			.execute()
			.catch((err: unknown) => {
				expect((err as Error).message).toEqual(expectedMessage);
				expect(err instanceof SqlProcessingError).toBeTruthy();
			});
	});

	test('should throw an error if there is an unexecpted response from mysql2/promise', async () => {
		const expectedMessage: string = `Invalid response from mysql2/promise`;
		const where1: WhereCondition = { field: 'name', operator: WhereOperator.Equal, value: null };
		const object = { id: 1, name: 'abc' };

		mockQuery.mockResolvedValue([2, 3, [{ value: 123 }], []]);

		expect.assertions(2);

		await new Update(config)
			.from('users')
			.conditions(where1)
			.object(object)
			.execute()
			.catch((err: unknown) => {
				expect((err as Error).message).toEqual(expectedMessage);
				expect(err instanceof SqlProcessingError).toBeTruthy();
			});
	});

	test('should return correct result', async () => {
		const affectedRows: number = 5;
		const changedRows: number = 3;
		const object = { name: 'John', surname: 'Smith' };
		const update: Update = new Update(config).from(usersTable).object(object).where('name', WhereOperator.Equal, null);

		mockQuery.mockResolvedValueOnce([createResultSetHeader(affectedRows, changedRows), []]);

		await update.execute(usersFieldsMap).then((result: MySqlUpdateResponse) => {
			expect(result.affectedRows).toEqual(affectedRows);
			expect(result.changedRows).toEqual(changedRows);
		});
	});
});
