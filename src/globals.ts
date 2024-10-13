export default {
	tableInfoRsColumn: 'recordsetName',
	defaultRsName: 'items',
	getDefaultRsNameForIndex: (index: number) => `items_${index}`,
};
