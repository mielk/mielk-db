import select from './actions/select.js';
import proc from './actions/proc.js';
import insert from './actions/insert.js';
import update from './actions/update.js';
import { del, deactivate } from './actions/delete.js';

const db = (config) => {
	return {
		select: () => select(config),
		insert: async (table, object, fields) => insert(config, table, object, fields),
		update: async (table, json, id, fields) => update(config, table, json, id, fields),
		del: async (table, conditions, fields) => del(config, table, conditions, fields),
		deactivate: async (table, conditions, fields) => deactivate(config, table, conditions, fields),
		proc: async (name, params, joinRules, fields) => proc(config, name, params, joinRules, fields),
	};
};

export default db;
