import { FieldsManager } from '../src/fieldsManager';
import { FieldsSet } from '../src/models/fields';
import { DbRecordSet, MultiRecordSet } from '../src/models/records';

describe('fieldsManager.constructor', () => {
	test('should create new instance of FieldsManager', () => {
		const fieldsManager = new FieldsManager();
		expect(fieldsManager).toBeInstanceOf(FieldsManager);
	});
});

describe('managing FieldSets', () => {
	test('should properly add and retrieve FieldSets', () => {
		const tableNameUsers = 'users';
		const tableNameItems = 'items';
		const fieldsManager = new FieldsManager();
		const fsUsers: FieldsSet = {
			key: 'userId',
			propertyToField: { id: 'user_id', name: 'user_name' },
			dependencies: {},
		};
		const fsItems: FieldsSet = {
			key: 'itemId',
			propertyToField: { id: 'item_id', name: 'item_name' },
			dependencies: { userId: 'users.id' },
		};
		fieldsManager.addFieldsSet(tableNameUsers, fsUsers);
		fieldsManager.addFieldsSet(tableNameItems, fsItems);

		expect(fieldsManager.countFieldsSets()).toEqual(2);
		expect(fieldsManager.getFieldsSet(tableNameUsers)).toEqual(fsUsers);
		expect(fieldsManager.getFieldsSet(tableNameItems)).toEqual(fsItems);
	});
});

describe('getPropertyToDbFieldMap', () => {
	test('should return proper map', () => {
		const tableNameUsers = 'users';
		const tableNameItems = 'items';
		const fieldsManager = new FieldsManager();
		const fsUsers: FieldsSet = {
			key: 'userId',
			propertyToField: { id: 'user_id', name: 'user_name' },
			dependencies: {},
		};
		const fsItems: FieldsSet = {
			key: 'itemId',
			propertyToField: { id: 'item_id', name: 'item_name' },
			dependencies: { userId: 'users.id' },
		};
		fieldsManager.addFieldsSet(tableNameUsers, fsUsers);
		fieldsManager.addFieldsSet(tableNameItems, fsItems);

		expect(fieldsManager.getPropertyToDbFieldMap(tableNameUsers)).toEqual(fsUsers.propertyToField);
		expect(fieldsManager.getPropertyToDbFieldMap(tableNameItems)).toEqual(fsItems.propertyToField);
	});
});

describe('convertRecordset', () => {
	test('should works properly if there is no fieldsSet for a given table name', () => {
		const tableNameUsers = 'users';
		const fieldsManager = new FieldsManager();
		const fsUsers: FieldsSet = {
			key: 'userId',
			propertyToField: { id: 'user_id', name: 'user_name' },
			dependencies: {},
		};
		fieldsManager.addFieldsSet(tableNameUsers, fsUsers);

		const records = [
			{ item_id: 1, item_name: 'Laptop' },
			{ item_id: 2, item_name: 'Monitor' },
		];
		const converted = fieldsManager.convertRecordset('items', records);
		expect(converted).toEqual(records);
	});

	test('should works properly if a given recordset is empty', () => {
		const tableNameUsers = 'users';
		const fieldsManager = new FieldsManager();
		const fsUsers: FieldsSet = {
			key: 'userId',
			propertyToField: { id: 'user_id', name: 'user_name' },
			dependencies: {},
		};
		fieldsManager.addFieldsSet(tableNameUsers, fsUsers);

		const records: DbRecordSet = [];
		const converted = fieldsManager.convertRecordset('users', records);
		expect(converted).toEqual(records);
	});

	test('should works properly if a given recordset contains empty records', () => {
		const tableNameUsers = 'users';
		const fieldsManager = new FieldsManager();
		const fsUsers: FieldsSet = {
			key: 'userId',
			propertyToField: { id: 'user_id', name: 'user_name' },
			dependencies: {},
		};
		fieldsManager.addFieldsSet(tableNameUsers, fsUsers);

		const records: DbRecordSet = [{}, {}];
		const converted = fieldsManager.convertRecordset('users', records);
		expect(converted).toEqual(records);
	});

	test('should works properly if all fields are found', () => {
		const tableNameUsers = 'users';
		const fieldsManager = new FieldsManager();
		const fsUsers: FieldsSet = {
			key: 'userId',
			propertyToField: { id: 'user_id', name: 'user_name' },
			dependencies: {},
		};
		fieldsManager.addFieldsSet(tableNameUsers, fsUsers);

		const records = [
			{ user_id: 1, user_name: 'Adam' },
			{ user_id: 2, user_name: 'Bartek' },
		];
		const expected = [
			{ id: 1, name: 'Adam' },
			{ id: 2, name: 'Bartek' },
		];
		const converted = fieldsManager.convertRecordset(tableNameUsers, records);
		expect(converted).toEqual(expected);
	});

	test('should works properly if some fields are missing', () => {
		const tableNameUsers = 'users';
		const fieldsManager = new FieldsManager();
		const fsUsers: FieldsSet = {
			key: 'userId',
			propertyToField: { id: 'user_id', name: 'user_name' },
			dependencies: {},
		};
		fieldsManager.addFieldsSet(tableNameUsers, fsUsers);

		const records = [
			{ user_id: 1, user_name: 'Adam', user_age: 24 },
			{ user_id: 2, user_name: 'Bartek', user_age: 35 },
		];
		const expected = [
			{ id: 1, name: 'Adam', user_age: 24 },
			{ id: 2, name: 'Bartek', user_age: 35 },
		];
		const converted = fieldsManager.convertRecordset(tableNameUsers, records);
		expect(converted).toEqual(expected);
	});
});

