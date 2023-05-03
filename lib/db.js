import select from './actions/select.js';
import proc from './actions/proc.js';
import insert from './actions/insert.js';
import update from './actions/update.js';
import { del, deactivate } from './actions/delete.js';

export default { select, insert, update, del, deactivate, proc };
