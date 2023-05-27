import { WhereOperator, WhereCondition } from '../src/models/statement';
import builder from '../src/sqlBuilder';

describe('getSelect', () => {
	test('should throw an error if no table name is provided', () => {
		expect(() => {
			builder.getSelect([], '', [], []);
		}).toThrow(new Error('Parameter [from] must be a non-empty string'));
	});

	test('should throw an error if table name is undefined', () => {
		expect(() => {
			builder.getSelect([], undefined as unknown as string, [], []);
		}).toThrow(new Error('Parameter [from] must be a non-empty string'));
	});

	test('should return a SELECT * statement if no fields are provided', () => {
		expect(builder.getSelect([], 'users', [], [])).toBe('SELECT * FROM users');
	});

	test('should correctly build a query with specified fields', () => {
		expect(builder.getSelect(['id', 'name'], 'users', [], [])).toBe('SELECT id, name FROM users');
	});

	test('should correctly build a query with a WHERE clause', () => {
		expect(
			builder.getSelect(['id', 'name'], 'users', [{ field: 'id', operator: WhereOperator.Equal, value: 1 }], [])
		).toBe('SELECT id, name FROM users WHERE id = 1');
	});

	test('should correctly build a query with an ORDER BY clause', () => {
		expect(builder.getSelect(['id', 'name'], 'users', [], [{ field: 'name', ascending: true }])).toBe(
			'SELECT id, name FROM users ORDER BY name ASC'
		);
	});

	test('should correctly build a query with multiple WHERE clauses', () => {
		expect(
			builder.getSelect(
				['id', 'name'],
				'users',
				[
					{ field: 'id', operator: WhereOperator.Equal, value: 1 },
					{ field: 'name', operator: WhereOperator.Equal, value: 'John' },
				],
				[]
			)
		).toBe("SELECT id, name FROM users WHERE id = 1 AND name = 'John'");
	});

	test('should correctly build a query with multiple ORDER BY clauses', () => {
		expect(
			builder.getSelect(
				['id', 'name'],
				'users',
				[],
				[
					{ field: 'name', ascending: true },
					{ field: 'id', ascending: false },
				]
			)
		).toBe('SELECT id, name FROM users ORDER BY name ASC, id DESC');
	});

	test('should correctly handle an undefined WHERE clause', () => {
		expect(builder.getSelect(['id', 'name'], 'users', undefined, [])).toBe('SELECT id, name FROM users');
	});

	test('should correctly handle an undefined ORDER BY clause', () => {
		expect(builder.getSelect(['id', 'name'], 'users', [], undefined)).toBe('SELECT id, name FROM users');
	});

	test('should correctly build a query with both WHERE and ORDER BY clauses', () => {
		expect(
			builder.getSelect(
				['id', 'name'],
				'users',
				[{ field: 'id', operator: WhereOperator.Equal, value: 1 }],
				[{ field: 'name', ascending: true }]
			)
		).toBe('SELECT id, name FROM users WHERE id = 1 ORDER BY name ASC');
	});

	test('should correctly handle an undefined SELECT clause and an undefined WHERE clause', () => {
		expect(builder.getSelect(undefined, 'users', undefined, [])).toBe('SELECT * FROM users');
	});

	test('should correctly handle an undefined SELECT clause and a defined WHERE clause', () => {
		expect(builder.getSelect(undefined, 'users', [{ field: 'id', operator: WhereOperator.Equal, value: 1 }], [])).toBe(
			'SELECT * FROM users WHERE id = 1'
		);
	});

	test('should correctly build a query with a greater than WHERE clause', () => {
		expect(
			builder.getSelect(['id', 'name'], 'users', [{ field: 'id', operator: WhereOperator.GreaterThan, value: 1 }], [])
		).toBe('SELECT id, name FROM users WHERE id > 1');
	});

	test('should correctly build a query with a less than WHERE clause', () => {
		expect(
			builder.getSelect(['id', 'name'], 'users', [{ field: 'id', operator: WhereOperator.LessThan, value: 1 }], [])
		).toBe('SELECT id, name FROM users WHERE id < 1');
	});

	test('should correctly build a query with a greater equal than WHERE clause', () => {
		expect(
			builder.getSelect(
				['id', 'name'],
				'users',
				[{ field: 'id', operator: WhereOperator.GreaterEqualThan, value: 1 }],
				[]
			)
		).toBe('SELECT id, name FROM users WHERE id >= 1');
	});

	test('should correctly build a query with a less equal than WHERE clause', () => {
		expect(
			builder.getSelect(
				['id', 'name'],
				'users',
				[{ field: 'id', operator: WhereOperator.LessEqualThan, value: 1 }],
				[]
			)
		).toBe('SELECT id, name FROM users WHERE id <= 1');
	});

	test('should correctly build a query with an IN clause and a single value', () => {
		expect(builder.getSelect(['id', 'name'], 'users', [{ field: 'id', operator: WhereOperator.In, value: 1 }], [])).toBe(
			'SELECT id, name FROM users WHERE id IN (1)'
		);
	});

	test('should correctly build a query with an IN clause and an array of values', () => {
		expect(
			builder.getSelect(['id', 'name'], 'users', [{ field: 'id', operator: WhereOperator.In, value: [1, 2, 3] }], [])
		).toBe('SELECT id, name FROM users WHERE id IN (1, 2, 3)');
	});

	test('should throw an error if IN operator is used but value is not a primitive or array of primitives', () => {
		expect(() => {
			const value = {} as unknown as string | number | boolean | null;
			builder.getSelect(['id', 'name'], 'users', [{ field: 'id', operator: WhereOperator.In, value: value }], []);
		}).toThrow('Invalid data type of [value]. Expected primitive or array of primitives');
	});

	test('should correctly handle multiple IN clauses', () => {
		expect(
			builder.getSelect(
				['id', 'name'],
				'users',
				[
					{ field: 'id', operator: WhereOperator.In, value: [1, 2, 3] },
					{ field: 'name', operator: WhereOperator.In, value: ['John', 'Jane'] },
				],
				[]
			)
		).toBe("SELECT id, name FROM users WHERE id IN (1, 2, 3) AND name IN ('John', 'Jane')");
	});

	test('should correctly handle IN clause with null', () => {
		expect(
			builder.getSelect(['id', 'name'], 'users', [{ field: 'id', operator: WhereOperator.In, value: null }], [])
		).toBe('SELECT id, name FROM users WHERE id IS NULL');
	});

	test('should correctly handle IN clause with array with duplicates', () => {
		expect(
			builder.getSelect(['id', 'name'], 'users', [{ field: 'id', operator: WhereOperator.In, value: [1, 1, 2] }], [])
		).toBe('SELECT id, name FROM users WHERE id IN (1, 2)');
	});

	test('should correctly handle IN clause with array with null', () => {
		expect(
			builder.getSelect(
				['id', 'name'],
				'users',
				[{ field: 'id', operator: WhereOperator.In, value: [1, 1, 2, null] }],
				[]
			)
		).toBe('SELECT id, name FROM users WHERE (id IN (1, 2) OR id IS NULL)');
	});

	test('should correctly handle NOT IN clause with array with null', () => {
		expect(
			builder.getSelect(
				['id', 'name'],
				'users',
				[{ field: 'id', operator: WhereOperator.NotIn, value: [1, 1, 2, null] }],
				[]
			)
		).toBe('SELECT id, name FROM users WHERE (id NOT IN (1, 2) OR id IS NOT NULL)');
	});

	test('should throw an error if an IN clause is used but value is empty array', () => {
		expect(() => {
			builder.getSelect(['id', 'name'], 'users', [{ field: 'id', operator: WhereOperator.In, value: [] }], []);
		}).toThrow('Invalid data type of [value]. Expected primitive or array of primitives');
	});

	test('should throw an error if IN operator is used and value is an array with non-primitives', () => {
		expect(() => {
			const value = [1, 'two', { three: 3 }] as unknown as string | number | boolean | null;
			builder.getSelect(['id', 'name'], 'users', [{ field: 'id', operator: WhereOperator.In, value: value }], []);
		}).toThrow('Invalid data type of [value]. Expected primitive or array of primitives');
	});

	test('should replace properties given in [select] by other names based on the fieldsMap', () => {
		expect(builder.getSelect(['id', 'name'], 'users', [], [], { id: 'user_id', name: 'user_name' })).toEqual(
			'SELECT user_id, user_name FROM users'
		);
	});

	test('should replace some properties and not others if they do not exist in the fieldsMap', () => {
		expect(builder.getSelect(['id', 'name'], 'users', [], [], { id: 'user_id' })).toEqual(
			'SELECT user_id, name FROM users'
		);
	});

	test('should replace some properties used in WHERE clause by other names based on the fieldsMap', () => {
		expect(
			builder.getSelect(
				['id', 'name'],
				'users',
				[{ field: 'name', operator: WhereOperator.Equal, value: 'John' }],
				[],
				{
					id: 'user_id',
					name: 'user_name',
				}
			)
		).toEqual("SELECT user_id, user_name FROM users WHERE user_name = 'John'");
	});

	test('should replace some properties used in WHERE IN clause by other names based on the fieldsMap', () => {
		expect(
			builder.getSelect(['id', 'name'], 'users', [{ field: 'name', operator: WhereOperator.In, value: 'John' }], [], {
				id: 'user_id',
				name: 'user_name',
			})
		).toEqual("SELECT user_id, user_name FROM users WHERE user_name IN ('John')");
	});

	test('should replace some properties used in ORDER BY clause by other names based on the fieldsMap', () => {
		expect(
			builder.getSelect(['id', 'name'], 'users', [], [{ field: 'name', ascending: true }], {
				id: 'user_id',
				name: 'user_name',
			})
		).toEqual('SELECT user_id, user_name FROM users ORDER BY user_name ASC');
	});

	test('should not replace properties if they do not exist in the fieldsMap', () => {
		expect(builder.getSelect(['id', 'name'], 'users', [], [], {})).toEqual('SELECT id, name FROM users');
	});

	test('should correctly build a query with a LIKE in WHERE clause', () => {
		const select = ['name'];
		const from = 'users';
		const where = [{ field: 'name', operator: WhereOperator.Like, value: '%John%' }];
		const sql = builder.getSelect(select, from, where);
		expect(sql).toEqual("SELECT name FROM users WHERE name LIKE '%John%'");
	});

	test('should correctly build a query with a NOT LIKE in WHERE clause', () => {
		const select = ['name'];
		const from = 'users';
		const where = [{ field: 'name', operator: WhereOperator.NotLike, value: '%John%' }];
		const sql = builder.getSelect(select, from, where);
		expect(sql).toEqual("SELECT name FROM users WHERE name NOT LIKE '%John%'");
	});

	test('should correctly build a query with a NOT IN in WHERE clause', () => {
		const select = ['name'];
		const from = 'users';
		const where = [{ field: 'id', operator: WhereOperator.NotIn, value: [1, 2, 3] }];
		const sql = builder.getSelect(select, from, where);
		expect(sql).toEqual('SELECT name FROM users WHERE id NOT IN (1, 2, 3)');
	});

	test('should correctly build a query with a not equal in WHERE clause', () => {
		const select = ['name'];
		const from = 'users';
		const where = [{ field: 'id', operator: WhereOperator.NotEqual, value: 1 }];
		const sql = builder.getSelect(select, from, where);
		expect(sql).toEqual('SELECT name FROM users WHERE id <> 1');
	});

	test('should correctly build a query with a null as a value in WhereCondition and Equal operator', () => {
		const select = ['name'];
		const from = 'users';
		const where = [{ field: 'name', operator: WhereOperator.Equal, value: null }];
		const sql = builder.getSelect(select, from, where);
		expect(sql).toEqual('SELECT name FROM users WHERE name IS NULL');
	});

	test('should correctly build a query with a null as a value in WhereCondition and NotEqual operator', () => {
		const select = ['name'];
		const from = 'users';
		const where = [{ field: 'name', operator: WhereOperator.NotEqual, value: null }];
		const sql = builder.getSelect(select, from, where);
		expect(sql).toEqual('SELECT name FROM users WHERE name IS NOT NULL');
	});

	test('should correctly build a query with true as a value in WhereCondition', () => {
		const select = ['name'];
		const from = 'users';
		const where = [{ field: 'is_active', operator: WhereOperator.Equal, value: true }];
		const sql = builder.getSelect(select, from, where);
		expect(sql).toEqual('SELECT name FROM users WHERE is_active = 1');
	});

	test('should correctly build a query with false as a value in WhereCondition', () => {
		const select = ['name'];
		const from = 'users';
		const where = [{ field: 'is_active', operator: WhereOperator.Equal, value: false }];
		const sql = builder.getSelect(select, from, where);
		expect(sql).toEqual('SELECT name FROM users WHERE is_active = 0');
	});
});

