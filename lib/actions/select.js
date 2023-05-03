import { arrays } from 'mielk-fn';
import mysql from '../mysql.js';
import sqlBuilder from '../sqlBuilder.js';
import fm from '../fieldsManager.js';

const operators = {
	greaterThan: '>',
	lessThan: '<',
	greaterEqualThan: '>=',
	lessEqualThan: '<=',
	equal: '=',
};

const select = (config) => {
	const self = {};
	const select = [];
	const where = [];
	const order = [];
	let from = undefined;

	self.reset = () => {
		select.length = 0;
		where.length = 0;
		order.length = 0;
		from = undefined;
	};

	self.select = (fields) => {
		if (Array.isArray(fields) && fields.length) {
			select.splice(0, 0, [...fields]);
		} else if (fields) {
			select.push(fields); //Single entry.
		} else {
			select.length = 0;
		}
		return self;
	};

	self.where = (field, operator, comparison) => {
		where.push({ field, operator, comparison });
		return self;
	};

	self.filter = (field, value) => {
		where.push({ field, operator: operators.equal, comparison: value });
		return self;
	};

	self.iin = (field, values) => {
		where.push({ in: true, field, values });
		return self;
	};

	self.order = (field, ascending) => {
		order.push({ field, ascending });
		return self;
	};

	self.from = (value) => {
		from = value;
		return self;
	};

	self.toArray = async (fields) => await getRecordset(fields);

	self.toMap = async (fields, keyFunction) => {
		const records = await getRecordset(fields);
		return arrays.toMap(records, keyFunction);
	};

	self.toObject = async () => {
		const records = await getRecordset();
		return records[0];
	};

	const getParams = () => ({
		select,
		where,
		order,
		from,
	});

	const getRecordset = async (fields) => {
		const sql = sqlBuilder.getSelect(getParams());
		const records = await mysql.query(config, sql);
		return fm.renameResultset(records, fields);
	};

	return self;
};

export default select;
