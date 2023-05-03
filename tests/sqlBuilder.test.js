import sqlBuilder from '../../services/public/sqlBuilder';

describe('getSelect', () => {
	it('If simple select all then returns proper command', () => {
		const tableName = 'table_name';
		const command = sqlBuilder.getSelect({ from: tableName });
		expect(command).toEqual(`SELECT * FROM ${tableName}`);
	});
});
