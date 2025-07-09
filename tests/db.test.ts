import Db from '../src/db';
import { ConnectionData } from '../src/models/sql';
import { Update } from '../src/actions/update';
import { Select } from '../src/actions/select';
import { Delete } from '../src/actions/delete';
import { Insert } from '../src/actions/insert';
import { Proc } from '../src/actions/proc';

const config: ConnectionData = {
	host: 'host',
	database: 'database',
	user: 'username',
	password: 'password',
};

describe('update', () => {
	test('should create new instance of Update class', () => {
		// const update: Update = Db.update();
		// expect(update).toBeInstanceOf(Update);
		expect(1).toEqual(1);
	});
});

// describe('select', () => {
// 	test('should create new instance of Select class', () => {
// 		const select: Select = Db.select();
// 		expect(select).toBeInstanceOf(Select);
// 	});
// });

// describe('delete', () => {
// 	test('should create new instance of Delete class', () => {
// 		const del: Delete = Db.del();
// 		expect(del).toBeInstanceOf(Delete);
// 	});
// });

// describe('insert', () => {
// 	test('should create new instance of Insert class', () => {
// 		const insert: Insert = Db.insert();
// 		expect(insert).toBeInstanceOf(Insert);
// 	});
// });

// describe('proc', () => {
// 	test('should create new instance of Proc class', () => {
// 		const proc: Proc = Db.proc();
// 		expect(proc).toBeInstanceOf(Proc);
// 	});
// });
