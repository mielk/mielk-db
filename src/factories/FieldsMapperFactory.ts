import { FieldsMapper } from '../fieldsMapper.js';
import { IFieldsMapper } from '../models/fields.js';

class FieldsMapperFactory {
	create = (): IFieldsMapper => {
		return new FieldsMapper();
	};
}

const instance: FieldsMapperFactory = new FieldsMapperFactory();

export default instance;
