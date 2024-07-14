import FieldsManagerFactory from '../../src/factories/FieldsManagerFactory';
import { FieldsManager } from '../../src/fieldsManager';
import { DbStructure, IFieldsManager } from '../../src/models/fields';

const dbStructure: DbStructure = {
	users: {
		tableName: 'users',
		key: 'id',
		fieldsMap: {
			id: 'user_id',
			name: 'name',
			isActive: 'is_active',
		},
	},
	userLanguages: {
		tableName: 'user_languages',
		key: 'id',
		fieldsMap: {
			id: 'user_language_id',
			userId: 'user_id',
			languageId: 'language_id',
		},
		foreignKeys: [
			{ field: 'userId', table: 'users' },
			{ field: 'languageId', table: 'languages' },
		],
	},
};

describe('create', () => {
	test('should create a new instance of FieldsManager class with the given db structure', () => {
		const fieldsManager: IFieldsManager = FieldsManagerFactory.create(dbStructure);
		const expectedFieldsManager: IFieldsManager = new FieldsManager(dbStructure);
		expect(JSON.stringify(fieldsManager)).toEqual(JSON.stringify(expectedFieldsManager));
	});
});
