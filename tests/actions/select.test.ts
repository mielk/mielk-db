import { ConnectionData, WhereCondition, WhereOperator, RequestType, OrderRule } from '../../src/models/sql';
import { TableFieldsMap, DbStructure } from '../../src/models/fields';
import { Select } from '../../src/actions/select';
import { query } from '../../src/mysql';
import { getSelect } from '../../src/sqlBuilder';
import { MySqlResponse } from '../../src/models/responses';

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
jest.mock('../../src/mysql', () => ({ query: jest.fn(() => ({ status: true, rows: 2, items: originalRecordset })) }));

const mockGetSelect: jest.MockedFunction<any> = getSelect as jest.MockedFunction<any>;
const mockMySqlQuery: jest.MockedFunction<any> = query as jest.MockedFunction<any>;

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

	test('mysql should be called once and with correct parameters', async () => {
		const tableName: string = 'users';
		const select: Select = new Select(config).from(tableName);

		mockGetSelect.mockReturnValue(sql);
		await select.execute().then(() => {
			expect(mockMySqlQuery).toHaveBeenCalledTimes(1);
			expect(mockMySqlQuery).toHaveBeenCalledWith(config, sql);
		});
	});

	test('if fieldsMap is specified, FieldsMapper should be invoked on the query result', async () => {
		const tableName: string = 'users';
		const select: Select = new Select(config).from(tableName);

		await select.execute(usersFieldsMap).then(() => {
			expect(mockFieldsMapper.convertRecordset).toHaveBeenCalledTimes(1);
			expect(mockFieldsMapper.convertRecordset).toHaveBeenCalledWith(originalRecordset, usersFieldsMap);
		});
	});

	test('if fieldsMap is specified, FieldsMapper should not be invoked on the query result', async () => {
		const tableName: string = 'users';
		const select: Select = new Select(config).from(tableName);

		await select.execute().then(() => {
			expect(mockFieldsMapper.convertRecordset).toHaveBeenCalledTimes(0);
		});
	});

	test('should return correct result if fieldsMap is specified', async () => {
		const tableName: string = 'users';
		const select: Select = new Select(config).from(tableName);

		await select.execute(usersFieldsMap).then((response: MySqlResponse) => {
			expect(response.status).toBeTruthy();
			expect(response.rows).toEqual(2);
			expect(response.items).toEqual(convertedRecordset);
		});
	});

	test('should return correct result if fieldsMap is not specified', async () => {
		const tableName: string = 'users';
		const select: Select = new Select(config).from(tableName);

		await select.execute().then((response: MySqlResponse) => {
			expect(response.status).toBeTruthy();
			expect(response.rows).toEqual(2);
			expect(response.items).toEqual(originalRecordset);
			expect(response.message).toBeUndefined();
		});
	});

	test('should return falsy status and error message result if error was thrown by mysql', async () => {
		const errorMessage: string = 'Error message';
		const select: Select = new Select(config).from('table');

		mockMySqlQuery.mockImplementation(() => {
			throw new Error(errorMessage);
		});

		await select.execute().then((result) => {
			expect(result.status).toBeFalsy();
			expect(result.rows).toBeUndefined();
			expect(result.items).toBeUndefined();
			expect(result.message).toEqual(errorMessage);
		});
	});
});
