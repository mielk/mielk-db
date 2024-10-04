import { ConnectionData } from '../../src/models/sql';
import { DbRecord } from '../../src/models/records';
import { DbFieldsMap, DbStructure } from '../../src/models/fields';
import { Insert } from '../../src/actions/insert';
import { query } from '../../src/mysql';
import { getInsert, getSelect } from '../../src/sqlBuilder';

const config: ConnectionData = {
	host: 'host',
	database: 'database',
	user: 'user',
	password: 'password',
};

const itemsFieldsMap: DbFieldsMap = { id: 'item_id', name: 'item_name' };
const usersFieldsMap: DbFieldsMap = { id: 'user_id', name: 'user_name', isActive: 'is_active' };
const structureItem = (tableName: string, fieldsMap: DbFieldsMap) => {
	return {
		tableName,
		key: 'id',
		fieldsMap,
	};
};
const dbStructure: DbStructure = {
	items: structureItem('items', itemsFieldsMap),
	users: structureItem('users', usersFieldsMap),
};

const sqlInsert: string = 'INSERT';
const sqlSelect: string = 'SELECT';
const object: DbRecord = { name: 'name', value: 5 };

/* MOCKS */

const mockFieldsManager = {
	___getDbStructure: jest.fn().mockReturnValue(dbStructure),
	getFieldsMap: jest.fn().mockReturnValue(usersFieldsMap),
	getFieldName: jest.fn((name: string, property: string) => {
		const map: Record<string, string> = { user_id: 'id', user_name: 'name' };
		return map[property] || 'field';
	}),
	convertRecordset: jest.fn(), //() => convertedRecordset),
};
jest.mock('../../src/factories/FieldsManagerFactory', () => ({
	create: jest.fn(() => mockFieldsManager),
}));
jest.mock('../../src/sqlBuilder', () => ({
	getSelect: jest.fn(),
	getInsert: jest.fn(),
}));
jest.mock('../../src/mysql', () => ({
	query: jest.fn(),
}));

const mockGetInsert: jest.MockedFunction<any> = getInsert as jest.MockedFunction<any>;
const mockGetSelect: jest.MockedFunction<any> = getSelect as jest.MockedFunction<any>;
const mockMySqlQuery: jest.MockedFunction<any> = query as jest.MockedFunction<any>;

mockGetSelect.mockReturnValue(sqlSelect);
mockGetInsert.mockReturnValue(sqlInsert);
mockMySqlQuery.mockResolvedValue({ rows: 1, items: [object], insertId: 100 });

describe('constructor', () => {
	test('should create new instance of Insert class with fieldsManager if dbStructure is given as a parameter', () => {
		const insert: Insert = new Insert(config, dbStructure);
		expect(insert).toBeInstanceOf(Insert);
		expect(insert.___props().fieldsManager.___getDbStructure()).toEqual(dbStructure);
	});

	test('should create new instance of Insert class without fieldsManager if not given as a parameter', () => {
		const insert: Insert = new Insert(config);
		expect(insert).toBeInstanceOf(Insert);
		expect(insert.___props().fieldsManager).toBeUndefined();
	});
});

describe('into', () => {
	test('should assign new value to [_into] parameter', () => {
		const tableName: string = 'users';
		const insert: Insert = new Insert(config).into(tableName);
		expect(insert.___props().into).toEqual(tableName);
	});

	test('should throw an error if empty string is passed', () => {
		expect(() => {
			new Insert(config).into(' ');
		}).toThrow('Table name cannot be empty');
	});
});

describe('object', () => {
	test('should assign new value to [_object] parameter', () => {
		const insert: Insert = new Insert(config).object(object);
		expect(insert.___props().object).toEqual(object);
	});

	test('should throw an error if the given object is empty', () => {
		expect(() => {
			new Insert(config).object({});
		}).toThrow('Object cannot be empty');
	});
});

