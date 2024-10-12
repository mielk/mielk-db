import { Update } from './actions/update.js';
import { Select } from './actions/select.js';
import { Delete } from './actions/delete.js';
import { Insert } from './actions/insert.js';
import { Proc } from './actions/proc.js';
import { ConnectionData } from './models/sql.js';

export default class Db {
	constructor(private connection: ConnectionData) {}

	select = () => new Select(this.connection);

	update = () => new Update(this.connection);

	delete = () => new Delete(this.connection);

	insert = () => new Insert(this.connection);

	proc = () => new Proc(this.connection);
}
