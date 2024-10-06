import { objects } from 'mielk-fn';
import { DbFieldsMap, DbStructure, IFieldsManager } from './models/fields.js';
import { DbTable } from './models/fields.js';
import { DbRecord, DbRecordSet, MultiRecordSet } from './models/records.js';

export class FieldsManager implements IFieldsManager {
	private structure: DbStructure;
	private viewsToFieldsMap: { [key: string]: DbTable };

	constructor(structure: DbStructure) {
		this.structure = structure;
		this.viewsToFieldsMap = this.createViewsToFieldsMap();
	}

	private createViewsToFieldsMap = (): { [key: string]: DbTable } => {
		const obj: { [key: string]: DbTable } = {};
		if (this.structure) {
			for (const dbTable of Object.values(this.structure)) {
				obj[dbTable.table] = dbTable;
				obj[dbTable.view] = dbTable;
			}
		}
		return obj;
	};

	private getDbTable = (key: string): DbTable | null => this.viewsToFieldsMap[key] || null;

	___getDbStructure = (): DbStructure => this.structure;

	getFieldsMap = (name: string): DbFieldsMap | null => {
		const table: DbTable | null = this.getDbTable(name);
		return table ? table.fieldsMap : null;
	};

	getFieldName = (name: string, property: string): string | null => {
		const fieldsMap: DbFieldsMap | null = this.getFieldsMap(name);
		return fieldsMap ? fieldsMap[property] || null : null;
	};

	convertMultiRecordset = (multiRs: MultiRecordSet): MultiRecordSet => {
		const result: MultiRecordSet = {};
		const entries = Object.entries(multiRs);
		entries.forEach((entry: [string, any]) => {
			const [name, records] = entry;
			result[name] = this.convertRecordset(name, records);
		});
		return result;
	};

	convertRecordset = (name: string, recordset: DbRecordSet): DbRecordSet => {
		const fieldsMap: DbFieldsMap = this.getFieldsMap(name) || {};
		const convertedFieldsMap: DbFieldsMap = objects.invert(fieldsMap);
		return recordset.map((record) => this.convertRecord(record, convertedFieldsMap));
	};

	private convertRecord = (record: DbRecord, fields: Record<string, string>): DbRecord => {
		return objects.modifyKeys(record, (key) => fields[key] || key);
	};
}