describe('getInsert', () => {
	test('should throw an error if table name is empty', () => {
		expect(() => {
			builder.getInsert('', { name: 'John', age: 42 }, { name: 'user_name', age: 'user_age' });
		}).toThrow(new Error('Parameter [table] must be a non-empty string'));
	});

	test('should throw an error if table name is undefined', () => {
		expect(() => {
			builder.getInsert(undefined as any, { name: 'John', age: 42 }, { name: 'user_name', age: 'user_age' });
		}).toThrow(new Error('Parameter [table] must be a non-empty string'));
	});

	test('should throw an error if table name is not a string', () => {
		expect(() => {
			builder.getInsert(123 as any, { name: 'John', age: 42 }, { name: 'user_name', age: 'user_age' });
		}).toThrow(new Error('Parameter [table] must be a non-empty string'));
	});

	test('should throw an error if object is empty', () => {
		expect(() => {
			builder.getInsert('users', {}, { name: 'user_name', age: 'user_age' });
		}).toThrow(new Error('Parameter [object] must be an object with at least one property'));
	});

	test('should throw an error if object is not an object', () => {
		expect(() => {
			builder.getInsert('users', 'John' as any, { name: 'user_name', age: 'user_age' });
		}).toThrow(new Error('Parameter [object] must be an object with at least one property'));
	});

	test('should return correct INSERT command if fieldsMap is provided', () => {
		const result = builder.getInsert('users', { name: 'John', age: 42 }, { name: 'user_name', age: 'user_age' });
		expect(result).toEqual("INSERT INTO users (user_name, user_age) VALUES ('John', 42)");
	});

	test('should return correct INSERT command if fieldsMap is not provided', () => {
		const result = builder.getInsert('users', { name: 'John', age: 42 });
		expect(result).toEqual("INSERT INTO users (name, age) VALUES ('John', 42)");
	});

	test('should return correct INSERT command if fieldsMap is provided but not for all properties', () => {
		const result = builder.getInsert('users', { name: 'John', age: 42 }, { name: 'user_name' });
		expect(result).toEqual("INSERT INTO users (user_name, age) VALUES ('John', 42)");
	});
});

