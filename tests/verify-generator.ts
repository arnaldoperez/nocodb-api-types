import { generateInterface } from '../src/generator';
import { Table, Column } from '../src/api';

const mockTable: Table = {
  id: 't1',
  title: 'Users',
  table_name: 'users',
};

const mockColumns: Column[] = [
  { id: 'c1', title: 'ID', column_name: 'id', uidt: 'Number', dt: 'int' },
  { id: 'c2', title: 'Name', column_name: 'name', uidt: 'SingleLineText', dt: 'varchar' },
  { id: 'c3', title: 'Email', column_name: 'email', uidt: 'Email', dt: 'varchar' },
  { id: 'c4', title: 'Is Active', column_name: 'is_active', uidt: 'Boolean', dt: 'tinyint' },
  { id: 'c5', title: 'Created At', column_name: 'created_at', uidt: 'CreatedTime', dt: 'datetime' },
];

console.log('Generating interface for Users table...');
const result = generateInterface(mockTable, mockColumns);
console.log(result);

if (result.includes('export interface Users {') && result.includes('email?: string;')) {
  console.log('Verification PASSED');
} else {
  console.error('Verification FAILED');
  process.exit(1);
}
