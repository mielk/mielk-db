import { FieldsManager } from '../fieldsManager.js';
import { DbStructure, IFieldsManager } from '../models/fields.js';

class FieldsManagerFactory {
	create = (dbStructure: DbStructure): IFieldsManager => {
		return new FieldsManager(dbStructure);
	};
}

const instance: FieldsManagerFactory = new FieldsManagerFactory();

export default instance;
