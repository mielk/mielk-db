import FieldsMapperFactory from '../../src/factories/FieldsMapperFactory';
import { FieldsMapper } from '../../src/fieldsMapper';
import { IFieldsMapper } from '../../src/models/fields';

describe('create', () => {
	test('should create an instance of FieldsMapper class', () => {
		const fieldsManager: IFieldsMapper = FieldsMapperFactory.create();
		expect(fieldsManager).toBeInstanceOf(FieldsMapper);
	});
});
