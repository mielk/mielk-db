import { escape } from 'mysql2/promise';

const defaultIsActiveField = 'is_active';

const getSelect = ({ select = [], from, where = [], order = [] }) => {
	const _select = select.length ? select.map((f) => field(f)).join(', ') : '*';
	const _where = where.length ? `WHERE ${where.map((w) => createWhereStatement(w)).join(', ')}` : '';
	const _order = order.length
		? `ORDER BY ${order.map((o) => createOrderStatement(o)).join(' AND ')}`
		: '';
	return `SELECT ${_select} FROM ${from} ${_where} ${_order}`.trim();
};

const getInsert = (table, object, fieldsMap) => {
	const columnName = (key) => fieldsMap[key] || key;
	const entries = Object.entries(object);
	const fields = entries.map((e) => columnName(e[0])).join(', ');
	const values = entries.map((e) => escape(e[1])).join(', ');
	return `INSERT INTO ${table}(${fields}) SELECT ${values}`;
};

const getUpdate = (table, object, id, fieldsMap) => {
	const columnName = (key) => fieldsMap[key] || key;
	const entries = Object.entries(object);
	const set = entries.map((e) => `${columnName(e[0])} = ${escape(e[1])}`).join(', ');
	const where = `${columnName('id')} = ${id}`;
	return `UPDATE ${table} SET ${set} WHERE ${where}`;
};

const getDelete = (table, conditions, fields) => {
	const where = convertObjectToWhere(conditions || {}, fields);
	return `DELETE FROM ${table} WHERE ${where}`;
};

const getDeactivate = (table, conditions, fields) => {
	const isActiveField = fields.isActive || defaultIsActiveField;
	const where = convertObjectToWhere(conditions || {}, fields);
	return `UPDATE ${table} SET ${isActiveField} = 0 WHERE ${where}`;
};

const getCallProc = (procName, params) => `CALL ${procName} (${params.map((v) => escape(v)).join(', ')})`;

const convertObjectToWhere = (obj, fields) => {
	const columnName = (key) => (fields || {})[key] || key;
	const entries = Object.entries(obj);
	const conditions = entries.map(([key, value]) => {
		return `${columnName(key)} = ${escape(+value)}`;
	});
	return conditions.join(' AND ');
};

const createWhereStatement = (obj) => {
	if (obj.iin) {
		return `${obj.field} IN (${obj.values.map((v) => escape(v)).join(', ')})`;
	} else {
		return `${obj.field} ${obj.operator} ${escape(obj.comparison)}`;
	}
};

const createOrderStatement = (obj) => `${obj.field} ${obj.ascending ? ' ASC' : ' DESC'}`;

export default { getSelect, getInsert, getUpdate, getDelete, getDeactivate, getCallProc };
