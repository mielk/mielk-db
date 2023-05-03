import mysql from '../mysql.js';
import sqlBuilder from '../sqlBuilder.js';

const update = async (config, table, json, id, fields) => {
	const sql = sqlBuilder.getUpdate(table, json, id, fields);
	const response = await mysql.query(config, sql);
	return response.affectedRows;
};

export default update;
