import { Update } from './actions/update';
import { Select } from './actions/select';
import { DbStructure, IFieldsManager } from './models/fields';
import { ConnectionData } from './models/sql';

const db = (config: ConnectionData, dbStructure?: DbStructure) => {
	return {
		// update: async (table, json, id, fields) => update(config, table, json, id, fields),
		select: () => new Select(config, dbStructure),
		update: () => new Update(config, dbStructure),
	};
};

export { db };

export default db;
