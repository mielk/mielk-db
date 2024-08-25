import { Update } from './actions/update.js';
import { Select } from './actions/select.js';
import { DbStructure, IFieldsManager } from './models/fields.js';
import { ConnectionData } from './models/sql.js';

const db = (config: ConnectionData, dbStructure?: DbStructure) => {
	return {
		// update: async (table, json, id, fields) => update(config, table, json, id, fields),
		select: () => new Select(config, dbStructure),
		update: () => new Update(config, dbStructure),
	};
};

export { db };

export default db;
