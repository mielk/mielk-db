import { ConnectionData, WhereCondition, WhereOperator } from '../../src/models/sql';
import { TableFieldsMap } from '../../src/models/fields';
import { Delete } from '../../src/actions/delete';
import { query } from '../../src/mysql';
import { getDelete } from '../../src/sqlBuilder';

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

/* MOCKS */
jest.mock('../../src/sqlBuilder', () => ({
	getDelete: jest.fn(),
}));
jest.mock('../../src/mysql', () => ({
	query: jest.fn(),
}));

const mockGetDelete: jest.MockedFunction<any> = getDelete as jest.MockedFunction<any>;
const mockMySqlQuery: jest.MockedFunction<any> = query as jest.MockedFunction<any>;

mockGetDelete.mockReturnValue(sql);
mockMySqlQuery.mockResolvedValue({ status: true });

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

		await del.execute().then(() => {
			expect(getDelete).toHaveBeenCalledTimes(1);
			expect(getDelete).toHaveBeenCalledWith(tableName, [where1], {});
		});
	});

	test('sqlBuilder should be called once and with correct parameters if fieldsMap is specified', async () => {
		const tableName: string = 'users';
		const where1: WhereCondition = { field: 'name', operator: WhereOperator.Equal, value: null };
		const del: Delete = new Delete(config).from(tableName).conditions(where1);

		await del.execute(usersFieldsMap).then(() => {
			expect(mockGetDelete).toHaveBeenCalledTimes(1);
			expect(mockGetDelete).toHaveBeenCalledWith(tableName, [where1], usersFieldsMap);
		});
	});

	test('mysql should be called once and with correct parameters', async () => {
		const tableName: string = 'users';
		const del: Delete = new Delete(config).from(tableName).where('name', WhereOperator.Equal, null);

		await del.execute().then(() => {
			expect(mockMySqlQuery).toHaveBeenCalledTimes(1);
			expect(mockMySqlQuery).toHaveBeenCalledWith(config, sql);
		});
	});

	test('should return falsy status and error message result if error was thrown by mysql', async () => {
		const tableName: string = 'table';
		const errorMessage: string = 'Error message';
		const del: Delete = new Delete(config).from(tableName).where('name', WhereOperator.Equal, null);

		mockMySqlQuery.mockImplementationOnce(() => {
			throw new Error(errorMessage);
		});

		await del.execute(usersFieldsMap).then((result) => {
			expect(result.status).toBeFalsy();
			expect(result.rows).toBeUndefined();
			expect(result.items).toBeUndefined();
			expect(result.message).toEqual(errorMessage);
		});
	});
});
