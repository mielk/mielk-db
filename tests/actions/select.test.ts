import { ConnectionData, WhereCondition, WhereOperator, RequestType, OrderRule } from '../../src/models/sql';
import { DbRecordSet } from '../../src/models/records';
import { DbFieldsMap, DbStructure } from '../../src/models/fields';
import { Select } from '../../src/actions/select';
import mysql from '../../src/mysql';
import sqlBuilder from '../../src/sqlBuilder';

const config: ConnectionData = {
	host: '',
	database: '',
	user: '',
	password: '',
};

const itemsFieldsMap: DbFieldsMap = { id: 'item_id', name: 'item_name' };
const usersFieldsMap: DbFieldsMap = { id: 'user_id', name: 'user_name', isActive: 'is_active' };
const dbStructure: DbStructure = {
	items: {
		tableName: 'items',
		key: 'id',
		fieldsMap: itemsFieldsMap,
	},
	users: {
		tableName: 'users',
		key: 'id',
		fieldsMap: usersFieldsMap,
	},
};

const sql: string = 'SELECT';
const sqlError: string = '!';
const errorTable: string = '!';
const errorMessage: string = 'Error message';

const originalRecordset = [
	{ user_id: 1, user_name: 'Adam' },
	{ user_id: 2, user_name: 'Bartek' },
];

const convertedRecordset = [
	{ id: 1, name: 'Adam' },
	{ id: 2, name: 'Bartek' },
];

const fieldsManagerMock = {
	___getDbStructure: jest.fn().mockReturnValue(dbStructure),
	getFieldsMap: jest.fn((name: string) => usersFieldsMap),
	getFieldName: jest.fn((name: string, property: string) => {
		if (property === 'user_id') return 'id';
		if (property === 'user_name') return 'name';
		return 'field';
	}),
	convertRecordset: jest.fn((name: string, recordset: DbRecordSet) => convertedRecordset),
};

jest.mock('../../src/factories/FieldsManagerFactory', () => ({
	create: jest.fn().mockImplementation(() => fieldsManagerMock),
}));

jest.mock('../../src/sqlBuilder', () => ({
	getSelect: jest
		.fn()
		.mockImplementation(
			(
				select: string[] = [],
				from: string,
				where: WhereCondition[] = [],
				order: OrderRule[] = [],
				fieldsMap: { [key: string]: string } = {}
			) => (from === errorTable ? sqlError : sql)
		),
}));

jest.mock('../../src/mysql', () => ({
	query: jest.fn().mockImplementation((config: ConnectionData, sql: string) => {
		if (sql === sqlError) {
			throw new Error(errorMessage);
		} else {
			return { status: true, rows: 2, items: originalRecordset };
		}
	}),
}));

describe('constructor', () => {
	test('should create new instance of Select class with fieldsManager if dbStructure is given as a parameter', () => {
		const select = new Select(config, dbStructure);
		expect(select).toBeInstanceOf(Select);
		expect(select.___props().fieldsManager.___getDbStructure()).toEqual(dbStructure);
	});

	test('should create new instance of Select class without fieldsManager if not given as a parameter', () => {
		const update = new Select(config);
		expect(update).toBeInstanceOf(Select);
		``;
		expect(update.___props().fieldsManager).toBeUndefined();
	});
});

describe('from', () => {
	test('should assign new value to [_from] parameter', () => {
		const tableName = 'users';
		const select = new Select(config).from(tableName);
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

		const select = new Select(config).conditions(where1, where2);

		const where = select.___props().where;
		expect(where.length).toEqual(2);
		expect(where[0]).toEqual(where1);
		expect(where[1]).toEqual(where2);
	});

	test('should append conditions to [_where] array if conditions objects are given as an array', () => {
		const where1: WhereCondition = { field: 'name', operator: WhereOperator.Equal, value: 'John' };
		const where2: WhereCondition = { field: 'age', operator: WhereOperator.Equal, value: null };

		const select = new Select(config).conditions([where1, where2]);

		const where = select.___props().where;
		expect(where.length).toEqual(2);
		expect(where[0]).toEqual(where1);
		expect(where[1]).toEqual(where2);
	});
});

describe('fields', () => {
	test('should append single field properly', () => {
		const select = new Select(config).fields('name');
		const fields = select.___props().fields;
		expect(fields).toEqual(['name']);
	});

	test('should append single field inoriginal casing', () => {
		const select = new Select(config).fields('isActive');
		const fields = select.___props().fields;
		expect(fields).toEqual(['isActive']);
	});

	test('should add field name without redundant spaces', () => {
		const select = new Select(config).fields('  name  ');
		const fields = select.___props().fields;
		expect(fields).toEqual(['name']);
	});

	test('should skip adding field is such a field is already added', () => {
		const select = new Select(config).fields('name').fields('name');
		const fields = select.___props().fields;
		expect(fields).toEqual(['name']);
	});

	test('should skip adding field is such a field after trimming is already added', () => {
		const select = new Select(config).fields('name').fields('name  ');
		const fields = select.___props().fields;
		expect(fields).toEqual(['name']);
	});

	test('should skip adding field is such a field is already added but with different casing', () => {
		const select = new Select(config).fields('name').fields('Name');
		const fields = select.___props().fields;
		expect(fields).toEqual(['name']);
	});

	test('should ignore if no field is specified as an input parameter', () => {
		const select = new Select(config).fields('  ');
		const fields = select.___props().fields;
		expect(fields).toEqual([]);
	});

	test('should correctly add fields if more fields is passed', () => {
		const select = new Select(config).fields('name', 'id');
		const fields = select.___props().fields;
		expect(fields).toEqual(['name', 'id']);
	});

	test('should correctly add fields if an array of fields is passed', () => {
		const select = new Select(config).fields(['name', 'id']);
		const fields = select.___props().fields;
		expect(fields).toEqual(['name', 'id']);
	});

	test('should correctly add fields if more arrays of fields is passed', () => {
		const select = new Select(config).fields(['name', 'id']).fields(['date']).fields(['value', 'uuid']);
		const fields = select.___props().fields;
		expect(fields).toEqual(['name', 'id', 'date', 'value', 'uuid']);
	});

	test('should correctly add fields if both arrays and strings are passed', () => {
		const select = new Select(config).fields(['name', 'id'], 'value');
		const fields = select.___props().fields;
		expect(fields).toEqual(['name', 'id', 'value']);
	});

	test('should correctly add fields if an array contains repetitive values', () => {
		const select = new Select(config).fields(['value']).fields(['name', '  value', 'id', 'name']);
		const fields = select.___props().fields;
		expect(fields).toEqual(['value', 'name', 'id']);
	});
});

