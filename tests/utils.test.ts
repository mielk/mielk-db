import { RequestType } from '../src/models/sql';
import utils from '../src/utils';

describe('getRequestTypeFromSql', () => {
	const { getRequestTypeFromSql } = utils;

	test('should return RequestType.Select for SELECT statement', () => {
		const sql = 'SELECT * FROM users';
		const result = getRequestTypeFromSql(sql);
		expect(result).toBe(RequestType.Select);
	});

	test('should return RequestType.Insert for INSERT statement', () => {
		const sql = 'INSERT INTO users (name) VALUES ("John")';
		const result = getRequestTypeFromSql(sql);
		expect(result).toBe(RequestType.Insert);
	});

	test('should return RequestType.Insert for INSERT statement with SELECT used to specify values', () => {
		const sql = 'INSERT INTO users (name) SELECT "John"';
		const result = getRequestTypeFromSql(sql);
		expect(result).toBe(RequestType.Insert);
	});

	test('should return RequestType.Update for UPDATE statement', () => {
		const sql = 'UPDATE users SET active = 1 WHERE id > 5';
		const result = getRequestTypeFromSql(sql);
		expect(result).toBe(RequestType.Update);
	});

	test('should return RequestType.Delete for DELETE statement', () => {
		const sql = 'DELETE FROM users WHERE id < 10';
		const result = getRequestTypeFromSql(sql);
		expect(result).toBe(RequestType.Delete);
	});

	test('should return RequestType.Unknown for unrecognized statement', () => {
		const sql = 'ALTER TABLE users ADD COLUMN age INT';
		const result = getRequestTypeFromSql(sql);
		expect(result).toBe(RequestType.Unknown);
	});
});
