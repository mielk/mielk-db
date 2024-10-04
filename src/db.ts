import { Update } from './actions/update.js';
import { Select } from './actions/select.js';
import { Delete } from './actions/delete.js';
import { Insert } from './actions/insert.js';
import { DbStructure } from './models/fields.js';
import { ConnectionData } from './models/sql.js';

const db = (config: ConnectionData, dbStructure?: DbStructure) => {
	return {
		select: () => new Select(config, dbStructure),
		update: () => new Update(config, dbStructure),
		delete: () => new Delete(config, dbStructure),
		insert: () => new Insert(config, dbStructure),
	};
};

export { db };

export default db;
