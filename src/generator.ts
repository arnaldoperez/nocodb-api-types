import { Column, Table } from './api';

export const mapNocoTypeToTsType = (column: Column, tableInterfaceMap?: Map<string, string>): string => {
  // v3 uses 'type', v2 uses 'uidt'
  const fieldType = column.type || column.uidt;
  switch (fieldType) {
    case 'SingleLineText':
    case 'LongText':
    case 'Email':
    case 'URL':
    case 'PhoneNumber':
    case 'SingleSelect':
    case 'MultiSelect':
    case 'Barcode':
    case 'QrCode':
    case 'UUID':
      return 'string';
    case 'Number':
    case 'Decimal':
    case 'Rating':
    case 'Currency':
    case 'Percent':
    case 'Duration':
    case 'Year':
    case 'AutoNumber':
    case 'Count':
      return 'number';
    case 'Checkbox':
    case 'Boolean':
      return 'boolean';
    case 'Date':
    case 'DateTime':
    case 'CreatedTime':
    case 'LastModifiedTime':
    case 'Time':
      return 'string';
    case 'JSON':
    case 'Links':
      return 'any[]';
    case 'Attachment':
      return 'Attachment[]';
    case 'LinkToAnotherRecord':
      if (tableInterfaceMap && column.colOptions?.fk_related_model_id && tableInterfaceMap.has(column.colOptions.fk_related_model_id)) {
        return `${tableInterfaceMap.get(column.colOptions.fk_related_model_id)}[]`;
      }
      return 'any[]';
    case 'Lookup':
    case 'Rollup':
    case 'Formula':
    case 'Collaborator':
    case 'User':
    case 'CreatedBy':
    case 'LastModifiedBy':
    case 'Button':
    case 'GeoData':
    case 'Geometry':
    case 'SpecificDBType':
    case 'ForeignKey':
      return 'any';
    case 'ID':
      return 'string | number';
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

export const generateInterface = (table: Table, columns: Column[], interfaceName?: string, tableInterfaceMap?: Map<string, string>): string => {
  const finalInterfaceName = interfaceName || sanitizeClassName(table.table_name || table.title);
  const lines = [`export interface ${finalInterfaceName} {`];

  const usedKeys = new Map<string, number>();

  for (const col of columns) {
    const tsType = mapNocoTypeToTsType(col, tableInterfaceMap);
    let key = sanitizeKey(col.column_name || col.title || 'unnamed');

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

export const generateLinkedFieldsEnum = (table: Table, columns: Column[], interfaceName?: string): string => {
  const finalInterfaceName = interfaceName || sanitizeClassName(table.table_name || table.title);
  const enumName = `${finalInterfaceName}LinkedFields`;

  // v3 uses 'Links' or 'LinkToAnotherRecord' as type, v2 uses 'LinkToAnotherRecord' as uidt
  const linkedColumns = columns.filter(c => {
    const ft = c.type || c.uidt;
    return ft === 'LinkToAnotherRecord' || ft === 'Links';
  });
  if (linkedColumns.length === 0) return '';

  const lines = [`export enum ${enumName} {`];
  const usedKeys = new Map<string, number>();

  for (const col of linkedColumns) {
    let key = sanitizeKey(col.title || col.column_name || 'unnamed');
    let enumKey = sanitizeClassName(col.title || col.column_name || 'unnamed');

    if (usedKeys.has(enumKey)) {
      const count = usedKeys.get(enumKey)! + 1;
      usedKeys.set(enumKey, count);
      enumKey = `${enumKey}_${count}`;
    } else {
      usedKeys.set(enumKey, 1);
    }

    lines.push(`  ${enumKey} = '${col.id}',`);
  }

  lines.push('}');
  return lines.join('\n');
};

export const generateClientBase = (): string => {
  return `import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

export interface NocoDBClientConfig {
  baseURL: string;
  xcToken?: string;
  xcAuth?: string;
  headers?: Record<string, string>;
}

export interface Attachment {
  path?: string;
  title?: string;
  mimetype?: string;
  size?: number;
  url?: string;
  signedPath?: string;
  signedUrl?: string;
}

export interface NocoDBRecord<T> {
  id: string | number;
  fields: T;
}

export interface ListResponse<T> {
  records: NocoDBRecord<T>[];
  next?: string | null;
  prev?: string | null;
  nestedNext?: string | null;
  nestedPrev?: string | null;
}

export interface ListRecordParams {
    /**
     * Specify fields to include in the API response. String representing stringified JSON array of field names or field ids.
     */
    fields?: string;
    /**
     * Allows you to specify the fields by which you want to sort the records.
     */
    sort?: string;
    /**
     * Conditions to filter records. Example: (field1,eq,value1)~and(field2,eq,value2)
     */
    where?: string;
    /**
     * Controls pagination of the API response by specifying the page number.
     */
    page?: number;
    /**
     * Sets a limit on the number of records returned.
     */
    pageSize?: number;
    /**
     * Controls pagination of nested (linked) records.
     */
    nestedPage?: number;
    /**
     * Fetches records visible within a specific view.
     */
    viewId?: string;
}

export interface ListLinkedRecordParams {
    fields?: string;
    sort?: string;
    where?: string;
    page?: number;
    pageSize?: number;
    nestedPage?: number;
}

export class Api {
  protected client: AxiosInstance;

  constructor(config: NocoDBClientConfig) {
    const headers: Record<string, string> = { ...config.headers };
    if (config.xcToken) headers['xc-token'] = config.xcToken.trim();
    if (config.xcAuth) headers['xc-auth'] = config.xcAuth.trim();

    this.client = axios.create({
      baseURL: config.baseURL,
      headers,
    });
  }
}


export class TableClient<T, L = string, F = string> {
  protected client: AxiosInstance;
  protected projectId: string;
  protected tableId: string;

  constructor(client: AxiosInstance, projectId: string, tableId: string) {
    this.client = client;
    this.projectId = projectId;
    this.tableId = tableId;
  }

  async list(params?: ListRecordParams): Promise<ListResponse<T>> {
    const response = await this.client.get<ListResponse<T>>(
      \`/api/v3/data/\${this.projectId}/\${this.tableId}/records\`,
      { params }
    );
    return response.data;
  }

  async get(id: string | number): Promise<NocoDBRecord<T>> {
    const response = await this.client.get<NocoDBRecord<T>>(
      \`/api/v3/data/\${this.projectId}/\${this.tableId}/records/\${id}\`
    );
    return response.data;
  }

  async create(data: Partial<T>): Promise<NocoDBRecord<T>> {
    const response = await this.client.post<{ records: NocoDBRecord<T>[] }>(
      \`/api/v3/data/\${this.projectId}/\${this.tableId}/records\`,
      { fields: data }
    );
    return response.data.records[0];
  }

  async update(id: string | number, data: Partial<T>): Promise<NocoDBRecord<T>> {
    const response = await this.client.patch<{ records: NocoDBRecord<T>[] }>(
      \`/api/v3/data/\${this.projectId}/\${this.tableId}/records\`,
      { id, fields: data }
    );
    return response.data.records[0];
  }

  async delete(id: string | number): Promise<void> {
    await this.client.delete(
      \`/api/v3/data/\${this.projectId}/\${this.tableId}/records\`,
      {
        data: { id }
      }
    );
  }

  async listLinkedRecords(recordId: string | number, linkFieldId: L, params?: ListLinkedRecordParams): Promise<ListResponse<any>> {
    const response = await this.client.get<ListResponse<any>>(
        \`/api/v3/data/\${this.projectId}/\${this.tableId}/links/\${linkFieldId as any}/\${recordId}\`,
        { params }
    );
    return response.data;
  }

  async linkRelation(recordId: string | number, linkFieldId: L, linkedRecordId: string | number): Promise<boolean> {
    const response = await this.client.post<{ success: boolean }>(
      \`/api/v3/data/\${this.projectId}/\${this.tableId}/links/\${linkFieldId as any}/\${recordId}\`,
      { id: String(linkedRecordId) }
    );
    return response.data.success;
  }

  async unlinkRelation(recordId: string | number, linkFieldId: L, linkedRecordId: string | number): Promise<boolean> {
    const response = await this.client.delete<{ success: boolean }>(
      \`/api/v3/data/\${this.projectId}/\${this.tableId}/links/\${linkFieldId as any}/\${recordId}\`,
      { data: { id: String(linkedRecordId) } }
    );
    return response.data.success;
  }

  async uploadAttachment(recordId: string | number, fieldId: F, fileBuffer: Buffer | string, filename: string, contentType: string): Promise<any> {
    // Determine base64 encoding from buffer or string
    let base64File = typeof fileBuffer === 'string' ? fileBuffer : fileBuffer.toString('base64');
    
    const response = await this.client.post<any>(
      \`/api/v3/data/\${this.projectId}/\${this.tableId}/records/\${recordId}/fields/\${fieldId as any}/upload\`,
      {
        contentType,
        file: base64File,
        filename
      }
    );
    return response.data;
  }
}
`;
};

export const generateProjectClient = (projectTitle: string, projectId: string, tables: { title: string; table_name: string; id: string; interfaceName: string; hasLinkedFieldsEnum?: boolean }[]): string => {
  const sanitizedProjectName = sanitizeClassName(projectTitle);

  const imports = tables.map(t => {
    if (t.hasLinkedFieldsEnum) {
      return `import { \${t.interfaceName}, \${t.interfaceName}LinkedFields } from './\${sanitizeFileName(projectTitle)}';`;
    }
    return `import { \${t.interfaceName} } from './\${sanitizeFileName(projectTitle)}';`;
  }).join('\n');

  const tableProperties = tables.map(t => {
    const propertyName = sanitizeClassName(t.title);
    if (t.hasLinkedFieldsEnum) {
      return `  public \${propertyName}: TableClient<\${t.interfaceName}, \${t.interfaceName}LinkedFields, string>;`;
    }
    return `  public \${propertyName}: TableClient<\${t.interfaceName}, string, string>;`;
  }).join('\n');

  const tableInitializations = tables.map(t => {
    const propertyName = sanitizeClassName(t.title);
    return `    this.\${propertyName} = new TableClient(this.client, '\${projectId}', '\${t.id}');`;
  }).join('\n');

  return `import { Api, NocoDBClientConfig, TableClient } from './client-base';
\${imports}

export class \${sanitizedProjectName}Client extends Api {
\${tableProperties}

  constructor(config: NocoDBClientConfig) {
    super(config);
\${tableInitializations}
  }
}
`;
};
