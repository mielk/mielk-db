import { FieldsManager } from '../src/fieldsManager';
import { DbFieldsMap, DbStructure, DbTable } from '../src/models/fields';
import { DbRecordSet, MultiRecordSet } from '../src/models/records';

const languagesFieldsMap: DbFieldsMap = {
	id: 'language_id',
	name: 'name',
	symbol: 'symbol',
	isActive: 'is_active',
};
const dbStructure: DbStructure = {
	languages: {
		tableName: 'languages',
		key: 'id',
		fieldsMap: languagesFieldsMap,
	},
	users: {
		tableName: 'users',
		key: 'id',
		fieldsMap: {
			id: 'user_id',
			name: 'name',
			isActive: 'is_active',
		},
	},
	userLanguages: {
		tableName: 'user_languages',
		key: 'id',
		fieldsMap: {
			id: 'user_language_id',
			userId: 'user_id',
			languageId: 'language_id',
		},
		foreignKeys: [
			{ field: 'userId', table: 'users' },
			{ field: 'languageId', table: 'languages' },
		],
	},
};

describe('fieldsManager.constructor', () => {
	test('should create new instance of FieldsManager', () => {
		const manager: FieldsManager = new FieldsManager(dbStructure);
		expect(manager).toBeInstanceOf(FieldsManager);
		expect(manager.___getDbStructure()).toEqual(dbStructure);
	});
});

describe('getFieldsMap', () => {
	test('should return proper map', () => {
		const manager: FieldsManager = new FieldsManager(dbStructure);
		expect(manager.getFieldsMap('languages')).toEqual(languagesFieldsMap);
	});

	test('should return null if map with the given id does not exist', () => {
		const manager: FieldsManager = new FieldsManager(dbStructure);
		expect(manager.getFieldsMap('____')).toBeNull();
	});
});

describe('getFieldName', () => {
	test('should return proper field name', () => {
		const manager: FieldsManager = new FieldsManager(dbStructure);
		expect(manager.getFieldName('languages', 'id')).toEqual('language_id');
	});

	test('should return null if fieldsMap does not exist', () => {
		const manager: FieldsManager = new FieldsManager(dbStructure);
		expect(manager.getFieldName('____', 'id')).toBeNull();
	});

	test('should return null if fieldsMap exists but does not have a given property', () => {
		const manager: FieldsManager = new FieldsManager(dbStructure);
		expect(manager.getFieldName('languages', '_____')).toBeNull();
	});
});

// describe('convertRecordset', () => {
// 	test('should works properly if there is no fieldsSet for a given table name', () => {
// 		const tableNameUsers = 'users';
// 		const fieldsManager = new FieldsManager();
// 		const fsUsers: FieldsSet = {
// 			key: 'userId',
// 			propertyToField: { id: 'user_id', name: 'user_name' },
// 			dependencies: {},
// 		};
// 		fieldsManager.addFieldsSet(tableNameUsers, fsUsers);

// 		const records = [
// 			{ item_id: 1, item_name: 'Laptop' },
// 			{ item_id: 2, item_name: 'Monitor' },
// 		];
// 		const converted = fieldsManager.convertRecordset('items', records);
// 		expect(converted).toEqual(records);
// 	});

// 	test('should works properly if a given recordset is empty', () => {
// 		const tableNameUsers = 'users';
// 		const fieldsManager = new FieldsManager();
// 		const fsUsers: FieldsSet = {
// 			key: 'userId',
// 			propertyToField: { id: 'user_id', name: 'user_name' },
// 			dependencies: {},
// 		};
// 		fieldsManager.addFieldsSet(tableNameUsers, fsUsers);

// 		const records: DbRecordSet = [];
// 		const converted = fieldsManager.convertRecordset('users', records);
// 		expect(converted).toEqual(records);
// 	});

// 	test('should works properly if a given recordset contains empty records', () => {
// 		const tableNameUsers = 'users';
// 		const fieldsManager = new FieldsManager();
// 		const fsUsers: FieldsSet = {
// 			key: 'userId',
// 			propertyToField: { id: 'user_id', name: 'user_name' },
// 			dependencies: {},
// 		};
// 		fieldsManager.addFieldsSet(tableNameUsers, fsUsers);

