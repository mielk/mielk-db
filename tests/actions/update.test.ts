import { variables } from 'mielk-fn';
import { ConnectionData, WhereCondition, WhereOperator, RequestType } from '../../src/models/sql';
import { FieldsManager } from '../../src/fieldsManager';
import { Update } from '../../src/actions/update';
import mysql from '../../src/mysql';
import sqlBuilder from '../../src/sqlBuilder';
import utils from '../../src/utils';
import { DbRecordSet, MultiRecordSet } from '../../src/models/records';

const host: string = 'localhost'; // Replace with the server address
const database: string = 'mydatabase'; // Replace with the database name
const username: string = 'myusername'; // Replace with the username
const password: string = 'mypassword'; // Replace with the password

const config: ConnectionData = {
	host: host,
	database: database,
	user: username,
	password: password,
};

const sqlWithId = 'UPDATE users SET is_active = 1 WHERE id = 1';
const sqlWithoutId = "UPDATE users SET is_active = 1 WHERE name = 'John' AND age > 40";
const fieldsMap = { id: 'user_id', name: 'user_name' };
const convertedRecordset = [
	{ id: 1, name: 'Adam' },
	{ id: 2, name: 'Bartek' },
];
const convertedMultiRecordset = {
	users: [
		{ id: 1, name: 'Adam' },
		{ id: 2, name: 'Bartek' },
	],
	items: [
		{ id: 1, name: 'Laptop' },
		{ id: 2, name: 'Moniyot' },
	],
};

jest.mock('../../src/sqlBuilder', () => ({
	getUpdate: jest
		.fn()
		.mockImplementation(
			(
				table: string,
				object: { [key: string]: string | number | boolean | null },
				idOrWhere: string | number | WhereCondition[],
				fieldsMap: { [key: string]: string } = {}
			) => {
				if (variables.isStringOrNumber(idOrWhere)) {
					return sqlWithId;
				} else {
					return sqlWithoutId;
				}
			}
		),
}));

jest.mock('../../src/mysql', () => ({
	query: jest.fn().mockImplementation((config: ConnectionData, sql: string) => {
		const requestType = utils.getRequestTypeFromSql(sql);
		const errorJson = sql.startsWith('!');
		switch (requestType) {
			case RequestType.Select:
				return errorJson ? { status: 0, message: 'Error' } : { status: 1, rows: 5, id: 0, items: ['a', 'b', 'c'] };
			case RequestType.Update:
				return errorJson ? { status: 0, message: 'Error' } : { status: 1, rows: 3, id: 0, items: ['d', 'e', 'f'] };
			case RequestType.Insert:
				return errorJson ? { status: 0, message: 'Error' } : { status: 1, rows: 1, id: 4, items: [{}] };
			case RequestType.Delete:
				return errorJson ? { status: 0, message: 'Error' } : { status: 1, rows: 3, id: 0, items: [] };
			default:
				return errorJson ? { status: 0, message: 'Error' } : {};
		}
	}),
}));

const fieldsManagerMock = {
	getPropertyToDbFieldMap: jest.fn((tableName: string) => fieldsMap),
	convertMultiRecordset: jest.fn((multiRs: MultiRecordSet) => convertedMultiRecordset),
	convertRecordset: jest.fn((tableName: string, recordset: DbRecordSet) => convertedRecordset),
};