describe('getUpdate', () => {
	test('should throw an error if table name is empty', () => {
		expect(() => builder.getUpdate('', { name: 'John', age: 42 }, 1)).toThrowError(
			'Parameter [table] must be a non-empty string'
		);
	});
	test('should throw an error if table name is undefined', () => {
		expect(() => builder.getUpdate(undefined as unknown as string, { name: 'John', age: 42 }, 1)).toThrowError(
			'Parameter [table] must be a non-empty string'
		);
	});
	test('should throw an error if object is empty', () => {
		expect(() => builder.getUpdate('users', {}, 1)).toThrowError(
			'Parameter [object] must be an object with at least one property'
		);
	});
	test('should throw an error if object is not of object type', () => {
		expect(() => builder.getUpdate('users', 'John' as unknown as { [key: string]: string | number }, 1)).toThrowError(
			'Parameter [object] must be an object with at least one property'
		);
	});
	test('should use the original property names if fieldsMap is not provided', () => {
		const result = builder.getUpdate('users', { name: 'John', age: 42 }, 1);
		expect(result).toEqual("UPDATE users SET name = 'John', age = 42 WHERE id = 1");
	});
	test('should use the fieldsMap for property names if provided', () => {
		const result = builder.getUpdate('users', { name: 'John', age: 42 }, 1, {
			name: 'user_name',
			age: 'user_age',
			id: 'user_id',
		});
		expect(result).toEqual("UPDATE users SET user_name = 'John', user_age = 42 WHERE user_id = 1");
	});
	test('should use the original property names for those not found in fieldsMap', () => {
		const result = builder.getUpdate('users', { name: 'John', age: 42, gender: 'male' }, 1, {
			name: 'user_name',
			age: 'user_age',
		});
		expect(result).toEqual("UPDATE users SET user_name = 'John', user_age = 42, gender = 'male' WHERE id = 1");
	});

	test('should handle complex conditions in the where array', () => {
		const obj = { name: 'John', age: 42 };
		const where = [
			{ field: 'name', operator: WhereOperator.Equal, value: 'John' },
			{ field: 'age', operator: WhereOperator.LessThan, value: 30 },
		];
		const result = builder.getUpdate('users', obj, where, { name: 'user_name', age: 'user_age' });
		expect(result).toBe("UPDATE users SET user_name = 'John', user_age = 42 WHERE user_name = 'John' AND user_age < 30");
	});

	test('should correctly build a query with a greater than WHERE clause', () => {
		const obj = { name: 'John', age: 42 };
		expect(builder.getUpdate('users', obj, [{ field: 'id', operator: WhereOperator.GreaterThan, value: 1 }])).toBe(
			"UPDATE users SET name = 'John', age = 42 WHERE id > 1"
		);
	});

	test('should correctly build a query with a less than WHERE clause', () => {
		const obj = { name: 'John', age: 42 };
		expect(builder.getUpdate('users', obj, [{ field: 'id', operator: WhereOperator.LessThan, value: 1 }])).toBe(
			"UPDATE users SET name = 'John', age = 42 WHERE id < 1"
		);
	});

	test('should correctly build a query with a greater equal than WHERE clause', () => {
		const obj = { name: 'John', age: 42 };
		expect(builder.getUpdate('users', obj, [{ field: 'id', operator: WhereOperator.GreaterEqualThan, value: 1 }])).toBe(
			"UPDATE users SET name = 'John', age = 42 WHERE id >= 1"
		);
	});

	test('should correctly build a query with a less equal than WHERE clause', () => {
		const obj = { name: 'John', age: 42 };
		expect(builder.getUpdate('users', obj, [{ field: 'id', operator: WhereOperator.LessEqualThan, value: 1 }])).toBe(
			"UPDATE users SET name = 'John', age = 42 WHERE id <= 1"
		);
	});

	test('should correctly build a query with an IN clause and a single value', () => {
		const obj = { name: 'John', age: 42 };
		expect(builder.getUpdate('users', obj, [{ field: 'id', operator: WhereOperator.In, value: 1 }])).toBe(
			"UPDATE users SET name = 'John', age = 42 WHERE id IN (1)"
		);
	});

	test('should correctly build a query with an IN clause and an array of values', () => {
		const obj = { name: 'John', age: 42 };
		expect(builder.getUpdate('users', obj, [{ field: 'id', operator: WhereOperator.In, value: [1, 2, 3] }])).toBe(
			"UPDATE users SET name = 'John', age = 42 WHERE id IN (1, 2, 3)"
		);
	});

	test('should throw an error if IN operator is used but value is not a primitive or array of primitives', () => {
		const obj = { name: 'John', age: 42 };
		expect(() => {
			const value = {} as unknown as string | number | boolean | null;
			builder.getUpdate('users', obj, [{ field: 'id', operator: WhereOperator.In, value: value }]);
		}).toThrow('Invalid data type of [value]. Expected primitive or array of primitives');
	});

	test('should correctly handle multiple IN clauses', () => {
		const obj = { name: 'John', age: 42 };
		expect(
			builder.getUpdate('users', obj, [
				{ field: 'id', operator: WhereOperator.In, value: [1, 2, 3] },
				{ field: 'name', operator: WhereOperator.In, value: ['John', 'Jane'] },
			])
		).toBe("UPDATE users SET name = 'John', age = 42 WHERE id IN (1, 2, 3) AND name IN ('John', 'Jane')");
	});

	test('should correctly handle IN clause with null', () => {
		const obj = { name: 'John', age: 42 };
		expect(builder.getUpdate('users', obj, [{ field: 'id', operator: WhereOperator.In, value: null }])).toBe(
			"UPDATE users SET name = 'John', age = 42 WHERE id IS NULL"
		);
	});

	test('should correctly handle IN clause with array with duplicates', () => {
		const obj = { name: 'John', age: 42 };
		expect(builder.getUpdate('users', obj, [{ field: 'id', operator: WhereOperator.In, value: [1, 1, 2] }])).toBe(
			"UPDATE users SET name = 'John', age = 42 WHERE id IN (1, 2)"
		);
	});

	test('should correctly handle IN clause with array with null', () => {
		const obj = { name: 'John', age: 42 };
		expect(builder.getUpdate('users', obj, [{ field: 'id', operator: WhereOperator.In, value: [1, 1, 2, null] }])).toBe(
			"UPDATE users SET name = 'John', age = 42 WHERE (id IN (1, 2) OR id IS NULL)"
		);
	});

	test('should correctly handle NOT IN clause with array with null', () => {
		const obj = { name: 'John', age: 42 };
		expect(
			builder.getUpdate('users', obj, [{ field: 'id', operator: WhereOperator.NotIn, value: [1, 1, 2, null] }])
		).toBe("UPDATE users SET name = 'John', age = 42 WHERE (id NOT IN (1, 2) OR id IS NOT NULL)");
	});

	test('should throw an error if an IN clause is used but value is empty array', () => {
		const obj = { name: 'John', age: 42 };
		expect(() => {
			builder.getUpdate('users', obj, [{ field: 'id', operator: WhereOperator.In, value: [] }]);
		}).toThrow('Invalid data type of [value]. Expected primitive or array of primitives');
	});

	test('should throw an error if IN operator is used and value is an array with non-primitives', () => {
		const obj = { name: 'John', age: 42 };
		expect(() => {
			const value = [1, 'two', { three: 3 }] as unknown as string | number | boolean | null;
			builder.getUpdate('users', obj, [{ field: 'id', operator: WhereOperator.In, value: value }]);
		}).toThrow('Invalid data type of [value]. Expected primitive or array of primitives');
	});
});

