import { Update } from './actions/update.js';
import { Select } from './actions/select.js';
import { Delete } from './actions/delete.js';
import { Insert } from './actions/insert.js';
import { Proc } from './actions/proc.js';
import { ConnectionData } from './models/sql.js';
import { createPool, Pool } from 'mysql2/promise';

let pool: Pool;
const connData: ConnectionData = {
	host: 'localhost',
	user: 'your_user',
	password: 'your_pass',
	database: 'your_db',
};

const setConnectionDetails = (connectionData: ConnectionData) => {
	const { host, user, password, database } = connectionData;
	connData.host = host;
	connData.user = user;
	connData.password = password;
	connData.database = database;

	pool = createPool({
		host: host,
		user: user,
		password: password,
		database: database,
		charset: 'utf8mb4',
		waitForConnections: true,
		connectionLimit: 10, // Adjust depending on your needs
		queueLimit: 0,
	});
};

const select = () => new Select(connData);

const update = () => new Update(connData);

const del = () => new Delete(connData);

const insert = () => new Insert(connData);

const proc = () => new Proc();

const getPool = (): Pool => pool;

export { setConnectionDetails, select, update, del, insert, proc, getPool };
export default {
	setConnectionDetails,
	select,
	update,
	del,
	insert,
	proc,
	getPool,
};