describe('constructor', () => {
	test('should create new instance of Update class with fieldsManager if given as a parameter', () => {
		const fieldsManager = new FieldsManager();
		const update = new Update(config, fieldsManager);
		expect(update).toBeInstanceOf(Update);
		expect(update.___props().fieldsManager).toEqual(fieldsManager);
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

describe('whereId', () => {
	test('should assign new value to [_id] parameter if a string value is passed', () => {
		const id = 'a';
		const update = new Update(config).whereId(id);
		expect(update.___props().id).toEqual(id);
	});

	test('should assign new value to [_id] parameter if a numeric value is passed', () => {
		const id = 5;
		const update = new Update(config).whereId(id);
		expect(update.___props().id).toEqual(id);
	});

	test('should throw an error if the given value is 0', () => {
		expect(() => {
			new Update(config).whereId(0);
		}).toThrow('Id must be greater than 0');
	});

	test('should throw an error if the given value is an empty string', () => {
		expect(() => {
			new Update(config).whereId('');
		}).toThrow('Id cannot be empty string');
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
		await expect(new Update(config).object(object).whereId(id).execute()).rejects.toThrow(
			'UPDATE cannot be executed if [tableName] has not been set'
		);
	});

	test('should throw an error if invoked without object', async () => {
		const tableName = 'users';
		const id = 5;
		await expect(new Update(config).from(tableName).whereId(id).execute()).rejects.toThrow(
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

	test('should work correctly if fieldsManager is not set', async () => {
		const tableName = 'users';
		const object = { name: 'John', surname: 'Smith' };
		const id = 5;
		const result = await new Update(config)
			.from(tableName)
			.object(object)
			.where('name', WhereOperator.Equal, null)
			.whereId(id)
			.execute();
		expect(result).toBeDefined();

		expect(sqlBuilder.getUpdate).toHaveBeenCalledTimes(1);
		expect(sqlBuilder.getUpdate).toHaveBeenCalledWith(tableName, object, 5, {});

		expect(mysql.query).toHaveBeenCalledTimes(1);
		expect(mysql.query).toHaveBeenCalledWith(config, sqlWithId);
	});

	test('should invoke query with proper sql if fieldsManager is set', async () => {
		const tableName = 'users';
		const object = { name: 'John', surname: 'Smith' };
		const id = 5;
		const result = await new Update(config, fieldsManagerMock)
			.from(tableName)
			.object(object)
			.where('name', WhereOperator.Equal, null)
			.whereId(id)
			.execute();
		expect(result).toBeDefined();

		expect(sqlBuilder.getUpdate).toHaveBeenCalledTimes(1);
		expect(sqlBuilder.getUpdate).toHaveBeenCalledWith(tableName, object, 5, fieldsMap);

		expect(mysql.query).toHaveBeenCalledTimes(1);
		expect(mysql.query).toHaveBeenCalledWith(config, sqlWithId);
	});

	test('should invoke query with proper sql if id is not set', async () => {
		const tableName = 'users';
		const object = { name: 'John', surname: 'Smith' };
		const result = await new Update(config, fieldsManagerMock)
			.from(tableName)
			.object(object)
			.where('name', WhereOperator.Equal, null)
			.where('age', WhereOperator.Equal, null)
			.execute();

		expect(result).toBeDefined();

		expect(sqlBuilder.getUpdate).toHaveBeenCalledTimes(1);
		expect(sqlBuilder.getUpdate).toHaveBeenCalledWith(
			tableName,
			object,
			[
				{ field: 'name', operator: WhereOperator.Equal, value: null },
				{ field: 'age', operator: WhereOperator.Equal, value: null },
			],
			fieldsMap
		);

		expect(mysql.query).toHaveBeenCalledTimes(1);
		expect(mysql.query).toHaveBeenCalledWith(config, sqlWithoutId);
	});

	test('should invoke query with proper sql if fieldsManager is set', async () => {
		const tableName = 'users';
		const object = { name: 'John', surname: 'Smith' };
		const id = 5;
		const result = await new Update(config, fieldsManagerMock)
			.from(tableName)
			.object(object)
			.where('name', WhereOperator.Equal, null)
			.whereId(id)
			.execute();
		expect(result).toBeDefined();

		expect(sqlBuilder.getUpdate).toHaveBeenCalledTimes(1);
		expect(sqlBuilder.getUpdate).toHaveBeenCalledWith(tableName, object, 5, fieldsMap);

		expect(mysql.query).toHaveBeenCalledTimes(1);
		expect(mysql.query).toHaveBeenCalledWith(config, sqlWithId);
	});
});