// 		const records: DbRecordSet = [{}, {}];
// 		const converted = fieldsManager.convertRecordset('users', records);
// 		expect(converted).toEqual(records);
// 	});

// 	test('should works properly if all fields are found', () => {
// 		const tableNameUsers = 'users';
// 		const fieldsManager = new FieldsManager();
// 		const fsUsers: FieldsSet = {
// 			key: 'userId',
// 			propertyToField: { id: 'user_id', name: 'user_name' },
// 			dependencies: {},
// 		};
// 		fieldsManager.addFieldsSet(tableNameUsers, fsUsers);

// 		const records = [
// 			{ user_id: 1, user_name: 'Adam' },
// 			{ user_id: 2, user_name: 'Bartek' },
// 		];
// 		const expected = [
// 			{ id: 1, name: 'Adam' },
// 			{ id: 2, name: 'Bartek' },
// 		];
// 		const converted = fieldsManager.convertRecordset(tableNameUsers, records);
// 		expect(converted).toEqual(expected);
// 	});

// 	test('should works properly if some fields are missing', () => {
// 		const tableNameUsers = 'users';
// 		const fieldsManager = new FieldsManager();
// 		const fsUsers: FieldsSet = {
// 			key: 'userId',
// 			propertyToField: { id: 'user_id', name: 'user_name' },
// 			dependencies: {},
// 		};
// 		fieldsManager.addFieldsSet(tableNameUsers, fsUsers);

// 		const records = [
// 			{ user_id: 1, user_name: 'Adam', user_age: 24 },
// 			{ user_id: 2, user_name: 'Bartek', user_age: 35 },
// 		];
// 		const expected = [
// 			{ id: 1, name: 'Adam', user_age: 24 },
// 			{ id: 2, name: 'Bartek', user_age: 35 },
// 		];
// 		const converted = fieldsManager.convertRecordset(tableNameUsers, records);
// 		expect(converted).toEqual(expected);
// 	});
// });

// describe('convertMultiRecordset', () => {
// 	test('should works properly if there is no recordsets', () => {
// 		const tableNameUsers = 'users';
// 		const fieldsManager = new FieldsManager();
// 		const fsUsers: FieldsSet = {
// 			key: 'userId',
// 			propertyToField: { id: 'user_id', name: 'user_name' },
// 			dependencies: {},
// 		};
// 		fieldsManager.addFieldsSet(tableNameUsers, fsUsers);

// 		const recordsets: MultiRecordSet = {};
// 		const converted = fieldsManager.convertMultiRecordset(recordsets);
// 		expect(converted).toEqual(recordsets);
// 	});

// 	test('should works properly if recordsets are empty', () => {
// 		const tableNameUsers = 'users';
// 		const fieldsManager = new FieldsManager();
// 		const fsUsers: FieldsSet = {
// 			key: 'userId',
// 			propertyToField: { id: 'user_id', name: 'user_name' },
// 			dependencies: {},
// 		};
// 		fieldsManager.addFieldsSet(tableNameUsers, fsUsers);

// 		const recordsets: MultiRecordSet = { items: [], users: [] };
// 		const converted = fieldsManager.convertMultiRecordset(recordsets);
// 		expect(converted).toEqual(recordsets);
// 	});

// 	test('should works properly if recordsets contain empty objects', () => {
// 		const tableNameUsers = 'users';
// 		const fieldsManager = new FieldsManager();
// 		const fsUsers: FieldsSet = {
// 			key: 'userId',
// 			propertyToField: { id: 'user_id', name: 'user_name' },
// 			dependencies: {},
// 		};
// 		fieldsManager.addFieldsSet(tableNameUsers, fsUsers);

// 		const recordsets: MultiRecordSet = { items: [{}, {}], users: [{}, {}] };
// 		const converted = fieldsManager.convertMultiRecordset(recordsets);
// 		expect(converted).toEqual(recordsets);
// 	});