describe('getDelete', () => {
	test('should throw an error if table name is empty', () => {
		expect(() => {
			builder.getDelete('', []);
		}).toThrowError(new Error('Parameter [table] must be a non-empty string'));
	});

	test('should throw an error if table name is undefined', () => {
		expect(() => {
			builder.getDelete(undefined as unknown as string, []);
		}).toThrowError(new Error('Parameter [table] must be a non-empty string'));
	});

	test('should throw an error if where array is empty', () => {
		expect(() => {
			builder.getDelete('users', []);
		}).toThrowError(new Error('Parameter [where] must be an array with at least one WhereCondition object'));
	});

	test('should throw an error if null is provided as where array', () => {
		expect(() => builder.getDelete('users', null as unknown as WhereCondition[], {})).toThrowError(
			'Parameter [where] must be an array with at least one WhereCondition object'
		);
	});

	test('should throw an error if undefined is provided as where array', () => {
		expect(() => builder.getDelete('users', undefined as unknown as WhereCondition[], {})).toThrowError(
			'Parameter [where] must be an array with at least one WhereCondition object'
		);
	});

	test('should return valid SQL command for provided numeric id', () => {
		const result = builder.getDelete('users', 5);
		expect(result).toEqual('DELETE FROM users WHERE id = 5');
	});

	test('should return valid SQL command for provided text id', () => {
		const result = builder.getDelete('users', 'id');
		expect(result).toEqual("DELETE FROM users WHERE id = 'id'");
	});

	test('should return correct DELETE command when fieldsMap is not provided', () => {
		const where = [{ field: 'name', operator: WhereOperator.Equal, value: 'John' }];
		const result = builder.getDelete('users', where);
		expect(result).toBe("DELETE FROM users WHERE name = 'John'");
	});

	test('should return correct DELETE command when fieldsMap is provided', () => {
		const where = [{ field: 'age', operator: WhereOperator.GreaterThan, value: 30 }];
		const result = builder.getDelete('users', where, { age: 'user_age' });
		expect(result).toBe('DELETE FROM users WHERE user_age > 30');
	});

	test('should handle complex conditions in the where array', () => {
		const where = [
			{ field: 'name', operator: WhereOperator.Equal, value: 'John' },
			{ field: 'age', operator: WhereOperator.LessThan, value: 30 },
		];
		const result = builder.getDelete('users', where, { name: 'user_name', age: 'user_age' });
		expect(result).toBe("DELETE FROM users WHERE user_name = 'John' AND user_age < 30");
	});

	test('should correctly build a query with a greater than WHERE clause', () => {
		expect(builder.getDelete('users', [{ field: 'id', operator: WhereOperator.GreaterThan, value: 1 }])).toBe(
			'DELETE FROM users WHERE id > 1'
		);
	});

	test('should correctly build a query with a less than WHERE clause', () => {
		expect(builder.getDelete('users', [{ field: 'id', operator: WhereOperator.LessThan, value: 1 }])).toBe(
			'DELETE FROM users WHERE id < 1'
		);
	});

	test('should correctly build a query with a greater equal than WHERE clause', () => {
		expect(builder.getDelete('users', [{ field: 'id', operator: WhereOperator.GreaterEqualThan, value: 1 }])).toBe(
			'DELETE FROM users WHERE id >= 1'
		);
	});

	test('should correctly build a query with a less equal than WHERE clause', () => {
		expect(builder.getDelete('users', [{ field: 'id', operator: WhereOperator.LessEqualThan, value: 1 }])).toBe(
			'DELETE FROM users WHERE id <= 1'
		);
	});

	test('should correctly build a query with an IN clause and a single value', () => {
		expect(builder.getDelete('users', [{ field: 'id', operator: WhereOperator.In, value: 1 }])).toBe(
			'DELETE FROM users WHERE id IN (1)'
		);
	});

	test('should correctly build a query with an IN clause and an array of values', () => {
		expect(builder.getDelete('users', [{ field: 'id', operator: WhereOperator.In, value: [1, 2, 3] }])).toBe(
			'DELETE FROM users WHERE id IN (1, 2, 3)'
		);
	});

	test('should throw an error if IN operator is used but value is not a primitive or array of primitives', () => {
		expect(() => {
			const value = {} as unknown as string | number | boolean | null;
			builder.getDelete('users', [{ field: 'id', operator: WhereOperator.In, value: value }]);
		}).toThrow('Invalid data type of [value]. Expected primitive or array of primitives');
	});

	test('should correctly handle multiple IN clauses', () => {
		expect(
			builder.getDelete('users', [
				{ field: 'id', operator: WhereOperator.In, value: [1, 2, 3] },
				{ field: 'name', operator: WhereOperator.In, value: ['John', 'Jane'] },
			])
		).toBe("DELETE FROM users WHERE id IN (1, 2, 3) AND name IN ('John', 'Jane')");
	});

	test('should correctly handle IN clause with null', () => {
		expect(builder.getDelete('users', [{ field: 'id', operator: WhereOperator.In, value: null }])).toBe(
			'DELETE FROM users WHERE id IS NULL'
		);
	});

	test('should correctly handle IN clause with array with duplicates', () => {
		expect(builder.getDelete('users', [{ field: 'id', operator: WhereOperator.In, value: [1, 1, 2] }])).toBe(
			'DELETE FROM users WHERE id IN (1, 2)'
		);
	});

	test('should correctly handle IN clause with array with null', () => {
		expect(builder.getDelete('users', [{ field: 'id', operator: WhereOperator.In, value: [1, 1, 2, null] }])).toBe(
			'DELETE FROM users WHERE (id IN (1, 2) OR id IS NULL)'
		);
	});

	test('should correctly handle NOT IN clause with array with null', () => {
		expect(builder.getDelete('users', [{ field: 'id', operator: WhereOperator.NotIn, value: [1, 1, 2, null] }])).toBe(
			'DELETE FROM users WHERE (id NOT IN (1, 2) OR id IS NOT NULL)'
		);
	});

	test('should throw an error if an IN clause is used but value is empty array', () => {
		expect(() => {
			builder.getDelete('users', [{ field: 'id', operator: WhereOperator.In, value: [] }]);
		}).toThrow('Invalid data type of [value]. Expected primitive or array of primitives');
	});

	test('should throw an error if IN operator is used and value is an array with non-primitives', () => {
		expect(() => {
			const value = [1, 'two', { three: 3 }] as unknown as string | number | boolean | null;
			builder.getDelete('users', [{ field: 'id', operator: WhereOperator.In, value: value }]);
		}).toThrow('Invalid data type of [value]. Expected primitive or array of primitives');
	});
});

