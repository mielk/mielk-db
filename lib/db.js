import { Update } from './actions/update';
const db = (config, fields) => {
    return {
        // update: async (table, json, id, fields) => update(config, table, json, id, fields),
        update: () => new Update(config, fields),
    };
};
export default db;
