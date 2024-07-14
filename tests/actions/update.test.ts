import { variables } from 'mielk-fn';
import { ConnectionData, WhereCondition, WhereOperator, RequestType } from '../../src/models/sql';
import { DbRecordSet, MultiRecordSet } from '../../src/models/records';
import { DbField, DbFieldsMap, DbStructure } from '../../src/models/fields';
import { FieldsManager } from '../../src/fieldsManager';
import { Update } from '../../src/actions/update';
import FieldsManagerFactory from '../../src/factories/FieldsManagerFactory';
import mysql from '../../src/mysql';
import sqlBuilder from '../../src/sqlBuilder';
import utils from '../../src/utils';
import { ObjectOfPrimitives } from '../../src/models/common';

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
	convertRecordset: jest.fn((tableName: string, recordset: DbRecordSet) => convertedRecordset),
};

jest.mock('../../src/factories/FieldsManagerFactory', () => ({
	create: jest.fn().mockImplementation(() => fieldsManagerMock),
}));

jest.mock('../../src/sqlBuilder', () => ({
	getUpdate: jest
		.fn()
		.mockImplementation((table: string, object: ObjectOfPrimitives, where: WhereCondition[], fieldsMap: DbFieldsMap) =>
			table === errorTable ? sqlError : sql
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
	test('should create new instance of Update class with fieldsManager if dbStructure is given as a parameter', () => {
		const update = new Update(config, dbStructure);
		expect(update).toBeInstanceOf(Update);
		expect(update.___props().fieldsManager.___getDbStructure()).toEqual(dbStructure);
	});

	test('should create new instance of Update class without fieldsManager if not given as a parameter', () => {
		const update = new Update(config);
		expect(update).toBeInstanceOf(Update);
		expect(update.___props().fieldsManager).toBeUndefined();
	});
});

describe('from', () => {
	test('should assign new value to [_from] parameter', () => {
		const tableName = 'users';
		const update = new Update(config).from(tableName);
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
		const update = new Update(config).object(object);
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
		const fieldName1 = 'name';
		const operator1 = WhereOperator.Equal;
		const value1 = 'John';
		const fieldName2 = 'age';
		const operator2 = WhereOperator.Equal;
		const value2 = null;

		const update = new Update(config).where(fieldName1, operator1, value1).where(fieldName2, operator2, value2);

		const where = update.___props().where;
		expect(where.length).toEqual(2);
		expect(where[0]).toEqual({ field: fieldName1, operator: operator1, value: value1 });
		expect(where[1]).toEqual({ field: fieldName2, operator: operator2, value: value2 });
	});
});

describe('execute', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	test('should throw an error if invoked without table name', async () => {
		const object = { name: 'John', surname: 'Smith' };
		const id = 5;
		await expect(new Update(config).object(object).where('id', WhereOperator.Equal, id).execute()).rejects.toThrow(
			'UPDATE cannot be executed if [tableName] has not been set'
		);
	});

	test('should throw an error if invoked without object', async () => {
		const tableName = 'users';
		const id = 5;
		await expect(new Update(config).from(tableName).where('id', WhereOperator.Equal, id).execute()).rejects.toThrow(
			'UPDATE cannot be executed if [object] has not been set'
		);
	});

	test('should throw an error if neither id nor where is set', async () => {
		const tableName = 'users';
		const object = { name: 'John', surname: 'Smith' };
		await expect(new Update(config).from(tableName).object(object).execute()).rejects.toThrow(
			'UPDATE cannot be executed without any condition'
		);
	});

	test('sqlBuilder should be called once and with correct parameters if no dbStructure specified', async () => {
		const tableName = 'users';
		const object = { name: 'John', surname: 'Smith' };

		const update = new Update(config).from(tableName).object(object).where('name', WhereOperator.Equal, null);
		const result = await update.execute();
		const props = update.___props();

		expect(sqlBuilder.getUpdate).toHaveBeenCalledTimes(1);
		expect(sqlBuilder.getUpdate).toHaveBeenCalledWith(tableName, props.object, props.where, {});
	});

	// test('should work correctly if fieldsManager is not set', async () => {
	// 	const tableName = 'users';
	// 	const object = { name: 'John', surname: 'Smith' };
	// 	const id = 5;
	// 	const result = await new Update(config)
	// 		.from(tableName)
	// 		.object(object)
	// 		.where('name', WhereOperator.Equal, null)
	// 		.whereId(id)
	// 		.execute();
	// 	expect(result).toBeDefined();

	// 	expect(sqlBuilder.getUpdate).toHaveBeenCalledTimes(1);
	// 	expect(sqlBuilder.getUpdate).toHaveBeenCalledWith(tableName, object, 5, {});

	// 	expect(mysql.query).toHaveBeenCalledTimes(1);
	// 	expect(mysql.query).toHaveBeenCalledWith(config, sqlWithId);
	// });

	// test('should invoke query with proper sql if fieldsManager is set', async () => {
	// 	const tableName = 'users';
	// 	const object = { name: 'John', surname: 'Smith' };
	// 	const id = 5;
	// 	const result = await new Update(config, dbStructure)
	// 		.from(tableName)
	// 		.object(object)
	// 		.where('name', WhereOperator.Equal, null)
	// 		.whereId(id)
	// 		.execute();
	// 	expect(result).toBeDefined();

	// 	expect(sqlBuilder.getUpdate).toHaveBeenCalledTimes(1);
	// 	expect(sqlBuilder.getUpdate).toHaveBeenCalledWith(tableName, object, 5, usersFieldsMap);

	// 	expect(mysql.query).toHaveBeenCalledTimes(1);
	// 	expect(mysql.query).toHaveBeenCalledWith(config, sqlWithId);
	// });

	// test('should invoke query with proper sql if id is not set', async () => {
	// 	const tableName = 'users';
	// 	const object = { name: 'John', surname: 'Smith' };
	// 	const result = await new Update(config, dbStructure)
	// 		.from(tableName)
	// 		.object(object)
	// 		.where('name', WhereOperator.Equal, null)
	// 		.where('age', WhereOperator.Equal, null)
	// 		.execute();

	// 	expect(result).toBeDefined();

	// 	expect(sqlBuilder.getUpdate).toHaveBeenCalledTimes(1);
	// 	expect(sqlBuilder.getUpdate).toHaveBeenCalledWith(
	// 		tableName,
	// 		object,
	// 		[
	// 			{ field: 'name', operator: WhereOperator.Equal, value: null },
	// 			{ field: 'age', operator: WhereOperator.Equal, value: null },
	// 		],
	// 		usersFieldsMap
	// 	);

	// 	expect(mysql.query).toHaveBeenCalledTimes(1);
	// 	expect(mysql.query).toHaveBeenCalledWith(config, sqlWithoutId);
	// });

	// test('should invoke query with proper sql if fieldsManager is set', async () => {
	// 	const tableName = 'users';
	// 	const object = { name: 'John', surname: 'Smith' };
	// 	const id = 5;
	// 	const result = await new Update(config, dbStructure)
	// 		.from(tableName)
	// 		.object(object)
	// 		.where('name', WhereOperator.Equal, null)
	// 		.whereId(id)
	// 		.execute();
	// 	expect(result).toBeDefined();

	// 	expect(sqlBuilder.getUpdate).toHaveBeenCalledTimes(1);
	// 	expect(sqlBuilder.getUpdate).toHaveBeenCalledWith(tableName, object, 5, usersFieldsMap);

	// 	expect(mysql.query).toHaveBeenCalledTimes(1);
	// 	expect(mysql.query).toHaveBeenCalledWith(config, sqlWithId);
	// });
});