describe('convertMultiRecordset', () => {
	test('should works properly if there is no recordsets', () => {
		const tableNameUsers = 'users';
		const fieldsManager = new FieldsManager();
		const fsUsers: FieldsSet = {
			key: 'userId',
			propertyToField: { id: 'user_id', name: 'user_name' },
			dependencies: {},
		};
		fieldsManager.addFieldsSet(tableNameUsers, fsUsers);

		const recordsets: MultiRecordSet = {};
		const converted = fieldsManager.convertMultiRecordset(recordsets);
		expect(converted).toEqual(recordsets);
	});

	test('should works properly if recordsets are empty', () => {
		const tableNameUsers = 'users';
		const fieldsManager = new FieldsManager();
		const fsUsers: FieldsSet = {
			key: 'userId',
			propertyToField: { id: 'user_id', name: 'user_name' },
			dependencies: {},
		};
		fieldsManager.addFieldsSet(tableNameUsers, fsUsers);

		const recordsets: MultiRecordSet = { items: [], users: [] };
		const converted = fieldsManager.convertMultiRecordset(recordsets);
		expect(converted).toEqual(recordsets);
	});

	test('should works properly if recordsets contain empty objects', () => {
		const tableNameUsers = 'users';
		const fieldsManager = new FieldsManager();
		const fsUsers: FieldsSet = {
			key: 'userId',
			propertyToField: { id: 'user_id', name: 'user_name' },
			dependencies: {},
		};
		fieldsManager.addFieldsSet(tableNameUsers, fsUsers);

		const recordsets: MultiRecordSet = { items: [{}, {}], users: [{}, {}] };
		const converted = fieldsManager.convertMultiRecordset(recordsets);
		expect(converted).toEqual(recordsets);
	});

	test('should works properly if all fieldsSets and fields are found', () => {
		const tableNameUsers = 'users';
		const tableNameItems = 'items';
		const fieldsManager = new FieldsManager();
		const fsUsers: FieldsSet = {
			key: 'userId',
			propertyToField: { id: 'user_id', name: 'user_name' },
			dependencies: {},
		};
		const fsItems: FieldsSet = {
			key: 'itemId',
			propertyToField: { id: 'item_id', name: 'item_name' },
			dependencies: { userId: 'users.id' },
		};
		fieldsManager.addFieldsSet(tableNameUsers, fsUsers);
		fieldsManager.addFieldsSet(tableNameItems, fsItems);

		const recordsets = {
			items: [
				{ item_id: 1, item_name: 'Laptop' },
				{ item_id: 2, item_name: 'Monitor' },
			],
			users: [
				{ user_id: 1, user_name: 'Adam' },
				{ user_id: 1, user_name: 'Bartek' },
			],
		};

		const expected = {
			items: [
				{ id: 1, name: 'Laptop' },
				{ id: 2, name: 'Monitor' },
			],
			users: [
				{ id: 1, name: 'Adam' },
				{ id: 1, name: 'Bartek' },
			],
		};
		const converted = fieldsManager.convertMultiRecordset(recordsets);
		expect(converted).toEqual(expected);
	});

	test('should works properly if some fieldsSets is missing', () => {
		const tableNameUsers = 'users';
		const fieldsManager = new FieldsManager();
		const fsUsers: FieldsSet = {
			key: 'userId',
			propertyToField: { id: 'user_id', name: 'user_name' },
			dependencies: {},
		};
		fieldsManager.addFieldsSet(tableNameUsers, fsUsers);

		const recordsets = {
			items: [
				{ item_id: 1, item_name: 'Laptop' },
				{ item_id: 2, item_name: 'Monitor' },
			],
			users: [
				{ user_id: 1, user_name: 'Adam' },
				{ user_id: 1, user_name: 'Bartek' },
			],
		};

		const expected = {
			items: [
				{ item_id: 1, item_name: 'Laptop' },
				{ item_id: 2, item_name: 'Monitor' },
			],
			users: [
				{ id: 1, name: 'Adam' },
				{ id: 1, name: 'Bartek' },
			],
		};
		const converted = fieldsManager.convertMultiRecordset(recordsets);
		expect(converted).toEqual(expected);
	});

	test('should works properly if all fieldsSets are found but some fields are misding', () => {
		const tableNameUsers = 'users';
		const tableNameItems = 'items';
		const fieldsManager = new FieldsManager();
		const fsUsers: FieldsSet = {
			key: 'userId',
			propertyToField: { id: 'user_id', name: 'user_name' },
			dependencies: {},
		};
		const fsItems: FieldsSet = {
			key: 'itemId',
			propertyToField: { id: 'item_id', name: 'item_name' },
			dependencies: { userId: 'users.id' },
		};
		fieldsManager.addFieldsSet(tableNameUsers, fsUsers);
		fieldsManager.addFieldsSet(tableNameItems, fsItems);

		const recordsets = {
			items: [
				{ item_id: 1, item_name: 'Laptop' },
				{ item_id: 2, item_name: 'Monitor' },
			],
			users: [
				{ user_id: 1, user_name: 'Adam', user_age: 24 },
				{ user_id: 1, user_name: 'Bartek', user_age: 35 },
			],
		};

		const expected = {
			items: [
				{ id: 1, name: 'Laptop' },
				{ id: 2, name: 'Monitor' },
			],
			users: [
				{ id: 1, name: 'Adam', user_age: 24 },
				{ id: 1, name: 'Bartek', user_age: 35 },
			],
		};
		const converted = fieldsManager.convertMultiRecordset(recordsets);
		expect(converted).toEqual(expected);
	});
});
