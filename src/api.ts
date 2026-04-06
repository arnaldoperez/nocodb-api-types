import axios from 'axios';
import { config } from './config';

const api = axios.create({
  baseURL: config.nocoUrl,
  headers: {
    'xc-token': config.xcToken,
  },
});

export interface Workspace {
  id: string;
  title: string;
  org_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Project {
  id: string;
  title: string;
  meta?: any;
  created_at?: string;
  updated_at?: string;
  workspace_id?: string;
}

export interface Table {
  id: string;
  title: string;
  table_name?: string;
  description?: string;
  source_id?: string;
  base_id?: string;
  display_field_id?: string;
  workspace_id?: string;
  columns?: Column[];
  fields?: Column[];
}

export interface Column {
  id: string;
  title: string;
  column_name?: string;
  /** v3 uses 'type', v2 uses 'uidt' */
  type?: string;
  uidt?: string;
  dt?: string;
  description?: string;
  default_value?: any;
  unique?: boolean | number | null;
  options?: any;
  np?: number | string | null;
  ns?: number | string | null;
  clen?: number | string | null;
  cop?: string | number;
  pk?: boolean | number | null;
  ai?: boolean | number | null;
  au?: boolean | number | null;
  un?: boolean | number | null;
  rqd?: boolean | number | null;
  colOptions?: {
    fk_related_model_id?: string;
  };
}

/**
 * Fetch all workspaces accessible to the current user.
 * Uses the v3 meta API: GET /api/v3/meta/workspaces
 */
export const getWorkspaces = async (): Promise<Workspace[]> => {
  try {
    console.log(`Fetching workspaces from: ${api.defaults.baseURL}/api/v3/meta/workspaces`);
    const response = await api.get('/api/v3/meta/workspaces');
    return response.data.list || response.data;
  } catch (error: any) {
    console.error('Error fetching workspaces:', error.message);
    throw error;
  }
};

/**
 * Fetch all bases (projects) within a workspace.
 * Uses the v3 meta API: GET /api/v3/meta/workspaces/{workspaceId}/bases
 *
 * For backward compatibility, if no workspaceId is provided,
 * it fetches the first workspace and uses that.
 */
export const getProjects = async (workspaceId?: string): Promise<Project[]> => {
  try {
    let wsId = workspaceId;
    if (!wsId) {
      const workspaces = await getWorkspaces();
      if (workspaces.length === 0) {
        throw new Error('No workspaces found. Cannot fetch bases.');
      }
      wsId = workspaces[0].id;
      console.log(`Using default workspace: "${workspaces[0].title}" (${wsId})`);
    }
    console.log(`Fetching bases from: ${api.defaults.baseURL}/api/v3/meta/workspaces/${wsId}/bases`);
    const response = await api.get(`/api/v3/meta/workspaces/${wsId}/bases`);
    return response.data.list || response.data;
  } catch (error: any) {
    console.error('Error fetching bases:', error.message);
    throw error;
  }
};

/**
 * Fetch all tables within a base.
 * Uses the v3 meta API: GET /api/v3/meta/bases/{baseId}/tables
 */
export const getTables = async (baseId: string): Promise<Table[]> => {
  try {
    const response = await api.get(`/api/v3/meta/bases/${baseId}/tables`);
    return response.data.list || response.data;
  } catch (error: any) {
    console.error(`Error fetching tables for base ${baseId}:`, error.message);
    throw error;
  }
};

/**
 * Fetch columns (fields) for a table by reading the full table metadata.
 * Uses the v3 meta API: GET /api/v3/meta/bases/{baseId}/tables/{tableId}
 *
 * The v3 API requires both baseId and tableId to read a table.
 * The response includes a `fields` array with the column definitions.
 */
export const getColumns = async (tableId: string, baseId: string): Promise<Column[]> => {
  try {
    const response = await api.get(`/api/v3/meta/bases/${baseId}/tables/${tableId}`);
    // v3 returns 'fields', v2 returned 'columns'
    return response.data.fields || response.data.columns || [];
  } catch (error: any) {
    console.error(`Error fetching columns for table ${tableId}:`, error.message);
    throw error;
  }
};
