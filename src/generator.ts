import { Column, Table } from './api';

export const mapNocoTypeToTsType = (column: Column, tableInterfaceMap?: Map<string, string>): string => {
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
      return 'any[]';
    case 'LinkToAnotherRecord':
      if (tableInterfaceMap && column.colOptions?.fk_related_model_id && tableInterfaceMap.has(column.colOptions.fk_related_model_id)) {
        return `${tableInterfaceMap.get(column.colOptions.fk_related_model_id)}[]`;
      }
      return 'any[]';
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

export const generateInterface = (table: Table, columns: Column[], interfaceName?: string, tableInterfaceMap?: Map<string, string>): string => {
  const finalInterfaceName = interfaceName || sanitizeClassName(table.table_name);
  const lines = [`export interface ${finalInterfaceName} {`];

  const usedKeys = new Map<string, number>();

  for (const col of columns) {
    const tsType = mapNocoTypeToTsType(col, tableInterfaceMap);
    let key = sanitizeKey(col.column_name || col.title);

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

export const generateClientBase = (): string => {
  return `import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

export interface NocoDBClientConfig {
  baseURL: string;
  token?: string; // Deprecated: use xcToken or xcAuth
  xcToken?: string;
  xcAuth?: string;
  headers?: Record<string, string>;
}

export interface ListResponse<T> {
  list: T[];
  pageInfo: {
    totalRows: number;
    page: number;
    pageSize: number;
    isFirstPage: boolean;
    isLastPage: boolean;
  };
}

export interface ListRecordParams {
    /**
     * Allows you to specify the fields that you wish to include in your API response. 
     * By default, all the fields are included in the response.
     * Example: fields=field1,field2
     */
    fields?: string;
    /**
     * Allows you to specify the fields by which you want to sort the records in your API response.
     * Example: sort=field1,-field2
     */
    sort?: string;
    /**
     * Enables you to define specific conditions for filtering records in your API response.
     * Example: where=(field1,eq,value1)~and(field2,eq,value2)
     */
    where?: string;
    /**
     * Enables you to control the pagination of your API response by specifying the number of records you want to skip.
     */
    offset?: number;
    /**
     * Enables you to set a limit on the number of records you want to retrieve in your API response.
     */
    limit?: number;
    /**
     * View Identifier. Allows you to fetch records that are currently visible within a specific view.
     */
    viewId?: string;
    /**
     * Nested relations to fetch
     */
    nested?: any;
}

export class Api {
  protected client: AxiosInstance;

  constructor(config: NocoDBClientConfig) {
    const headers: Record<string, string> = { ...config.headers };
    if (config.token) headers['xc-token'] = config.token;
    if (config.xcToken) headers['xc-token'] = config.xcToken;
    if (config.xcAuth) {
        headers['xc-auth'] = config.xcAuth;
    }

    this.client = axios.create({
      baseURL: config.baseURL,
      headers,
    });
  }
}

export class TableClient<T> {
  protected client: AxiosInstance;
  protected tableId: string;

  constructor(client: AxiosInstance, tableId: string) {
    this.client = client;
    this.tableId = tableId;
  }

  async list(params?: ListRecordParams): Promise<ListResponse<T>> {
    const response = await this.client.get<{ list: T[]; pageInfo: any } | T[]>(
      \`/api/v2/tables/\${this.tableId}/records\`,
      { params }
    );
    if (Array.isArray(response.data)) {
        return {
            list: response.data,
            pageInfo: {
                totalRows: response.data.length,
                page: 1,
                pageSize: response.data.length,
                isFirstPage: true,
                isLastPage: true
            }
        };
    }
    return response.data as ListResponse<T>;
  }

  async get(id: string | number): Promise<T> {
    const response = await this.client.get<T>(
      \`/api/v2/tables/\${this.tableId}/records/\${id}\`
    );
    return response.data;
  }

  async create(data: Partial<T>): Promise<T> {
    const response = await this.client.post<T>(
      \`/api/v2/tables/\${this.tableId}/records\`,
      data
    );
    return response.data;
  }

  async update(id: string | number, data: Partial<T>): Promise<T> {
    const response = await this.client.patch<T>(
      \`/api/v2/tables/\${this.tableId}/records\`,
      {
          Id: id,
          ...data
      }
    );
    return response.data;
  }

  async delete(id: string | number): Promise<void> {
    await this.client.delete(
      \`/api/v2/tables/\${this.tableId}/records\`,
      {
        data: [ { Id: id } ]
      }
    );
  }
}
`;
};

export const generateProjectClient = (projectTitle: string, tables: { title: string; table_name: string; id: string; interfaceName: string }[]): string => {
  const sanitizedProjectName = sanitizeClassName(projectTitle);

  const imports = tables.map(t => `import { ${t.interfaceName} } from './${sanitizeFileName(projectTitle)}';`).join('\n');

  const tableProperties = tables.map(t => {
    const propertyName = sanitizeClassName(t.title);
    return `  public ${propertyName}: TableClient<${t.interfaceName}>;`;
  }).join('\n');

  const tableInitializations = tables.map(t => {
    const propertyName = sanitizeClassName(t.title);
    return `    this.${propertyName} = new TableClient(this.client, '${t.id}');`;
  }).join('\n');

  return `import { Api, NocoDBClientConfig, TableClient } from './client-base';
${imports}

export class ${sanitizedProjectName}Client extends Api {
${tableProperties}

  constructor(config: NocoDBClientConfig) {
    super(config);
${tableInitializations}
  }
}
`;
};

