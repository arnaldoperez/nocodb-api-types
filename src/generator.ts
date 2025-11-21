import { Column, Table } from './api';

export const mapNocoTypeToTsType = (column: Column): string => {
  switch (column.uidt) {
    case 'SingleLineText':
    case 'LongText':
    case 'Email':
    case 'URL':
    case 'PhoneNumber':
    case 'SingleSelect': 
    case 'MultiSelect': 
      return 'string';
    case 'Number':
    case 'Decimal':
    case 'Rating':
    case 'Currency':
    case 'Percent':
    case 'Duration':
    case 'Year':
      return 'number';
    case 'Checkbox':
    case 'Boolean':
      return 'boolean';
    case 'Date':
    case 'DateTime':
    case 'CreatedTime':
    case 'LastModifiedTime':
      return 'string'; 
    case 'JSON':
    case 'Attachment': 
    case 'LinkToAnotherRecord': 
    case 'Lookup': 
    case 'Rollup': 
    case 'Formula': 
      return 'any';
    default:
      return 'any';
  }
};

const sanitizeClassName = (name: string): string => {
  // PascalCase
  return name
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .split(' ')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
};

const sanitizeKey = (name: string): string => {
  if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
    return name;
  }
  return `'${name}'`;
};

export const generateInterface = (table: Table, columns: Column[]): string => {
  const interfaceName = sanitizeClassName(table.table_name);
  const lines = [`export interface ${interfaceName} {`];
  
  for (const col of columns) {
    const tsType = mapNocoTypeToTsType(col);
    const key = sanitizeKey(col.column_name);
    lines.push(`  ${key}?: ${tsType};`);
  }

  lines.push('}');
  return lines.join('\n');
};
