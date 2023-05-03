import mysql from '../mysql.js';
import sqlBuilder from '../sqlBuilder.js';

const del = async (config, table, conditions, fields) =>
	exec(config, sqlBuilder.getDelete(table, conditions, fields), (res) => res.affectedRows);

const deactivate = async (table, conditions, fields) =>
	exec(config, sqlBuilder.getDeactivate(table, conditions, fields), (res) => res.changedRows);

const exec = async (config, sql, resultFn) => {
	const response = await mysql.query(config, sql);
	return resultFn(response);
};

export { del, deactivate };
