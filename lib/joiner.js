import { arrays } from 'mielk-fn';

const append = (data, parentsNode, itemsNode, matchField, nodeName, deleteOriginalField = false) => {
	const parents = data[parentsNode];
	const items = data[itemsNode];
	if (!parents || !items || !matchField) return;
	const arr = arrays.createIndexedArray(parents, (p) => p.id);
	parents.forEach((parent) => (parent[nodeName] = []));
	items.forEach((item) => {
		const id = item[matchField];
		const parent = arr[id];
		parent[nodeName].push(item);
		if (deleteOriginalField) delete item[matchField];
	});
};

const assign = (data, parentsNode, itemsNode, matchField, nodeName, deleteOriginalField) => {
	const parents = data[parentsNode];
	const items = data[itemsNode];
	if (!parents || !items || !matchField) return;

	const arr = arrays.createIndexedArray(items, (i) => i.id);
	parents.forEach((parent) => {
		const itemId = parent[matchField];
		const item = arr[itemId];
		parent[nodeName] = item;
		if (deleteOriginalField) delete parent[matchField];
	});
};

const applyRules = (data, rules) => {
	(rules || []).forEach((rule) => {
		const { parentsNode, itemsNode, matchField, oneToOne, nodeName, deleteOriginalField } = rule || {};
		const fn = oneToOne ? assign : append;
		fn(data, parentsNode, itemsNode, matchField, nodeName, deleteOriginalField);
	});
};

export default { append, applyRules };
