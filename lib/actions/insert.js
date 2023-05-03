import mysql from '../mysql.js';
import sqlBuilder from '../sqlBuilder.js';

const insert = async (table, object, fields) => {
	const sql = sqlBuilder.getInsert(table, object, fields);
	const res = await mysql.query(sql);
	return res.insertId;
};

export default insert;