describe('getDeactivate', () => {
	test('should throw an error if table name is not a string', () => {
		expect(() => builder.getDeactivate(123 as unknown as string, [], {})).toThrowError(
			'Parameter [table] must be a non-empty string'
		);
	});

	test('should throw an error if table name is empty', () => {
		expect(() => builder.getDeactivate('', [], {})).toThrowError('Parameter [table] must be a non-empty string');
	});

	test('should throw an error if undefined is provided as where array', () => {
		expect(() => builder.getDeactivate('users', undefined as unknown as WhereCondition[], {})).toThrowError(
			'Parameter [where] must be an array with at least one WhereCondition object'
		);
	});

	test('should throw an error if null is provided as where array', () => {
		expect(() => builder.getDeactivate('users', null as unknown as WhereCondition[], {})).toThrowError(
			'Parameter [where] must be an array with at least one WhereCondition object'
		);
	});

	test('should throw an error if where array is empty', () => {
		expect(() => builder.getDeactivate('users', [], {})).toThrowError(
			'Parameter [where] must be an array with at least one WhereCondition object'
		);
	});

	test('should return valid SQL command for provided numeric id', () => {
		const result = builder.getDeactivate('users', 5);
		expect(result).toEqual('UPDATE users SET is_active = 0 WHERE id = 5');
	});

	test('should return valid SQL command for provided text id', () => {
		const result = builder.getDeactivate('users', 'id');
		expect(result).toEqual("UPDATE users SET is_active = 0 WHERE id = 'id'");
	});

	test('should return valid SQL command for provided input parameters', () => {
		const where = [{ field: 'id', operator: WhereOperator.Equal, value: 1 }];
		const result = builder.getDeactivate('users', where);
		expect(result).toEqual('UPDATE users SET is_active = 0 WHERE id = 1');
	});

	test('should correctly replace field names based on fieldsMap', () => {
		const where = [{ field: 'id', operator: WhereOperator.Equal, value: 1 }];
		const fieldsMap = { id: 'user_id', isActive: 'active' };
		const result = builder.getDeactivate('users', where, fieldsMap);
		expect(result).toEqual('UPDATE users SET active = 0 WHERE user_id = 1');
	});

	test('should handle complex conditions in the where array', () => {
		const where = [
			{ field: 'name', operator: WhereOperator.Equal, value: 'John' },
			{ field: 'age', operator: WhereOperator.LessThan, value: 30 },
		];
		const result = builder.getDeactivate('users', where, { name: 'user_name', age: 'user_age' });
		expect(result).toBe("UPDATE users SET is_active = 0 WHERE user_name = 'John' AND user_age < 30");
	});

	test('should correctly build a query with a greater than WHERE clause', () => {
		expect(builder.getDeactivate('users', [{ field: 'id', operator: WhereOperator.GreaterThan, value: 1 }])).toBe(
			'UPDATE users SET is_active = 0 WHERE id > 1'
		);
	});

	test('should correctly build a query with a less than WHERE clause', () => {
		expect(builder.getDeactivate('users', [{ field: 'id', operator: WhereOperator.LessThan, value: 1 }])).toBe(
			'UPDATE users SET is_active = 0 WHERE id < 1'
		);
	});

	test('should correctly build a query with a greater equal than WHERE clause', () => {
		expect(builder.getDeactivate('users', [{ field: 'id', operator: WhereOperator.GreaterEqualThan, value: 1 }])).toBe(
			'UPDATE users SET is_active = 0 WHERE id >= 1'
		);
	});

	test('should correctly build a query with a less equal than WHERE clause', () => {
		expect(builder.getDeactivate('users', [{ field: 'id', operator: WhereOperator.LessEqualThan, value: 1 }])).toBe(
			'UPDATE users SET is_active = 0 WHERE id <= 1'
		);
	});

	test('should correctly build a query with an IN clause and a single value', () => {
		expect(builder.getDeactivate('users', [{ field: 'id', operator: WhereOperator.In, value: 1 }])).toBe(
			'UPDATE users SET is_active = 0 WHERE id IN (1)'
		);
	});

	test('should correctly build a query with an IN clause and an array of values', () => {
		expect(builder.getDeactivate('users', [{ field: 'id', operator: WhereOperator.In, value: [1, 2, 3] }])).toBe(
			'UPDATE users SET is_active = 0 WHERE id IN (1, 2, 3)'
		);
	});

	test('should throw an error if IN operator is used but value is not a primitive or array of primitives', () => {
		expect(() => {
			const value = {} as unknown as string | number | boolean | null;
			builder.getDeactivate('users', [{ field: 'id', operator: WhereOperator.In, value: value }]);
		}).toThrow('Invalid data type of [value]. Expected primitive or array of primitives');
	});

	test('should correctly handle multiple IN clauses', () => {
		expect(
			builder.getDeactivate('users', [
				{ field: 'id', operator: WhereOperator.In, value: [1, 2, 3] },
				{ field: 'name', operator: WhereOperator.In, value: ['John', 'Jane'] },
			])
		).toBe("UPDATE users SET is_active = 0 WHERE id IN (1, 2, 3) AND name IN ('John', 'Jane')");
	});

	test('should correctly handle IN clause with null', () => {
		expect(builder.getDeactivate('users', [{ field: 'id', operator: WhereOperator.In, value: null }])).toBe(
			'UPDATE users SET is_active = 0 WHERE id IS NULL'
		);
	});

	test('should correctly handle IN clause with array with duplicates', () => {
		expect(builder.getDeactivate('users', [{ field: 'id', operator: WhereOperator.In, value: [1, 1, 2] }])).toBe(
			'UPDATE users SET is_active = 0 WHERE id IN (1, 2)'
		);
	});

	test('should correctly handle IN clause with array with null', () => {
		expect(builder.getDeactivate('users', [{ field: 'id', operator: WhereOperator.In, value: [1, 1, 2, null] }])).toBe(
			'UPDATE users SET is_active = 0 WHERE (id IN (1, 2) OR id IS NULL)'
		);
	});

	test('should correctly handle NOT IN clause with array with null', () => {
		expect(
			builder.getDeactivate('users', [{ field: 'id', operator: WhereOperator.NotIn, value: [1, 1, 2, null] }])
		).toBe('UPDATE users SET is_active = 0 WHERE (id NOT IN (1, 2) OR id IS NOT NULL)');
	});

	test('should throw an error if an IN clause is used but value is empty array', () => {
		expect(() => {
			builder.getDeactivate('users', [{ field: 'id', operator: WhereOperator.In, value: [] }]);
		}).toThrow('Invalid data type of [value]. Expected primitive or array of primitives');
	});

	test('should throw an error if IN operator is used and value is an array with non-primitives', () => {
		expect(() => {
			const value = [1, 'two', { three: 3 }] as unknown as string | number | boolean | null;
			builder.getDeactivate('users', [{ field: 'id', operator: WhereOperator.In, value: value }]);
		}).toThrow('Invalid data type of [value]. Expected primitive or array of primitives');
	});
});

