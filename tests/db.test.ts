import db from '../src/db';
import { ConnectionData } from '../src/models/sql';
import { Update } from '../src/actions/update';
import { Select } from '../src/actions/select';
import { FieldsManager } from '../src/fieldsManager';
import { DbFieldsMap, DbStructure } from '../src/models/fields';

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
		const update = db(config, dbStructure).update();
		expect(update).toBeInstanceOf(Update);
		expect(update.___props().fieldsManager.___getDbStructure()).toEqual(dbStructure);
	});

	test('should create new instance of Update class without fieldsMap if not given as a parameter', () => {
		const update = db(config).update();
		expect(update).toBeInstanceOf(Update);
		expect(update.___props().fieldsMap).toBeUndefined();
	});
});

describe('select', () => {
	test('should create new instance of Select class with fieldsMap if given as a parameter', () => {
		const select = db(config, dbStructure).select();
		expect(select).toBeInstanceOf(Select);
		expect(select.___props().fieldsManager.___getDbStructure()).toEqual(dbStructure);
	});

	test('should create new instance of Select class without fieldsMap if not given as a parameter', () => {
		const select = db(config).select();
		expect(select).toBeInstanceOf(Select);
		expect(select.___props().fieldsMap).toBeUndefined();
	});
});
