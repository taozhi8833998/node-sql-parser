import { createRequire } from 'module';

const require = createRequire(import.meta.url);
export const { Parser } = require('../../../build/mysql.js');
