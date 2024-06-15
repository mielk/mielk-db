import { objects } from 'mielk-fn';
import { FieldsMap, IFieldsManager } from './models/fields';
import { FieldsSet } from './models/fields';
import { DbRecord, DbRecordSet, MultiRecordSet } from './models/records';

export class FieldsManager implements IFieldsManager {
	private _fieldSets: Map<string, FieldsSet> = new Map<string, FieldsSet>();

	constructor() {}

	countFieldsSets = (): number => this._fieldSets.size;

	addFieldsSet = (key: string, fieldsSet: FieldsSet): void => {
		this._fieldSets.set(key, fieldsSet);
	};

	getFieldsSet = (key: string): FieldsSet | undefined => this._fieldSets.get(key);

	getPropertyToDbFieldMap = (tableName: string): Record<string, string> => {
		const fs: FieldsSet | undefined = this._fieldSets.get(tableName);
		if (fs) {
			return fs.propertyToField;
		} else {
			return {};
		}
	};

	convertMultiRecordset = (multiRs: MultiRecordSet): MultiRecordSet => {
		const result: MultiRecordSet = {};
		const entries = Object.entries(multiRs);
		entries.forEach((entry: [string, any]) => {
			const [tableName, records] = entry;
			result[tableName] = this.convertRecordset(tableName, records);
		});
		return result;
	};

	convertRecordset = (tableName: string, recordset: DbRecordSet): DbRecordSet => {
		const fs: FieldsSet | undefined = this._fieldSets.get(tableName);
		const fieldsMap: FieldsMap = fs ? fs.propertyToField : {};
		const convertedFieldsMap: FieldsMap = objects.invert(fieldsMap);
		return recordset.map((record) => this.convertRecord(record, convertedFieldsMap));
	};

	private convertRecord = (record: DbRecord, fields: Record<string, string>): DbRecord => {
		return objects.modifyKeys(record, (key) => fields[key] || key);
	};
}
