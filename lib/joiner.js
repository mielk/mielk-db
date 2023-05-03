import { arrays } from 'mielk-fn';

const append = (data, mainName, idField, subname) => {
	const parents = data[mainName];
	const items = data[subname];
	if (!parents || !items || !subname || !idField) return;
	const arr = arrays.createIndexedArray(parents, (p) => p.id);
	parents.forEach((parent) => (parent[subname] = []));
	items.forEach((item) => {
		const id = item[idField];
		const parent = arr[id];
		parent[subname].push(item);
	});
};

const applyRules = (data, rules) => {
	const { mainName, idField, subNames } = rules || {};
	(subNames || []).forEach((subName) => append(data, mainName, idField, subName));
};

export default { append, applyRules };
