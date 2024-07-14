import { objects } from 'mielk-fn';
import { DbFieldsMap, DbStructure, IFieldsManager } from './models/fields';
import { DbTable } from './models/fields';
import { DbRecord, DbRecordSet, MultiRecordSet } from './models/records';

export class FieldsManager implements IFieldsManager {
	private dbStructure: DbStructure;

	constructor(dbStructure: DbStructure) {
		this.dbStructure = dbStructure;
	}

	___getDbStructure = (): DbStructure => this.dbStructure;

	getFieldsMap = (name: string): DbFieldsMap | null => {
		const table: DbTable = this.dbStructure[name];
		return table ? table.fieldsMap : null;
	};

	getFieldName = (name: string, property: string): string | null => {
		const fieldsMap: DbFieldsMap | null = this.getFieldsMap(name);
		return fieldsMap ? fieldsMap[property] || null : null;
	};

	// convertMultiRecordset = (multiRs: MultiRecordSet): MultiRecordSet => {
	// 	const result: MultiRecordSet = {};
	// 	const entries = Object.entries(multiRs);
	// 	entries.forEach((entry: [string, any]) => {
	// 		const [tableName, records] = entry;
	// 		result[tableName] = this.convertRecordset(tableName, records);
	// 	});
	// 	return result;
	// };

	// convertRecordset = (tableName: string, recordset: DbRecordSet): DbRecordSet => {
	// 	const fs: DbTable | undefined = this.dbStructure.get(tableName);
	// 	const fieldsMap: DbFieldsMap = fs ? fs.fieldsMap : {};
	// 	const convertedFieldsMap: DbFieldsMap = objects.invert(fieldsMap);
	// 	return recordset.map((record) => this.convertRecord(record, convertedFieldsMap));
	// };

	// private convertRecord = (record: DbRecord, fields: Record<string, string>): DbRecord => {
	// 	return objects.modifyKeys(record, (key) => fields[key] || key);
	// };
}
