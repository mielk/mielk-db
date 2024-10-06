import { escape } from 'mysql2/promise';
import { WhereCondition, OrderRule, WhereOperator } from './models/sql.js';
import { strings, variables } from 'mielk-fn';
import { DbFieldsMap } from './models/fields.js';
import { DbRecord } from './models/records.js';

const defaultIsActiveField = 'is_active';

let _fieldsMap: DbFieldsMap = {};

// Errors
const throwError = {
	ifEmptyTableProcName: (value: any, varName: string): void => {
		if (!value || typeof value !== 'string') throw new Error(`Parameter [${varName}] must be a non-empty string`);
	},
	ifNotNonEmptyObject: (value: any, varName: string): void => {
		if (!variables.isObject(value) || Object.keys(value).length === 0)
			throw new Error(`Parameter [${varName}] must be an object with at least one property`);
	},
	ifNotNonEmptyArrayOfWhereConditions: (value: any, varName: string): void => {
		if (!Array.isArray(value) || value.length === 0)
			throw new Error(`Parameter [${varName}] must be an array with at least one WhereCondition object`);
	},
	ifArrayContainNonPrimitiveValues: () => {
		throw new Error('Parameter [array] can contain only non-primitive values');
	},
};

//Technical functions
const convertValue = (value: any): string => {
	if (value === false) return '0';
	if (value === true) return '1';
	if (value === null) return 'NULL';
	return escape(value);
};

const columnName = (key: string): string => _fieldsMap[key] || key;

// Actual methods
const getSelect = (
	select: string[] = [],
	from: string,
	where: WhereCondition[] = [],
	order: OrderRule[] = [],
	fieldsMap: DbFieldsMap
): string => {
	throwError.ifEmptyTableProcName(from, 'from');
	_fieldsMap = fieldsMap;

	const _select = select.length ? select.map((field) => columnName(field)).join(', ') : '*';
	const _where = where.length ? `WHERE ${where.map((w) => createWhereStatement(w)).join(' AND ')}` : '';
	const _order = order.length ? `ORDER BY ${order.map((o) => createOrderStatement(o)).join(', ')}` : '';
	return strings.clear(`SELECT ${_select} FROM ${from} ${_where} ${_order}`);
};

const getInsert = (table: string, object: DbRecord, fieldsMap: DbFieldsMap) => {
	throwError.ifEmptyTableProcName(table, 'table');
	throwError.ifNotNonEmptyObject(object, 'object');
	_fieldsMap = fieldsMap;

	const entries = Object.entries(object);
	const fields = entries.map((e) => columnName(e[0])).join(', ');
	const values = entries.map((e) => escape(e[1])).join(', ');
	return `INSERT INTO ${table} (${fields}) VALUES (${values})`;
};

function getUpdate(table: string, object: DbRecord, where: WhereCondition[], fieldsMap: DbFieldsMap): string {
	throwError.ifEmptyTableProcName(table, 'table');
	throwError.ifNotNonEmptyObject(object, 'object');
	throwError.ifNotNonEmptyArrayOfWhereConditions(where, 'where');
	_fieldsMap = fieldsMap;

	const entries = Object.entries(object);
	const _set = entries.map(([key, value]) => `${columnName(key)} = ${escape(value)}`).join(', ');
	const _where = where.map((w) => createWhereStatement(w)).join(' AND ');
	return `UPDATE ${table} SET ${_set} WHERE ${_where}`;
}

function getDelete(table: string, where: WhereCondition[], fieldsMap: DbFieldsMap): string {
	throwError.ifEmptyTableProcName(table, 'table');
	throwError.ifNotNonEmptyArrayOfWhereConditions(where, 'where');
	_fieldsMap = fieldsMap;

	const _where = where.map((w) => createWhereStatement(w)).join(' AND ');
	return `DELETE FROM ${table} WHERE ${_where}`;
}

function getDeactivate(table: string, where: WhereCondition[], fieldsMap: DbFieldsMap): string {
	throwError.ifEmptyTableProcName(table, 'table');
	throwError.ifNotNonEmptyArrayOfWhereConditions(where, 'where');
	_fieldsMap = fieldsMap;

	const isActiveField = fieldsMap.isActive || defaultIsActiveField;
	const _where = where.map((w) => createWhereStatement(w)).join(' AND ');
	return `UPDATE ${table} SET ${isActiveField} = 0 WHERE ${_where}`;
}

function getCallProc(procName: string): string;
function getCallProc(procName: string, params: string | number | boolean | null): string;
function getCallProc(procName: string, params: (string | number | boolean | null)[]): string;
function getCallProc(
	procName: string,
	params?: (string | number | boolean | null) | (string | number | boolean | null)[]
): string {
	throwError.ifEmptyTableProcName(procName, 'procName');
	const _params: (string | number | boolean | null)[] = [];
	if (params === undefined) {
		// Array [_params] should remain empty.
	} else if (variables.isPrimitive(params, true)) {
		const param: string | number | boolean | null = params as string | number | boolean | null;
		_params.push(convertValue(param));
	} else if (variables.isArrayOfPrimitives(params)) {
		const arr: (string | number | boolean | null)[] = params as (string | number | boolean | null)[];
		_params.splice(0, 0, ...arr.map((item) => convertValue(item)));
	} else if (Array.isArray(params) && params.length === 0) {
		// Array [_params] should remain empty.
	} else {
		throwError.ifArrayContainNonPrimitiveValues();
	}
	return `CALL ${procName}(${_params.join(', ')})`;
}

const createWhereStatement = (condition: WhereCondition): string => {
	const { field, operator, value } = condition;

	if (operator === WhereOperator.In || operator === WhereOperator.NotIn) {
		return createWhereInStatement(condition);
	} else if (condition.value === null) {
		const isNegativeOperator = [WhereOperator.NotEqual, WhereOperator.NotIn, WhereOperator.NotLike].includes(operator);
		return `${columnName(field)} IS ${isNegativeOperator ? 'NOT ' : ''} NULL`;
	} else {
		return `${columnName(field)} ${operator} ${convertValue(value)}`;
	}
};

const createWhereInStatement = (condition: WhereCondition): string => {
	const { field, operator, value } = condition;

	if (!variables.isPrimitive(value, true) && !variables.isArrayOfPrimitives(value, true))
		throw new Error('Invalid data type of [value]. Expected primitive or array of primitives');

	const _values = Array.isArray(value) ? [...new Set(value)] : [value];
	const nullIndex = _values.findIndex((item) => item === null);
	const parts = [];

	if (nullIndex >= 0) {
		parts.push(`${columnName(field)} IS ${operator === WhereOperator.In ? '' : 'NOT '}NULL`);
		_values.splice(nullIndex, 1);
	}

	if (_values.length) {
		parts.unshift(`${columnName(field)} ${operator} (${_values.map((v: any) => escape(v)).join(', ')})`);
	}

	if (parts.length > 1) {
		return `(${parts.join(' OR ')})`;
	} else {
		return parts[0];
	}
};

const createOrderStatement = (rule: OrderRule): string => `${columnName(rule.field)} ${rule.ascending ? ' ASC' : ' DESC'}`;

export { getSelect, getInsert, getUpdate, getDelete, getDeactivate, getCallProc };

export default { getSelect, getInsert, getUpdate, getDelete, getDeactivate, getCallProc };
