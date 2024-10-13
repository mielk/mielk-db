import { OperationType } from '../src/models/sql';
import utils from '../src/utils';

describe('getOperationTypeFromSql', () => {
	const { getOperationTypeFromSql } = utils;

	test('should return OperationType.Select for SELECT statement', () => {
		const sql: string = 'SELECT * FROM users';
		const result: string = getOperationTypeFromSql(sql);
		expect(result).toBe(OperationType.Select);
	});

	test('should return OperationType.Insert for INSERT statement', () => {
		const sql: string = 'INSERT INTO users (name) VALUES ("John")';
		const result: string = getOperationTypeFromSql(sql);
		expect(result).toBe(OperationType.Insert);
	});

	test('should return OperationType.Insert for INSERT statement with SELECT used to specify values', () => {
		const sql: string = 'INSERT INTO users (name) SELECT "John"';
		const result: string = getOperationTypeFromSql(sql);
		expect(result).toBe(OperationType.Insert);
	});

	test('should return OperationType.Update for UPDATE statement', () => {
		const sql: string = 'UPDATE users SET active = 1 WHERE id > 5';
		const result: string = getOperationTypeFromSql(sql);
		expect(result).toBe(OperationType.Update);
	});

	test('should return OperationType.Delete for DELETE statement', () => {
		const sql: string = 'DELETE FROM users WHERE id < 10';
		const result: string = getOperationTypeFromSql(sql);
		expect(result).toBe(OperationType.Delete);
	});

	test('should return OperationType.Unknown for unrecognized statement', () => {
		const sql: string = 'ALTER TABLE users ADD COLUMN age INT';
		const result: string = getOperationTypeFromSql(sql);
		expect(result).toBe(OperationType.Unknown);
	});
});
