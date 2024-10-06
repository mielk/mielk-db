import { FieldsManager } from '../src/fieldsManager';
import { DbStructure } from '../src/models/fields';
import { DbRecordSet, MultiRecordSet } from '../src/models/records';

const dbStructure: DbStructure = {
	languages: {
		table: 'languages',
		view: 'languages',
		key: 'id',
		fieldsMap: {
			id: 'language_id',
			name: 'language_name',
			symbol: 'symbol',
			isActive: 'is_active',
		},
	},
	users: {
		table: 'users',
		view: 'users',
		key: 'id',
		fieldsMap: {
			id: 'user_id',
			name: 'user_name',
			isActive: 'is_active',
		},
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
		expect(manager.getFieldsMap('languages')).toEqual(dbStructure.languages.fieldsMap);
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

describe('convertRecordset', () => {
	test('should works properly if there is no fieldsSet for a given table name', () => {
		const fieldsManager = new FieldsManager(dbStructure);
		const records = [{ item_id: 1, item_name: 'Laptop' }];
		const converted = fieldsManager.convertRecordset('items', records);
		expect(converted).toEqual(records);
	});

	test('should works properly if a given recordset is empty', () => {
		const fieldsManager = new FieldsManager(dbStructure);
		const records: DbRecordSet = [];
		const converted = fieldsManager.convertRecordset('users', records);
		expect(converted).toEqual([]);
	});

	test('should works properly if a given recordset contains empty records', () => {
		const fieldsManager = new FieldsManager(dbStructure);
		const records: DbRecordSet = [{}, {}];
		const converted = fieldsManager.convertRecordset('users', records);
		expect(converted).toEqual(records);
	});

	test('should works properly if all fields are found', () => {
		const fieldsManager = new FieldsManager(dbStructure);
		const records = [
			{ user_id: 1, user_name: 'Adam' },
			{ user_id: 2, user_name: 'Bartek' },
		];
		const expected = [
			{ id: 1, name: 'Adam' },
			{ id: 2, name: 'Bartek' },
		];

		const converted = fieldsManager.convertRecordset('users', records);
		expect(converted).toEqual(expected);
	});

	test('should works properly if some fields are missing', () => {
		const fieldsManager = new FieldsManager(dbStructure);
		const records = [
			{ user_id: 1, user_name: 'Adam', user_age: 24 },
			{ user_id: 2, user_name: 'Bartek', user_age: 35 },
		];
		const expected = [
			{ id: 1, name: 'Adam', user_age: 24 },
			{ id: 2, name: 'Bartek', user_age: 35 },
		];

		const converted = fieldsManager.convertRecordset('users', records);
		expect(converted).toEqual(expected);
	});
});

describe('convertMultiRecordset', () => {
	test('should works properly if there is no recordsets', () => {
		const fieldsManager = new FieldsManager(dbStructure);
		const recordsets: MultiRecordSet = {};
		const converted = fieldsManager.convertMultiRecordset(recordsets);
		expect(converted).toEqual(recordsets);
	});

	test('should works properly if recordsets are empty', () => {
		const fieldsManager = new FieldsManager(dbStructure);
		const recordsets: MultiRecordSet = { items: [], users: [] };
		const converted = fieldsManager.convertMultiRecordset(recordsets);
		expect(converted).toEqual(recordsets);
	});

	test('should works properly if recordsets contain empty objects', () => {
		const fieldsManager = new FieldsManager(dbStructure);
		const recordsets: MultiRecordSet = { items: [{}, {}], users: [{}, {}] };
		const converted = fieldsManager.convertMultiRecordset(recordsets);
		expect(converted).toEqual(recordsets);
	});

	test('should works properly if all fieldsSets and fields are found', () => {
		const fieldsManager = new FieldsManager(dbStructure);

		const recordsets = {
			languages: [
				{ language_id: 1, language_name: 'polski' },
				{ language_id: 2, language_name: 'english' },
			],
			users: [
				{ user_id: 1, user_name: 'Adam' },
				{ user_id: 1, user_name: 'Bartek' },
			],
		};

		const expected = {
			languages: [
				{ id: 1, name: 'polski' },
				{ id: 2, name: 'english' },
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
		const fieldsManager = new FieldsManager(dbStructure);

		const recordsets = {
			items: [
				{ item_id: 1, item_name: 'Laptop' },
				{ item_id: 2, item_name: 'Monitor' },
			],
			users: [
				{ user_id: 1, user_name: 'Adam' },
				{ user_id: 2, user_name: 'Bartek' },
			],
		};

		const expected = {
			items: [
				{ item_id: 1, item_name: 'Laptop' },
				{ item_id: 2, item_name: 'Monitor' },
			],
			users: [
				{ id: 1, name: 'Adam' },
				{ id: 2, name: 'Bartek' },
			],
		};
		const converted = fieldsManager.convertMultiRecordset(recordsets);
		expect(converted).toEqual(expected);
	});

	test('should works properly if all fieldsSets are found but some fields are missing', () => {
		const fieldsManager = new FieldsManager(dbStructure);

		const recordsets = {
			languages: [
				{ language_id: 1, language_name: 'polski', language_symbol: 'pl' },
				{ language_id: 2, language_name: 'english', language_symbol: 'en' },
			],
			users: [
				{ user_id: 1, user_name: 'Adam', user_age: 24 },
				{ user_id: 2, user_name: 'Bartek', user_age: 35 },
			],
		};

		const expected = {
			languages: [
				{ id: 1, name: 'polski', language_symbol: 'pl' },
				{ id: 2, name: 'english', language_symbol: 'en' },
			],
			users: [
				{ id: 1, name: 'Adam', user_age: 24 },
				{ id: 2, name: 'Bartek', user_age: 35 },
			],
		};
		const converted = fieldsManager.convertMultiRecordset(recordsets);
		expect(converted).toEqual(expected);
	});
});