describe('execute', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	test('should throw an error if invoked without table name', async () => {
		await expect(new Insert(config).object(object).execute()).rejects.toThrow(
			'INSERT cannot be executed if [tableName] has not been set'
		);
	});

	test('should throw an error if invoked without object', async () => {
		const tableName: string = 'users';
		await expect(new Insert(config).into(tableName).execute()).rejects.toThrow(
			'INSERT cannot be executed if [object] has not been set'
		);
	});

	test('sqlBuilder should be called once and with correct parameters if no dbStructure specified', async () => {
		const tableName: string = 'users';
		const insert: Insert = new Insert(config).into(tableName).object(object);
		const props = insert.___props();

		await insert.execute().then(() => {
			expect(getInsert).toHaveBeenCalledTimes(1);
			expect(getInsert).toHaveBeenCalledWith(tableName, props.object, {});
		});
	});

	test('sqlBuilder should be called once and with correct parameters if dbStructure is specified', async () => {
		const tableName: string = 'users';
		const insert: Insert = new Insert(config, dbStructure).into(tableName).object(object);
		const props: Record<string, any> = insert.___props();

		await insert.execute().then(() => {
			expect(getInsert).toHaveBeenCalledTimes(1);
			expect(getInsert).toHaveBeenCalledWith(tableName, props.object, usersFieldsMap);
		});
	});

	test('mysql should be called twice if INSERT was successful', async () => {
		const insert: Insert = new Insert(config).into('users').object({ name: '' });
		await insert.execute().then(() => {
			expect(query).toHaveBeenCalledTimes(2);
			expect(query).toHaveBeenCalledWith(config, sqlInsert);
			expect(query).toHaveBeenCalledWith(config, sqlSelect);
		});
	});

	test('if fieldsManager is specified it should be invoked on the query result', async () => {
		const tableName: string = 'users';
		const response: DbRecord = { user_id: 100, user_name: 'John' };
		const insert: Insert = new Insert(config, dbStructure).into(tableName).object({ name: 'user' });

		mockMySqlQuery.mockResolvedValueOnce({ insertId: 1 });
		mockMySqlQuery.mockResolvedValueOnce({ items: [response] });

		await insert.execute().then(() => {
			expect(mockFieldsManager.convertRecordset).toHaveBeenCalledTimes(1);
			expect(mockFieldsManager.convertRecordset).toHaveBeenCalledWith(tableName, [response]);
		});
	});

	test('should return correct result if fieldsManager is specified', async () => {
		const tableName: string = 'users';
		const insert: Insert = new Insert(config, dbStructure).into(tableName).object(object);
		const returned: [DbRecord] = [{ id: 1, name: 'A' }];

		mockFieldsManager.convertRecordset.mockReturnValue(returned);

		await insert.execute().then((result) => {
			expect(result.status).toBeTruthy();
			expect(result.items).toEqual(returned);
		});
	});

	test('should return correct result if fieldsManager is not specified', async () => {
		const tableName: string = 'users';
		const insert: Insert = new Insert(config).into(tableName).object(object);

		await insert.execute().then((result) => {
			expect(result.status).toBeTruthy();
			expect(result.items).toEqual([object]);
		});
	});

	test('should return falsy status and error message result if INSERT was unsuccessful', async () => {
		const tableName: string = 'users';
		const errorMessage: string = 'Error message';
		const insert: Insert = new Insert(config).into(tableName).object(object);

		mockMySqlQuery.mockImplementationOnce(() => {
			throw new Error(errorMessage);
		});

		await insert.execute().then((result) => {
			expect(result.status).toBeFalsy();
			expect(result.rows).toBeUndefined();
			expect(result.items).toBeUndefined();
			expect(result.message).toEqual(errorMessage);
		});
	});

	test('mysql should be called once if INSERT was unsuccessful', async () => {
		const tableName: string = 'users';
		const errorMessage: string = 'Error message';
		const insert: Insert = new Insert(config).into(tableName).object(object);

		mockMySqlQuery.mockImplementationOnce(() => {
			throw new Error(errorMessage);
		});

		await insert.execute().then(() => {
			expect(query).toHaveBeenCalledTimes(1);
			expect(query).toHaveBeenCalledWith(config, sqlInsert);
		});
	});

	test('should return falsy status and error message result if post-insert SELECT was unsuccessful', async () => {
		const tableName: string = 'users';
		const errorMessage: string = 'Error message';
		const insert: Insert = new Insert(config).into(tableName).object(object);

		mockMySqlQuery.mockImplementationOnce(() => ({ rows: 1, items: [object], insertId: 100 }));
		mockMySqlQuery.mockImplementationOnce(() => {
			throw new Error(errorMessage);
		});

		await insert.execute().then((result) => {
			expect(result.status).toBeFalsy();
			expect(result.rows).toBeUndefined();
			expect(result.items).toBeUndefined();
			expect(result.message).toEqual(errorMessage);
		});
	});
});
