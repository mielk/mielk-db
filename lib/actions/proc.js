import { objects } from 'mielk-fn';
import mysql from '../mysql.js';
import sqlBuilder from '../sqlBuilder.js';
import joiner from '../joiner.js';
import fm from '../fieldsManager.js';

const techColumns = {
	rsName: 'recordsetName',
};

const runProcedure = async (name, params, joinRules, fields) => {
	const arrParams = Array.isArray(params) ? params : Object.entries(params).map((a) => a[1]);
	const raw = await getRecordsets(name, arrParams);

	if (hasRecordset(raw)) {
		const data = createRecordsetDictionary(raw);
		if (fields) fm.renameMultiResultSet(data, fields);
		if (joinRules) joiner.applyRules(data, joinRules);
		return data;
	} else {
		return raw.affectedRows;
	}
};

const hasRecordset = (response) => !objects.isObject(response);

const getRecordsets = async (procName, procParams) => {
	const sql = sqlBuilder.getCallProc(procName, procParams);
	const records = await mysql.query(sql);
	return records;
};

const getRecordsetName = (arr) => (arr[0] || {})[techColumns.rsName];

const createRecordsetDictionary = (recordsets) => {
	const obj = {};
	let currentName = '';
	recordsets.forEach((rs) => {
		const name = getRecordsetName(rs);
		if (name) {
			currentName = name;
		} else if (currentName) {
			obj[currentName] = rs;
			currentName = '';
		}
	});
	return obj;
};

export default runProcedure;
