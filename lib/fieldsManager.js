import { objects } from 'mielk-fn';

const convertMap = (fields) => {
	const entries = Object.entries(fields);
	const inverted = entries.map(([k, v]) => [k, objects.swapKeysWithValues(v)]);
	return Object.fromEntries(inverted);
};

const renameMultiResultSet = (data, rules) => {
	const map = convertMap(rules);
	const entries = Object.entries(map);

	entries.forEach(([namespace, fields]) => {
		const dataset = data[namespace];
		if (dataset) {
			const converted = dataset.map((item) => renameKeysForSingleItem(item, fields));
			data[namespace] = converted;
		}
	});
};

const renameResultset = (items, fields) => {
	const map = objects.swapKeysWithValues(fields);
	return items.map((item) => renameKeysForSingleItem(item, map));
};

const renameKeysForSingleItem = (item, map) => {
	const entries = Object.entries(item);
	const converted = entries.map(([key, value]) => [map[key] || key, value]);
	return Object.fromEntries(converted);
};

export default { convertMap, renameMultiResultSet, renameResultset };
