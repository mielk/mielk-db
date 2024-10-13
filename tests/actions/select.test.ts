import { ConnectionData, WhereCondition, WhereOperator, OrderRule } from '../../src/models/sql';
import { TableFieldsMap } from '../../src/models/fields';
import { Select } from '../../src/actions/select';
import { getSelect } from '../../src/sqlBuilder';
import { SqlProcessingError } from '../../src/errors/SqlProcessingError';
import { DbConnectionError } from '../../src/errors/DbConnectionError';
import { createConnection } from 'mysql2/promise';
import { MySqlSelectResponse } from '../../src/models/responses';

const config: ConnectionData = {
	host: 'host',
	database: 'database',
	user: 'user',
	password: 'password',
};

const usersTable: string = 'users';
const usersFieldsMap: TableFieldsMap = {
	id: 'user_id',
	name: 'user_name',
	isActive: 'is_active',
};

const sql: string = 'SELECT';

const originalRecordset = [
	{ user_id: 1, user_name: 'Adam' },
	{ user_id: 2, user_name: 'Bartek' },
];

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

jest.mock('../../src/sqlBuilder', () => ({ getSelect: jest.fn() }));
jest.mock('mysql2/promise', () => ({ createConnection: jest.fn() }));
const mockQuery: jest.MockedFunction<any> = jest.fn().mockResolvedValue([[{ id: 1 }], [{ id: 2 }]]);
const mockCreateConnection: jest.MockedFunction<any> = (createConnection as jest.MockedFunction<any>).mockResolvedValue({
	query: mockQuery,
});
const mockGetSelect: jest.MockedFunction<any> = getSelect as jest.MockedFunction<any>;
mockGetSelect.mockReturnValue(sql);

describe('constructor', () => {
	test('should create a new instance of Select class', () => {
		const select: Select = new Select(config);
		expect(select).toBeInstanceOf(Select);
	});
});

