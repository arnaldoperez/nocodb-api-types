
import { generateInterface } from './src/generator';
import { Table, Column } from './src/api';

const table: Table = {
  id: '1',
  title: 'Test Table',
  table_name: 'TestTable',
};

const columns: Column[] = [
  {
    id: 'c1',
    title: 'Null Column',
    column_name: 'null',
    uidt: 'SingleLineText',
    dt: 'varchar',
  },
  {
    id: 'c2',
    title: 'Another Null',
    column_name: 'null',
    uidt: 'Number',
    dt: 'int',
  }
];

const output = generateInterface(table, columns);
console.log(output);
