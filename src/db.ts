import { Update } from './actions/update';
import { IFieldsManager } from './models/fields';
import { ConnectionData } from './models/sql';

const db = (config: ConnectionData, fields?: IFieldsManager) => {
	return {
		// update: async (table, json, id, fields) => update(config, table, json, id, fields),
		update: () => new Update(config, fields),
	};
};

export default db;
