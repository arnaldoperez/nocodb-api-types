import axios from 'axios';
import { config } from './config';

const api = axios.create({
  baseURL: config.nocoUrl,
  headers: {
    'xc-token': config.xcToken,
  },
});

export interface Project {
  id: string;
  title: string;
}

export interface Table {
  id: string;
  title: string;
  table_name: string;
}

export interface Column {
  id: string;
  title: string;
  column_name: string;
  uidt: string; // User Interface Data Type (e.g., 'SingleLineText', 'Number')
  dt: string; // Data Type (e.g., 'varchar', 'int')
  // Add other relevant fields as needed
}

export const getProjects = async (): Promise<Project[]> => {
  try {
    console.log(`Fetching projects from: ${api.defaults.baseURL}/api/v1/db/meta/projects`);
    const response = await api.get('/api/v1/db/meta/projects');
    return response.data.list || response.data; 
  } catch (error:any) {
    console.error('Error fetching projects:', error);
    console.error(error.code, );
    throw error;
  }
};

export const getTables = async (projectId: string): Promise<Table[]> => {
  try {
    const response = await api.get(`/api/v1/db/meta/projects/${projectId}/tables`);
    return response.data.list || response.data;
  } catch (error) {
    console.error(`Error fetching tables for project ${projectId}:`, error);
    throw error;
  }
};

export const getColumns = async (tableId: string): Promise<Column[]> => {
  try {
    const response = await api.get(`/api/v1/db/meta/tables/${tableId}`);
    return response.data.columns;
  } catch (error) {
    console.error(`Error fetching columns for table ${tableId}:`, error);
    throw error;
  }
};
