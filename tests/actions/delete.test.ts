import { ConnectionData, WhereCondition, WhereOperator, RequestType } from '../../src/models/sql';
import { ObjectOfPrimitives } from '../../src/models/common';
import { DbRecordSet } from '../../src/models/records';
import { DbFieldsMap, DbStructure } from '../../src/models/fields';
import { Delete } from '../../src/actions/delete';
import mysql from '../../src/mysql';
import sqlBuilder from '../../src/sqlBuilder';

const config: ConnectionData = {
	// host: '',
	// database: '',
	// user: '',
	// password: '',
	host: 'localhost',
	user: 'root',
	password: 'BQC_7XXzum_YQ46FuN',
	database: 'ling',
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

const sql: string = 'DELETE';
const sqlError: string = '!';
const errorTable: string = '!';
const errorMessage: string = 'Error message';

// const originalRecordset = [
// 	{ user_id: 1, user_name: 'Adam' },
// 	{ user_id: 2, user_name: 'Bartek' },
// ];

// const convertedRecordset = [
// 	{ id: 1, name: 'Adam' },
// 	{ id: 2, name: 'Bartek' },
// ];

const fieldsManagerMock = {
	___getDbStructure: jest.fn().mockReturnValue(dbStructure),
	getFieldsMap: jest.fn((name: string) => usersFieldsMap),
	getFieldName: jest.fn((name: string, property: string) => {
		if (property === 'user_id') return 'id';
		if (property === 'user_name') return 'name';
		return 'field';
	}),
};

jest.mock('../../src/factories/FieldsManagerFactory', () => ({
	create: jest.fn().mockImplementation(() => fieldsManagerMock),
}));

jest.mock('../../src/sqlBuilder', () => ({
	getDelete: jest
		.fn()
		.mockImplementation((table: string, where: WhereCondition[], fieldsMap: DbFieldsMap) =>
			table === errorTable ? sqlError : sql
		),
}));

jest.mock('../../src/mysql', () => ({
	query: jest.fn().mockImplementation((config: ConnectionData, sql: string) => {
		if (sql === sqlError) {
			throw new Error(errorMessage);
		} else {
			return { status: true };
		}
	}),
}));

describe('constructor', () => {
	test('should create new instance of Delete class with fieldsManager if dbStructure is given as a parameter', () => {
		const del = new Delete(config, dbStructure);
		expect(del).toBeInstanceOf(Delete);
		expect(del.___props().fieldsManager.___getDbStructure()).toEqual(dbStructure);
	});
	test('should create new instance of Delete class without fieldsManager if not given as a parameter', () => {
		const del = new Delete(config);
		expect(del).toBeInstanceOf(Delete);
		expect(del.___props().fieldsManager).toBeUndefined();
	});
});

describe('from', () => {
	test('should assign new value to [_from] parameter', () => {
		const tableName = 'users';
		const del = new Delete(config).from(tableName);
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

		const del = new Delete(config).conditions(where1, where2);

		const where = del.___props().where;
		expect(where.length).toEqual(2);
		expect(where[0]).toEqual(where1);
		expect(where[1]).toEqual(where2);
	});

	test('should append conditions to [_where] array if conditions objects are given as an array', () => {
		const where1: WhereCondition = { field: 'name', operator: WhereOperator.Equal, value: 'John' };
		const where2: WhereCondition = { field: 'age', operator: WhereOperator.Equal, value: null };

		const del = new Delete(config).conditions([where1, where2]);

		const where = del.___props().where;
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

	test('sqlBuilder should be called once and with correct parameters if no dbStructure specified', async () => {
		const tableName: string = 'users';
		const del = new Delete(config).from(tableName).where('name', WhereOperator.Equal, null);
		const result = await del.execute();
		const props = del.___props();

		expect(sqlBuilder.getDelete).toHaveBeenCalledTimes(1);
		expect(sqlBuilder.getDelete).toHaveBeenCalledWith(tableName, props.where, {});
	});

	test('sqlBuilder should be called once and with correct parameters if dbStructure is specified', async () => {
		const tableName: string = 'users';
		const del = new Delete(config, dbStructure).from(tableName).where('name', WhereOperator.Equal, null);
		const result = await del.execute();
		const props = del.___props();

		expect(sqlBuilder.getDelete).toHaveBeenCalledTimes(1);
		expect(sqlBuilder.getDelete).toHaveBeenCalledWith(tableName, props.where, usersFieldsMap);
	});

	test('mysql should be called once and with correct parameters', async () => {
		const tableName: string = 'users';
		const del = new Delete(config).from(tableName).where('name', WhereOperator.Equal, null);
		const result = await del.execute();

		expect(mysql.query).toHaveBeenCalledTimes(1);
		expect(mysql.query).toHaveBeenCalledWith(config, sql);
	});

	test('should return falsy status and error message result if error was thrown by mysql', async () => {
		const tableName: string = errorTable;
		const del = new Delete(config, dbStructure).from(tableName).where('name', WhereOperator.Equal, null);
		const result = await del.execute();

		expect(result.status).toBeFalsy();
		expect(result.rows).toBeUndefined();
		expect(result.items).toBeUndefined();
		expect(result.message).toEqual(errorMessage);
	});
});
