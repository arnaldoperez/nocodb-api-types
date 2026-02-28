import { generateInterface } from '../src/generator';
import { Table, Column } from '../src/api';

const mockTable: Table = {
  id: 't1',
  title: 'Gallery',
  table_name: 'gallery',
};

const mockColumns: Column[] = [
  { id: 'c1', title: 'ID', column_name: 'id', uidt: 'Number', dt: 'int' },
  { id: 'c2', title: 'Photos', column_name: 'photos', uidt: 'Attachment', dt: 'text' },
];

console.log('Generating interface for Gallery table...');
const result = generateInterface(mockTable, mockColumns);
console.log(result);

if (result.includes('photos?: any[];')) {
  console.log('Current state: Attachment is any[]');
} else if (result.includes('photos?: Attachment[];')) {
  console.log('Target state: Attachment is Attachment[]');
} else {
  console.log('Unexpected state');
}
