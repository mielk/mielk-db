import mysql from '../mysql.js';
import sqlBuilder from '../sqlBuilder.js';

const del = async (table, conditions, fields) =>
	exec(sqlBuilder.getDelete(table, conditions, fields), (res) => res.affectedRows);

const deactivate = async (table, conditions, fields) =>
	exec(sqlBuilder.getDeactivate(table, conditions, fields), (res) => res.changedRows);

const exec = async (sql, resultFn) => {
	const response = await mysql.query(sql);
	return resultFn(response);
};

export { del, deactivate };
