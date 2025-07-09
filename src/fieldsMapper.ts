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

	isRecordsetNameQuery = (recordset: DbRecordSet): boolean => {
		return false;
	};

	convertRecordset = (recordset: DbRecordSet, fieldsMap: TableFieldsMap): DbRecordSet => {
		const convertedFieldsMap: TableFieldsMap = objects.invert(fieldsMap);
		return recordset.map((record) => this.convertRecord(record, convertedFieldsMap));
	};

	private convertRecord = (record: DbRecord, fields: Record<string, string>): DbRecord => {
		const cleanedRecord: DbRecord = this.normalizeDbRecord(record);
		return objects.modifyKeys(cleanedRecord, (key) => fields[key] || key);
	};

	private isDbRecord = (value: unknown): value is DbRecord => {
		if (typeof value !== 'object' || value === null || Array.isArray(value)) {
			return false;
		}

		for (const key in value) {
			const val = (value as Record<string, unknown>)[key];
			if (
				typeof val !== 'string' &&
				typeof val !== 'number' &&
				typeof val !== 'boolean' &&
				!(val instanceof Date) &&
				val !== null
			) {
				const x = typeof val;
				return false;
			}
		}

		return true;
	};

	normalizeDbRecord = (row: unknown): DbRecord => {
		let current = row;

		while (typeof current === 'object' && current !== null && !Array.isArray(current)) {
			const keys = Object.keys(current);
			if (keys.length === 1) {
				const inner = (current as Record<string, unknown>)[keys[0]];
				if (this.isDbRecord(inner)) {
					current = inner;
				} else {
					break;
				}
			} else {
				break;
			}
		}

		if (!this.isDbRecord(current)) {
			throw new Error('Unexpected row structure — cannot normalize to DbRecord');
		}

		return current;
	};
}
