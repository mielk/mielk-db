import { objects } from 'mielk-fn';
export class FieldsManager {
    constructor() {
        this._fieldSets = new Map();
        this.countFieldsSets = () => this._fieldSets.size;
        this.addFieldsSet = (key, fieldsSet) => {
            this._fieldSets.set(key, fieldsSet);
        };
        this.getFieldsSet = (key) => this._fieldSets.get(key);
        this.getPropertyToDbFieldMap = (tableName) => {
            const fs = this._fieldSets.get(tableName);
            if (fs) {
                return fs.propertyToField;
            }
            else {
                return {};
            }
        };
        this.convertMultiRecordset = (multiRs) => {
            const result = {};
            const entries = Object.entries(multiRs);
            entries.forEach((entry) => {
                const [tableName, records] = entry;
                result[tableName] = this.convertRecordset(tableName, records);
            });
            return result;
        };
        this.convertRecordset = (tableName, recordset) => {
            const fs = this._fieldSets.get(tableName);
            const fieldsMap = fs ? fs.propertyToField : {};
            const convertedFieldsMap = objects.invert(fieldsMap);
            return recordset.map((record) => this.convertRecord(record, convertedFieldsMap));
        };
        this.convertRecord = (record, fields) => {
            return objects.modifyKeys(record, (key) => fields[key] || key);
        };
    }
}