describe('getCallProc', () => {
	test('should return correct SQL CALL statement when parameters are provided', () => {
		expect(builder.getCallProc('procedure', ['test', 1])).toBe("CALL procedure('test', 1)");
	});

	test('should return correct SQL CALL statement when boolean parameters are provided', () => {
		expect(builder.getCallProc('procedure', ['test', 1, false, true])).toBe("CALL procedure('test', 1, 0, 1)");
	});

	test('should return SQL CALL statement with empty brackets when no parameters are provided', () => {
		expect(builder.getCallProc('procedure')).toBe('CALL procedure()');
	});

	test('should return SQL CALL statement with empty brackets when empty array is provided', () => {
		expect(builder.getCallProc('procedure', [])).toBe('CALL procedure()');
	});

	test('should throw an error if procName is not a string', () => {
		expect(() => {
			// @ts-ignore
			builder.getCallProc(123, ['test', 1]);
		}).toThrow(new Error('Parameter [procName] must be a non-empty string'));
	});

	test('should throw an error if procName is an empty string', () => {
		expect(() => {
			builder.getCallProc('', ['test', 1]);
		}).toThrow(new Error('Parameter [procName] must be a non-empty string'));
	});

	test('should throw an error if params array contains non-primitive values', () => {
		expect(() => {
			// @ts-ignore
			builder.getCallProc('procedure', [{}, 'test']);
		}).toThrow(new Error('Parameter [array] can contain only non-primitive values'));
	});

	test('should return correct SQL CALL statement when single primitive is provided as parameters', () => {
		expect(builder.getCallProc('procedure', 'test')).toBe("CALL procedure('test')");
	});

	test('getCallProc should handle null values correctly', () => {
		expect(builder.getCallProc('procedure', ['test', 1, null])).toBe("CALL procedure('test', 1, NULL)");
	});
});
