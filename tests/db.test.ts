import Db from '../src/db';
import { ConnectionData } from '../src/models/sql';
import { Update } from '../src/actions/update';
import { Select } from '../src/actions/select';
import { Delete } from '../src/actions/delete';
import { Insert } from '../src/actions/insert';

const config: ConnectionData = {
	host: 'host',
	database: 'database',
	user: 'username',
	password: 'password',
};

describe('update', () => {
	test('should create new instance of Update class', () => {
		const update: Update = new Db(config).update();
		expect(update).toBeInstanceOf(Update);
	});
});

describe('select', () => {
	test('should create new instance of Select class', () => {
		const select: Select = new Db(config).select();
		expect(select).toBeInstanceOf(Select);
	});
});

describe('delete', () => {
	test('should create new instance of Delete class', () => {
		const del: Delete = new Db(config).delete();
		expect(del).toBeInstanceOf(Delete);
	});
});

describe('insert', () => {
	test('should create new instance of Insert class', () => {
		const insert: Insert = new Db(config).insert();
		expect(insert).toBeInstanceOf(Insert);
	});
});
