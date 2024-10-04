import FieldsManagerFactory from '../../src/factories/FieldsManagerFactory';
import { FieldsManager } from '../../src/fieldsManager';
import { DbStructure, IFieldsManager } from '../../src/models/fields';

const dbStructure: DbStructure = {
	users: {
		tableName: 'users',
		key: 'id',
		fieldsMap: {},
	},
};

describe('create', () => {
	test('should create a new instance of FieldsManager class with the given db structure', () => {
		const fieldsManager: IFieldsManager = FieldsManagerFactory.create(dbStructure);
		const expectedFieldsManager: IFieldsManager = new FieldsManager(dbStructure);
		expect(JSON.stringify(fieldsManager)).toEqual(JSON.stringify(expectedFieldsManager));
	});
});