describe('from', () => {
	test('should assign new value to [_from] parameter', () => {
		const tableName = 'users';
		const select: Select = new Select(config).from(tableName);
		expect(select.___props().from).toEqual(tableName);
	});

	test('should throw an error if empty string is passed', () => {
		expect(() => {
			new Select(config).from(' ');
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

		const select: Select = new Select(config).where(fieldName1, operator1, value1).where(fieldName2, operator2, value2);

		const where: WhereCondition[] = select.___props().where;
		expect(where.length).toEqual(2);
		expect(where[0]).toEqual({ field: fieldName1, operator: operator1, value: value1 });
		expect(where[1]).toEqual({ field: fieldName2, operator: operator2, value: value2 });
	});
});

describe('conditions', () => {
	test('should append new condition to [_where] array if condition objects are given', () => {
		const where1: WhereCondition = { field: 'name', operator: WhereOperator.Equal, value: 'John' };
		const where2: WhereCondition = { field: 'age', operator: WhereOperator.Equal, value: null };

		const select: Select = new Select(config).conditions(where1, where2);

		const where = select.___props().where;
		expect(where.length).toEqual(2);
		expect(where[0]).toEqual(where1);
		expect(where[1]).toEqual(where2);
	});

	test('should append conditions to [_where] array if conditions objects are given as an array', () => {
		const where1: WhereCondition = { field: 'name', operator: WhereOperator.Equal, value: 'John' };
		const where2: WhereCondition = { field: 'age', operator: WhereOperator.Equal, value: null };

		const select: Select = new Select(config).conditions([where1, where2]);

		const where = select.___props().where;
		expect(where.length).toEqual(2);
		expect(where[0]).toEqual(where1);
		expect(where[1]).toEqual(where2);
	});
});

describe('fields', () => {
	test('should append single field properly', () => {
		const select: Select = new Select(config).fields('name');
		const fields = select.___props().fields;
		expect(fields).toEqual(['name']);
	});

	test('should append single field inoriginal casing', () => {
		const select: Select = new Select(config).fields('isActive');
		const fields = select.___props().fields;
		expect(fields).toEqual(['isActive']);
	});

	test('should add field name without redundant spaces', () => {
		const select: Select = new Select(config).fields('  name  ');
		const fields = select.___props().fields;
		expect(fields).toEqual(['name']);
	});

	test('should skip adding field is such a field is already added', () => {
		const select: Select = new Select(config).fields('name').fields('name');
		const fields = select.___props().fields;
		expect(fields).toEqual(['name']);
	});

	test('should skip adding field is such a field after trimming is already added', () => {
		const select: Select = new Select(config).fields('name').fields('name  ');
		const fields = select.___props().fields;
		expect(fields).toEqual(['name']);
	});

	test('should skip adding field is such a field is already added but with different casing', () => {
		const select: Select = new Select(config).fields('name').fields('Name');
		const fields = select.___props().fields;
		expect(fields).toEqual(['name']);
	});

	test('should ignore if no field is specified as an input parameter', () => {
		const select: Select = new Select(config).fields('  ');
		const fields = select.___props().fields;
		expect(fields).toEqual([]);
	});

	test('should correctly add fields if more fields is passed', () => {
		const select: Select = new Select(config).fields('name', 'id');
		const fields = select.___props().fields;
		expect(fields).toEqual(['name', 'id']);
	});

	test('should correctly add fields if an array of fields is passed', () => {
		const select: Select = new Select(config).fields(['name', 'id']);
		const fields = select.___props().fields;
		expect(fields).toEqual(['name', 'id']);
	});

	test('should correctly add fields if more arrays of fields is passed', () => {
		const select: Select = new Select(config).fields(['name', 'id']).fields(['date']).fields(['value', 'uuid']);
		const fields = select.___props().fields;
		expect(fields).toEqual(['name', 'id', 'date', 'value', 'uuid']);
	});

	test('should correctly add fields if both arrays and strings are passed', () => {
		const select: Select = new Select(config).fields(['name', 'id'], 'value');
		const fields = select.___props().fields;
		expect(fields).toEqual(['name', 'id', 'value']);
	});

	test('should correctly add fields if an array contains repetitive values', () => {
		const select: Select = new Select(config).fields(['value']).fields(['name', '  value', 'id', 'name']);
		const fields = select.___props().fields;
		expect(fields).toEqual(['value', 'name', 'id']);
	});
});

describe('order', () => {
	test('should append new order to [_order] array if order objects are given', () => {
		const order1: OrderRule = { field: 'name', ascending: true };
		const order2: OrderRule = { field: 'age', ascending: false };

		const select: Select = new Select(config).order(order1, order2);

		const order = select.___props().order;
		expect(order.length).toEqual(2);
		expect(order[0]).toEqual(order1);
		expect(order[1]).toEqual(order2);
	});

	test('should append orders to [_order] array if order objects are given as an array', () => {
		const order1: OrderRule = { field: 'name', ascending: true };
		const order2: OrderRule = { field: 'age', ascending: false };

		const select: Select = new Select(config).order([order1, order2]);

		const order = select.___props().order;
		expect(order.length).toEqual(2);
		expect(order[0]).toEqual(order1);
		expect(order[1]).toEqual(order2);
	});
});

describe('execute', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	test('should throw an error if invoked without table name', async () => {
		const object = { name: 'John', surname: 'Smith' };
		const id: number = 5;
		await expect(new Select(config).execute()).rejects.toThrow(
			'SELECT cannot be executed if [tableName] has not been set'
		);
	});

	test('sqlBuilder should be called once and with correct parameters if fieldsMap is not specified', async () => {
		const wheres: WhereCondition[] = [
			{ field: 'name', operator: WhereOperator.Equal, value: 'John' },
			{ field: 'age', operator: WhereOperator.Equal, value: null },
		];
		const order: OrderRule[] = [{ field: 'name', ascending: true }];
		const select: Select = new Select(config).from(usersTable).conditions(wheres).order(order);
		const props = select.___props();

		await select.execute().then(() => {
			expect(mockGetSelect).toHaveBeenCalledTimes(1);
			expect(mockGetSelect).toHaveBeenCalledWith(props.fields, usersTable, props.where, props.order, {});
		});
	});

	test('sqlBuilder should be called once and with correct parameters if fieldsMap is specified', async () => {
		const tableName: string = 'users';
		const wheres: WhereCondition[] = [
			{ field: 'name', operator: WhereOperator.Equal, value: 'John' },
			{ field: 'age', operator: WhereOperator.Equal, value: null },
		];
		const order: OrderRule[] = [{ field: 'name', ascending: true }];
		const select: Select = new Select(config).from(tableName).conditions(wheres).order(order);
		const props = select.___props();

		await select.execute(usersFieldsMap).then(() => {
			expect(mockGetSelect).toHaveBeenCalledTimes(1);
			expect(mockGetSelect).toHaveBeenCalledWith(props.fields, tableName, props.where, props.order, usersFieldsMap);
		});
	});

	test('should throw an error if connection to the database failed', async () => {
		const message: string = 'err!!';
		const expectedMessage: string = `Error while trying to establish connection | ${message}`;
		const where1: WhereCondition = { field: 'name', operator: WhereOperator.Equal, value: null };

		mockCreateConnection.mockRejectedValueOnce(new Error(message));

		expect.assertions(2);

		await new Select(config)
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

		await new Select(config)
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

		mockQuery.mockResolvedValue([2, 3, [{ value: 123 }], []]);

		expect.assertions(2);

		await new Select(config)
			.from('users')
			.conditions(where1)
			.execute()
			.catch((err: unknown) => {
				expect((err as Error).message).toEqual(expectedMessage);
				expect(err instanceof SqlProcessingError).toBeTruthy();
			});
	});

	test('if fieldsMap is specified, FieldsMapper should be invoked on the query result', async () => {
		const tableName: string = 'users';
		const select: Select = new Select(config).from(tableName);

		mockQuery.mockResolvedValueOnce([originalRecordset, []]);

		await select.execute(usersFieldsMap).then(() => {
			expect(mockFieldsMapper.convertRecordset).toHaveBeenCalledTimes(1);
			expect(mockFieldsMapper.convertRecordset).toHaveBeenCalledWith(originalRecordset, usersFieldsMap);
		});
	});

	test('if fieldsMap is specified, FieldsMapper should not be invoked on the query result', async () => {
		const tableName: string = 'users';
		const select: Select = new Select(config).from(tableName);

		mockQuery.mockResolvedValueOnce([originalRecordset, []]);

		await select.execute().then(() => {
			expect(mockFieldsMapper.convertRecordset).toHaveBeenCalledTimes(0);
		});
	});

	test('should return correct result if fieldsMap is specified', async () => {
		const tableName: string = 'users';
		const select: Select = new Select(config).from(tableName);

		mockQuery.mockResolvedValueOnce([originalRecordset, [{ id: 1 }]]);

		await select.execute(usersFieldsMap).then((response: MySqlSelectResponse) => {
			expect(response.items).toEqual(convertedRecordset);
		});
	});

	test('should return correct result if fieldsMap is not specified', async () => {
		const tableName: string = 'users';
		const select: Select = new Select(config).from(tableName);

		mockQuery.mockResolvedValueOnce([originalRecordset, [{ id: 1 }]]);

		await select.execute().then((response: MySqlSelectResponse) => {
			expect(response.items).toEqual(originalRecordset);
		});
	});
});
