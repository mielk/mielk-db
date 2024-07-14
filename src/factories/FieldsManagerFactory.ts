import { FieldsManager } from '../fieldsManager';
import { DbStructure, IFieldsManager } from '../models/fields';

class FieldsManagerFactory {
	create = (dbStructure: DbStructure): IFieldsManager => {
		return new FieldsManager(dbStructure);
	};
}

const instance: FieldsManagerFactory = new FieldsManagerFactory();

export default instance;
