import { FieldsMapper } from '../src/fieldsMapper';
import { TableFieldsMap, DbFieldsMap } from '../src/models/fields';
import { MultiRecordSet, DbRecordSet } from '../src/models/records';

const languagesFieldsMap: TableFieldsMap = {
	id: 'language_id',
	name: 'language_name',
	symbol: 'symbol',
	isActive: 'is_active',
};
const usersFieldsMap: TableFieldsMap = {
	id: 'user_id',
	name: 'user_name',
	isActive: 'is_active',
};

const dbFieldsMap: DbFieldsMap = {
	languages: languagesFieldsMap,
	users: usersFieldsMap,
};

describe('fieldsManager.constructor', () => {
	test('should create new instance of FieldsManager', () => {
		const manager: FieldsMapper = new FieldsMapper();
		expect(manager).toBeInstanceOf(FieldsMapper);
	});
});

describe('convertRecordset', () => {
	test('should works properly if empty fieldsMap was given', () => {
		const fieldsManager = new FieldsMapper();
		const records = [{ item_id: 1, item_name: 'Laptop' }];
		const converted = fieldsManager.convertRecordset(records, {});
		expect(converted).toEqual(records);
	});

	test('should works properly if a given recordset is empty', () => {
		const fieldsManager = new FieldsMapper();
		const records: DbRecordSet = [];
		const converted = fieldsManager.convertRecordset(records, usersFieldsMap);
		expect(converted).toEqual([]);
	});

	test('should works properly if a given recordset contains empty records', () => {
		const fieldsManager = new FieldsMapper();
		const records: DbRecordSet = [{}, {}];
		const converted = fieldsManager.convertRecordset(records, usersFieldsMap);
		expect(converted).toEqual(records);
	});

	test('should works properly if all fields are found', () => {
		const fieldsManager = new FieldsMapper();
		const records = [
			{ user_id: 1, user_name: 'Adam' },
			{ user_id: 2, user_name: 'Bartek' },
		];
		const expected = [
			{ id: 1, name: 'Adam' },
			{ id: 2, name: 'Bartek' },
		];

		const converted = fieldsManager.convertRecordset(records, usersFieldsMap);
		expect(converted).toEqual(expected);
	});

	test('should works properly if some fields are missing', () => {
		const fieldsManager = new FieldsMapper();
		const records = [
			{ user_id: 1, user_name: 'Adam', user_age: 24 },
			{ user_id: 2, user_name: 'Bartek', user_age: 35 },
		];
		const expected = [
			{ id: 1, name: 'Adam', user_age: 24 },
			{ id: 2, name: 'Bartek', user_age: 35 },
		];

		const converted = fieldsManager.convertRecordset(records, usersFieldsMap);
		expect(converted).toEqual(expected);
	});
});

describe('convertMultiRecordset', () => {
	test('should works properly if there is no recordsets', () => {
		const fieldsManager = new FieldsMapper();
		const recordsets: MultiRecordSet = {};
		const converted = fieldsManager.convertMultiRecordset(recordsets, dbFieldsMap);
		expect(converted).toEqual(recordsets);
	});

	test('should works properly if recordsets are empty', () => {
		const fieldsManager = new FieldsMapper();
		const recordsets: MultiRecordSet = { items: [], users: [] };
		const converted = fieldsManager.convertMultiRecordset(recordsets, dbFieldsMap);
		expect(converted).toEqual(recordsets);
	});

	test('should works properly if recordsets contain empty objects', () => {
		const fieldsManager = new FieldsMapper();
		const recordsets: MultiRecordSet = { items: [{}, {}], users: [{}, {}] };
		const converted = fieldsManager.convertMultiRecordset(recordsets, dbFieldsMap);
		expect(converted).toEqual(recordsets);
	});

	test('should works properly if all fieldsSets and fields are found', () => {
		const fieldsManager = new FieldsMapper();

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
		const converted = fieldsManager.convertMultiRecordset(recordsets, dbFieldsMap);
		expect(converted).toEqual(expected);
	});

	test('should works properly if some fieldsSets is missing', () => {
		const fieldsManager = new FieldsMapper();

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
		const converted = fieldsManager.convertMultiRecordset(recordsets, dbFieldsMap);
		expect(converted).toEqual(expected);
	});

	test('should works properly if all fieldsSets are found but some fields are missing', () => {
		const fieldsManager = new FieldsMapper();

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
		const converted = fieldsManager.convertMultiRecordset(recordsets, dbFieldsMap);
		expect(converted).toEqual(expected);
	});
});

describe('normalizeDbRow', () => {
	test('returns flat DbRecord as is', () => {
		const manager: FieldsMapper = new FieldsMapper();
		const input = { id: 1, name: 'Alice', active: true, score: null };
		expect(manager.normalizeDbRecord(input)).toEqual(input);
	});

	test('unwraps one-level nested DbRecord', () => {
		const manager: FieldsMapper = new FieldsMapper();
		const input = { user: { id: 2, name: 'Bob' } };
		const expected = { id: 2, name: 'Bob' };
		expect(manager.normalizeDbRecord(input)).toEqual(expected);
	});

	test('throws on invalid structure (non-object)', () => {
		const manager: FieldsMapper = new FieldsMapper();
		expect(() => manager.normalizeDbRecord(null)).toThrow(/Unexpected row structure/);
		expect(() => manager.normalizeDbRecord(42)).toThrow(/Unexpected row structure/);
		expect(() => manager.normalizeDbRecord('string')).toThrow(/Unexpected row structure/);
	});

	test('throws on invalid nested structure', () => {
		const manager: FieldsMapper = new FieldsMapper();
		const input = { data: { id: 1, nested: { foo: 'bar' } } }; // nested object inside DbRecord not allowed
		expect(() => manager.normalizeDbRecord(input)).toThrow(/Unexpected row structure/);
	});

	test('throws on array input', () => {
		const manager: FieldsMapper = new FieldsMapper();
		expect(() => manager.normalizeDbRecord([{ id: 1 }])).toThrow(/Unexpected row structure/);
	});
});