describe('order', () => {
	test('should append new order to [_order] array if order objects are given', () => {
		const order1: OrderRule = { field: 'name', ascending: true };
		const order2: OrderRule = { field: 'age', ascending: false };

		const select = new Select(config).order(order1, order2);

		const order = select.___props().order;
		expect(order.length).toEqual(2);
		expect(order[0]).toEqual(order1);
		expect(order[1]).toEqual(order2);
	});

	test('should append orders to [_order] array if order objects are given as an array', () => {
		const order1: OrderRule = { field: 'name', ascending: true };
		const order2: OrderRule = { field: 'age', ascending: false };

		const select = new Select(config).order([order1, order2]);

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
		const id = 5;
		await expect(new Select(config).execute()).rejects.toThrow(
			'SELECT cannot be executed if [tableName] has not been set'
		);
	});

	test('sqlBuilder should be called once and with correct parameters if no dbStructure specified', async () => {
		const tableName: string = 'users';
		const wheres: WhereCondition[] = [
			{ field: 'name', operator: WhereOperator.Equal, value: 'John' },
			{ field: 'age', operator: WhereOperator.Equal, value: null },
		];
		const order: OrderRule[] = [{ field: 'name', ascending: true }];

		const select = new Select(config).from(tableName).conditions(wheres).order(order);
		const props = select.___props();
		const result = await select.execute();

		expect(sqlBuilder.getSelect).toHaveBeenCalledTimes(1);
		expect(sqlBuilder.getSelect).toHaveBeenCalledWith(props.fields, tableName, props.where, props.order, {});
	});

	test('sqlBuilder should be called once and with correct parameters if dbStructure is specified', async () => {
		const tableName: string = 'users';
		const wheres: WhereCondition[] = [
			{ field: 'name', operator: WhereOperator.Equal, value: 'John' },
			{ field: 'age', operator: WhereOperator.Equal, value: null },
		];
		const order: OrderRule[] = [{ field: 'name', ascending: true }];

		const select = new Select(config, dbStructure).from(tableName).conditions(wheres).order(order);
		const props = select.___props();
		const result = await select.execute();

		expect(sqlBuilder.getSelect).toHaveBeenCalledTimes(1);
		expect(sqlBuilder.getSelect).toHaveBeenCalledWith(props.fields, tableName, props.where, props.order, usersFieldsMap);
	});

	test('mysql should be called once and with correct parameters', async () => {
		const tableName: string = 'users';
		const select = new Select(config).from(tableName);
		const result = await select.execute();

		expect(mysql.query).toHaveBeenCalledTimes(1);
		expect(mysql.query).toHaveBeenCalledWith(config, sql);
	});

	test('if fieldsManager is specified it should be invoked on the query result', async () => {
		const tableName: string = 'users';
		const select = new Select(config, dbStructure).from(tableName);
		const result = await select.execute();

		expect(fieldsManagerMock.convertRecordset).toHaveBeenCalledTimes(1);
		expect(fieldsManagerMock.convertRecordset).toHaveBeenCalledWith(tableName, originalRecordset);
	});

	test('should return correct result if fieldsManager is specified', async () => {
		const tableName: string = 'users';
		const select = new Select(config, dbStructure).from(tableName);
		const result = await select.execute();

		expect(result.status).toBeTruthy();
		expect(result.rows).toEqual(2);
		expect(result.items).toEqual(convertedRecordset);
	});

	test('should return correct result if fieldsManager is not specified', async () => {
		const tableName: string = 'users';
		const select = new Select(config).from(tableName);
		const result = await select.execute();

		expect(result.status).toBeTruthy();
		expect(result.rows).toEqual(2);
		expect(result.items).toEqual(originalRecordset);
	});

	test('should return correct result if fieldsManager is not specified', async () => {
		const tableName: string = 'users';
		const select = new Select(config).from(tableName);
		const result = await select.execute();

		expect(result.status).toBeTruthy();
		expect(result.rows).toEqual(2);
		expect(result.items).toEqual(originalRecordset);
		expect(result.message).toBeUndefined();
	});

	test('should return falsy status and error message result if error was thrown by mysql', async () => {
		const tableName: string = errorTable;
		const select = new Select(config).from(tableName);
		const result = await select.execute();

		expect(result.status).toBeFalsy();
		expect(result.rows).toBeUndefined();
		expect(result.items).toBeUndefined();
		expect(result.message).toEqual(errorMessage);
	});
});
