import { objects } from 'mielk-fn';
import { TableFieldsMap, IFieldsMapper, DbFieldsMap } from './models/fields.js';
import { DbRecord, DbRecordSet, MultiRecordSet } from './models/records.js';

export class FieldsMapper implements IFieldsMapper {
	convertMultiRecordset = (recordsets: MultiRecordSet, fieldsMaps: DbFieldsMap): MultiRecordSet => {
		const result: MultiRecordSet = {};
		for (const [key, records] of Object.entries(recordsets)) {
			const map: TableFieldsMap = fieldsMaps[key] || {};
			result[key] = this.convertRecordset(records, map);
		}
		return result;
	};

	convertRecordset = (recordset: DbRecordSet, fieldsMap: TableFieldsMap): DbRecordSet => {
		const convertedFieldsMap: TableFieldsMap = objects.invert(fieldsMap);
		return recordset.map((record) => this.convertRecord(record, convertedFieldsMap));
	};

	private convertRecord = (record: DbRecord, fields: Record<string, string>): DbRecord => {
		return objects.modifyKeys(record, (key) => fields[key] || key);
	};
}
