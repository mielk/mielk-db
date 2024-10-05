import Db from '../src/db';
import { ConnectionData } from '../src/models/sql';
import { Update } from '../src/actions/update';
import { Select } from '../src/actions/select';
import { Delete } from '../src/actions/delete';
import { Insert } from '../src/actions/insert';
import { DbFieldsMap, DbStructure } from '../src/models/fields';

const config: ConnectionData = {
	host: 'host',
	database: 'database',
	user: 'username',
	password: 'password',
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

describe('update', () => {
	test('should create new instance of Update class with fieldsManager if dbStructure is given as a parameter', () => {
		const update: Update = new Db(config, dbStructure).update();
		expect(update).toBeInstanceOf(Update);
		expect(update.___props().fieldsManager.___getDbStructure()).toEqual(dbStructure);
	});

	test('should create new instance of Update class without fieldsMap if not given as a parameter', () => {
		const update: Update = new Db(config).update();
		expect(update).toBeInstanceOf(Update);
		expect(update.___props().fieldsMap).toBeUndefined();
	});
});

describe('select', () => {
	test('should create new instance of Select class with fieldsMap if given as a parameter', () => {
		const select: Select = new Db(config, dbStructure).select();
		expect(select).toBeInstanceOf(Select);
		expect(select.___props().fieldsManager.___getDbStructure()).toEqual(dbStructure);
	});

	test('should create new instance of Select class without fieldsMap if not given as a parameter', () => {
		const select: Select = new Db(config).select();
		expect(select).toBeInstanceOf(Select);
		expect(select.___props().fieldsMap).toBeUndefined();
	});
});

describe('delete', () => {
	test('should create new instance of Delete class with fieldsMap if given as a parameter', () => {
		const del: Delete = new Db(config, dbStructure).delete();
		expect(del).toBeInstanceOf(Delete);
		expect(del.___props().fieldsManager.___getDbStructure()).toEqual(dbStructure);
	});

	test('should create new instance of Delete class without fieldsMap if not given as a parameter', () => {
		const del: Delete = new Db(config).delete();
		expect(del).toBeInstanceOf(Delete);
		expect(del.___props().fieldsMap).toBeUndefined();
	});
});

describe('insert', () => {
	test('should create new instance of Insert class with fieldsMap if given as a parameter', () => {
		const insert: Insert = new Db(config, dbStructure).insert();
		expect(insert).toBeInstanceOf(Insert);
		expect(insert.___props().fieldsManager.___getDbStructure()).toEqual(dbStructure);
	});

	test('should create new instance of Insert class without fieldsMap if not given as a parameter', () => {
		const insert: Insert = new Db(config).insert();
		expect(insert).toBeInstanceOf(Insert);
		expect(insert.___props().fieldsMap).toBeUndefined();
	});
});
