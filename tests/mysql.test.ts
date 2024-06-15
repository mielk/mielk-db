import { FieldPacket, OkPacket, RowDataPacket, createConnection } from 'mysql2/promise';
import { query } from '../src/mysql';
import { ConnectionData, RequestType } from '../src/models/sql';
import { ObjectOfPrimitives } from '../src/models/common';
import { QueryResponse } from '../src/models/responses';
import utils from '../src/utils';

const host: string = 'localhost'; // Replace with the server address
const database: string = 'mydatabase'; // Replace with the database name
const username: string = 'myusername'; // Replace with the username
const password: string = 'mypassword'; // Replace with the password

const invalidSql = 'SELECT * FROM non-existing table';
const config: ConnectionData = {
	host: host,
	database: database,
	user: username,
	password: password,
};

const mockFactory = (() => {
	function createFieldPacket(fieldName: string, type: number): FieldPacket {
		return Object.create({
			constructor: {
				name: 'FieldPackdet',
			},
			catalog: '',
			db: '',
			table: '',
			orgTable: '',
			name: fieldName,
			orgName: '',
			charsetNr: 0,
			length: 0,
			type: type,
			flags: 0,
			decimals: 0,
			default: '',
			zerofill: false,
			protocol41: false,
		});
	}

	function createOkPacket(rows: number, id: number): OkPacket {
		return Object.create({
			constructor: {
				name: 'OkPacket',
			},
			fieldCount: 0,
			affectedRows: rows,
			changedRows: rows,
			insertId: id,
			serverStatus: 2,
			warningCount: 0,
			message: '',
			procotol41: false,
		});
	}

	function createRowDataPacket(properties: ObjectOfPrimitives): RowDataPacket {
		const obj = Object.create({
			constructor: {
				name: 'RowDataPacket',
			},
		});
		Object.entries(properties).forEach(([key, value]) => {
			obj[key] = value;
		});

		return obj;
	}

	const fieldPackets: FieldPacket[] = [
		createFieldPacket('user_id', 3),
		createFieldPacket('user_name', 253),
		createFieldPacket('is_active', 1),
	];

	const rowDataPackets: RowDataPacket[] = [
		createRowDataPacket({ id: 1, name: 'Adam', isActive: true }),
		createRowDataPacket({ id: 2, name: 'Bartek', isActive: false }),
		createRowDataPacket({ id: 3, name: 'Czesiek', isActive: true }),
	];

	return {
		fieldPackets,
		rowDataPackets,
		createOkPacket,
	};
})();

jest.mock('mysql2/promise', () => {
	return {
		createConnection: jest.fn().mockResolvedValue({
			execute: jest.fn().mockImplementation((sql: string) => {
				if (sql === invalidSql) throw new Error();
				const requestType = utils.getRequestTypeFromSql(sql);
				switch (requestType) {
					case RequestType.Select:
						return [mockFactory.rowDataPackets, mockFactory.fieldPackets];
					case RequestType.Update:
						return [mockFactory.createOkPacket(3, 0), undefined];
					case RequestType.Insert:
						return [mockFactory.createOkPacket(1, 1), undefined];
					case RequestType.Delete:
						return [mockFactory.createOkPacket(1, 0), undefined];
					default:
						return [undefined, undefined];
				}
			}),
		}),
	};
});

describe('query', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	test('query should handle SELECT statement', async () => {
		const sql = 'SELECT * FROM users';
		const results = await query(config, sql);
		const expected: QueryResponse = {
			items: [
				{ id: 1, name: 'Adam', isActive: true },
				{ id: 2, name: 'Bartek', isActive: false },
				{ id: 3, name: 'Czesiek', isActive: true },
			],
			rows: 3,
			insertId: 0,
			fields: [
				{ name: 'user_id', type: 3 },
				{ name: 'user_name', type: 253 },
				{ name: 'is_active', type: 1 },
			],
		};

		expect(results).toEqual(expected);
		expect(createConnection).toHaveBeenCalledTimes(1);
		expect(createConnection).toHaveBeenCalledWith(config);

		const connection = await createConnection(config);
		expect(connection.execute).toHaveBeenCalledTimes(1);
		expect(connection.execute).toHaveBeenCalledWith(sql);
	});

	test('query should handle INSERT statement', async () => {
		const sql = "INSERT INTO users(user_name, is_active) SELECT 'Dawid', 1";
		const results = await query(config, sql);
		const expected: QueryResponse = {
			items: [],
			rows: 1,
			insertId: 1,
			fields: [],
		};

		expect(results).toEqual(expected);
		expect(createConnection).toHaveBeenCalledTimes(1);
		expect(createConnection).toHaveBeenCalledWith(config);

		const connection = await createConnection(config);
		expect(connection.execute).toHaveBeenCalledTimes(1);
		expect(connection.execute).toHaveBeenCalledWith(sql);
	});

	test('query should handle UPDATE statement', async () => {
		const sql = "UPDATE users SET user_name = 'Edward' WHERE user_id = 4";
		const results = await query(config, sql);
		const expected: QueryResponse = {
			items: [],
			rows: 3,
			insertId: 0,
			fields: [],
		};

		expect(results).toEqual(expected);
		expect(createConnection).toHaveBeenCalledTimes(1);
		expect(createConnection).toHaveBeenCalledWith(config);

		const connection = await createConnection(config);
		expect(connection.execute).toHaveBeenCalledTimes(1);
		expect(connection.execute).toHaveBeenCalledWith(sql);
	});

	test('query should handle DELETE statement', async () => {
		const sql = 'DELETE FROM users WHERE user_id = 4';
		const results = await query(config, sql);
		const expected: QueryResponse = {
			items: [],
			rows: 1,
			insertId: 0,
			fields: [],
		};

		expect(results).toEqual(expected);
		expect(createConnection).toHaveBeenCalledTimes(1);
		expect(createConnection).toHaveBeenCalledWith(config);

		const connection = await createConnection(config);
		expect(connection.execute).toHaveBeenCalledTimes(1);
		expect(connection.execute).toHaveBeenCalledWith(sql);
	});

	test('should handle an error when executing an invalid SQL query', async () => {
		await expect(query(config, invalidSql)).rejects.toThrow();
		expect(createConnection).toHaveBeenCalledTimes(1);
		expect(createConnection).toHaveBeenCalledWith(config);
		const connection = await createConnection(config);
		expect(connection.execute).toHaveBeenCalledTimes(1);
		expect(connection.execute).toHaveBeenCalledWith(invalidSql);
	});

	// it('should handle asynchronous behavior correctly', async () => {});

	// it('should handle different configuration options', async () => {

	// it('should handle performance and scalability', async () => {
});
