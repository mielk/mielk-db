import { ConnectionData, WhereCondition, WhereOperator, RequestType } from '../../src/models/sql';
import { TableFieldsMap, DbStructure } from '../../src/models/fields';
import { Update } from '../../src/actions/update';
import { query } from '../../src/mysql';
import { getUpdate } from '../../src/sqlBuilder';

const config: ConnectionData = {
	host: 'host',
	database: 'database',
	user: 'user',
	password: 'password',
};

const itemsFieldsMap: TableFieldsMap = { id: 'item_id', name: 'item_name' };
const usersTable: string = 'users';
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

const sql: string = 'UPDATE';

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
jest.mock('../../src/sqlBuilder', () => ({ getUpdate: jest.fn() }));
jest.mock('../../src/mysql', () => ({ query: jest.fn(() => ({ status: true, rows: 2, items: originalRecordset })) }));

const mockGetUpdate: jest.MockedFunction<any> = getUpdate as jest.MockedFunction<any>;
const mockMySqlQuery: jest.MockedFunction<any> = query as jest.MockedFunction<any>;

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
		await update.execute().then(() => {
			const props = update.___props();
			expect(getUpdate).toHaveBeenCalledTimes(1);
			expect(getUpdate).toHaveBeenCalledWith(usersTable, props.object, props.where, {});
		});
	});

	test('sqlBuilder should be called once and with correct parameters if fieldsMap is specified', async () => {
		const object = { name: 'John', surname: 'Smith' };

		const update: Update = new Update(config).from(usersTable).object(object).where('name', WhereOperator.Equal, null);

		await update.execute(usersFieldsMap).then(() => {
			const props = update.___props();
			expect(getUpdate).toHaveBeenCalledTimes(1);
			expect(getUpdate).toHaveBeenCalledWith(usersTable, props.object, props.where, usersFieldsMap);
		});
	});

	test('mysql should be called once and with correct parameters', async () => {
		const object = { name: 'John', surname: 'Smith' };
		const update: Update = new Update(config).from(usersTable).object(object).where('name', WhereOperator.Equal, null);

		mockGetUpdate.mockReturnValue(sql);

		await update.execute().then(() => {
			expect(query).toHaveBeenCalledTimes(1);
			expect(query).toHaveBeenCalledWith(config, sql);
		});
	});

	test('if fieldsMap is specified, FieldsMapper should be invoked on the query result', async () => {
		const object = { name: 'John', surname: 'Smith' };
		const update: Update = new Update(config).from(usersTable).object(object).where('name', WhereOperator.Equal, null);

		await update.execute(usersFieldsMap).then(() => {
			expect(mockFieldsMapper.convertRecordset).toHaveBeenCalledTimes(1);
			expect(mockFieldsMapper.convertRecordset).toHaveBeenCalledWith(originalRecordset, usersFieldsMap);
		});
	});

	test('if fieldsMap is not specified, FieldsMapper should not be invoked on the query result', async () => {
		const object = { name: 'John', surname: 'Smith' };
		const update: Update = new Update(config).from(usersTable).object(object).where('name', WhereOperator.Equal, null);

		await update.execute().then(() => {
			expect(mockFieldsMapper.convertRecordset).toHaveBeenCalledTimes(0);
		});
	});

	test('should return correct result if fieldsMap is specified', async () => {
		const object = { name: 'John', surname: 'Smith' };

		const update: Update = new Update(config).from(usersTable).object(object).where('name', WhereOperator.Equal, null);

		await update.execute(usersFieldsMap).then((result) => {
			expect(result.status).toBeTruthy();
			expect(result.rows).toEqual(2);
			expect(result.items).toEqual(convertedRecordset);
		});
	});

	test('should return correct result if fieldsMap is not specified', async () => {
		const object = { name: 'John', surname: 'Smith' };

		const update: Update = new Update(config).from(usersTable).object(object).where('name', WhereOperator.Equal, null);

		await update.execute().then((result) => {
			expect(result.status).toBeTruthy();
			expect(result.rows).toEqual(2);
			expect(result.items).toEqual(originalRecordset);
			expect(result.message).toBeUndefined();
		});
	});

	test('should return falsy status and error message result if error was thrown by mysql', async () => {
		const errorMessage: string = 'Error message';
		const object = { name: 'John', surname: 'Smith' };
		const update: Update = new Update(config).from('table').object(object).where('name', WhereOperator.Equal, null);

		mockMySqlQuery.mockImplementation(() => {
			throw new Error(errorMessage);
		});

		await update.execute().then((result) => {
			expect(result.status).toBeFalsy();
			expect(result.rows).toBeUndefined();
			expect(result.items).toBeUndefined();
			expect(result.message).toEqual(errorMessage);
		});
	});
});
