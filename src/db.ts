import { Update } from './actions/update.js';
import { Select } from './actions/select.js';
import { Delete } from './actions/delete.js';
import { Insert } from './actions/insert.js';
import { DbStructure } from './models/fields.js';
import { ConnectionData } from './models/sql.js';

export class Db {
	constructor(private connection: ConnectionData, private structure?: DbStructure) {}

	select = () => new Select(this.connection, this.structure);

	update = () => new Update(this.connection, this.structure);

	delete = () => new Delete(this.connection, this.structure);

	insert = () => new Insert(this.connection, this.structure);
}
