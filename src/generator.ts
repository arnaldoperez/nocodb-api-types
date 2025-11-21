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

export const sanitizeClassName = (name: string): string => {
  // PascalCase
  return name
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .split(' ')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
};

export const sanitizeFileName = (name: string): string => {
  // kebab-case
  return name
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .trim()
    .split(' ')
    .map(part => part.toLowerCase())
    .join('-');
};

const sanitizeKey = (name: string): string => {
  if (!name) {
    return 'unnamed_column';
  }

  const reservedKeywords = new Set([
    'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default',
    'delete', 'do', 'else', 'enum', 'export', 'extends', 'false', 'finally', 'for',
    'function', 'if', 'import', 'in', 'instanceof', 'new', 'null', 'return', 'super',
    'switch', 'this', 'throw', 'true', 'try', 'typeof', 'var', 'void', 'while', 'with',
    'implements', 'interface', 'let', 'package', 'private', 'protected', 'public',
    'static', 'yield', 'any', 'boolean', 'constructor', 'declare', 'get', 'module',
    'require', 'number', 'set', 'string', 'symbol', 'type', 'from', 'of', 'as'
  ]);

  if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name) && !reservedKeywords.has(name)) {
    return name;
  }
  return `'${name}'`;
};

export const generateInterface = (table: Table, columns: Column[], interfaceName?: string): string => {
  const finalInterfaceName = interfaceName || sanitizeClassName(table.table_name);
  const lines = [`export interface ${finalInterfaceName} {`];
  
  const usedKeys = new Map<string, number>();

  for (const col of columns) {
    const tsType = mapNocoTypeToTsType(col);
    let key = sanitizeKey(col.column_name);
    
    // Handle duplicates
    if (usedKeys.has(key)) {
      const count = usedKeys.get(key)! + 1;
      usedKeys.set(key, count);
      // If key is quoted, insert suffix before the closing quote
      if (key.startsWith("'") && key.endsWith("'")) {
        key = key.slice(0, -1) + `_${count}'`;
      } else {
        key = `${key}_${count}`;
      }
    } else {
      usedKeys.set(key, 1);
    }

    lines.push(`  ${key}?: ${tsType};`);
  }

  lines.push('}');
  return lines.join('\n');
};
