import mysql from 'mysql2/promise';

async function query(config, sql, params) {
	const connection = await mysql.createConnection(config);
	const [results] = await connection.execute(sql, params);
	return results;
}

export default {
	query,
};