// 	test('should works properly if all fieldsSets and fields are found', () => {
// 		const tableNameUsers = 'users';
// 		const tableNameItems = 'items';
// 		const fieldsManager = new FieldsManager();
// 		const fsUsers: FieldsSet = {
// 			key: 'userId',
// 			propertyToField: { id: 'user_id', name: 'user_name' },
// 			dependencies: {},
// 		};
// 		const fsItems: FieldsSet = {
// 			key: 'itemId',
// 			propertyToField: { id: 'item_id', name: 'item_name' },
// 			dependencies: { userId: 'users.id' },
// 		};
// 		fieldsManager.addFieldsSet(tableNameUsers, fsUsers);
// 		fieldsManager.addFieldsSet(tableNameItems, fsItems);

// 		const recordsets = {
// 			items: [
// 				{ item_id: 1, item_name: 'Laptop' },
// 				{ item_id: 2, item_name: 'Monitor' },
// 			],
// 			users: [
// 				{ user_id: 1, user_name: 'Adam' },
// 				{ user_id: 1, user_name: 'Bartek' },
// 			],
// 		};

// 		const expected = {
// 			items: [
// 				{ id: 1, name: 'Laptop' },
// 				{ id: 2, name: 'Monitor' },
// 			],
// 			users: [
// 				{ id: 1, name: 'Adam' },
// 				{ id: 1, name: 'Bartek' },
// 			],
// 		};
// 		const converted = fieldsManager.convertMultiRecordset(recordsets);
// 		expect(converted).toEqual(expected);
// 	});

// 	test('should works properly if some fieldsSets is missing', () => {
// 		const tableNameUsers = 'users';
// 		const fieldsManager = new FieldsManager();
// 		const fsUsers: FieldsSet = {
// 			key: 'userId',
// 			propertyToField: { id: 'user_id', name: 'user_name' },
// 			dependencies: {},
// 		};
// 		fieldsManager.addFieldsSet(tableNameUsers, fsUsers);

// 		const recordsets = {
// 			items: [
// 				{ item_id: 1, item_name: 'Laptop' },
// 				{ item_id: 2, item_name: 'Monitor' },
// 			],
// 			users: [
// 				{ user_id: 1, user_name: 'Adam' },
// 				{ user_id: 1, user_name: 'Bartek' },
// 			],
// 		};

// 		const expected = {
// 			items: [
// 				{ item_id: 1, item_name: 'Laptop' },
// 				{ item_id: 2, item_name: 'Monitor' },
// 			],
// 			users: [
// 				{ id: 1, name: 'Adam' },
// 				{ id: 1, name: 'Bartek' },
// 			],
// 		};
// 		const converted = fieldsManager.convertMultiRecordset(recordsets);
// 		expect(converted).toEqual(expected);
// 	});

// 	test('should works properly if all fieldsSets are found but some fields are misding', () => {
// 		const tableNameUsers = 'users';
// 		const tableNameItems = 'items';
// 		const fieldsManager = new FieldsManager();
// 		const fsUsers: FieldsSet = {
// 			key: 'userId',
// 			propertyToField: { id: 'user_id', name: 'user_name' },
// 			dependencies: {},
// 		};
// 		const fsItems: FieldsSet = {
// 			key: 'itemId',
// 			propertyToField: { id: 'item_id', name: 'item_name' },
// 			dependencies: { userId: 'users.id' },
// 		};
// 		fieldsManager.addFieldsSet(tableNameUsers, fsUsers);
// 		fieldsManager.addFieldsSet(tableNameItems, fsItems);

// 		const recordsets = {
// 			items: [
// 				{ item_id: 1, item_name: 'Laptop' },
// 				{ item_id: 2, item_name: 'Monitor' },
// 			],
// 			users: [
// 				{ user_id: 1, user_name: 'Adam', user_age: 24 },
// 				{ user_id: 1, user_name: 'Bartek', user_age: 35 },
// 			],
// 		};

// 		const expected = {
// 			items: [
// 				{ id: 1, name: 'Laptop' },
// 				{ id: 2, name: 'Monitor' },
// 			],
// 			users: [
// 				{ id: 1, name: 'Adam', user_age: 24 },
// 				{ id: 1, name: 'Bartek', user_age: 35 },
// 			],
// 		};
// 		const converted = fieldsManager.convertMultiRecordset(recordsets);
// 		expect(converted).toEqual(expected);
// 	});
// });
