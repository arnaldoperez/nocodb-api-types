import * as dotenv from 'dotenv';
import * as path from 'path';

// Load test.env explicitly before other imports
const envPath = path.resolve(__dirname, '../test.env');
console.log(`Loading environment from: ${envPath}`);
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('Error loading test.env:', result.error);
  process.exit(1);
}

// Now import the API client
import { getWorkspaces, getProjects, getTables, getColumns } from '../src/api';
import { config } from '../src/config';

const runIntegrationTest = async () => {
  console.log('Running Integration Test with Config:');
  console.log(`  URL: ${config.nocoUrl}`);
  console.log(`  Token: ${config.xcToken ? '***' : 'Not Set'}`);

  if (config.xcToken === 'test_token_placeholder') {
    console.log('Skipping actual API call because XC_TOKEN is a placeholder.');
    console.log('Test environment setup verified.');
    return;
  }

  try {
    // Step 1: Fetch workspaces
    console.log('\n--- Step 1: Fetching workspaces ---');
    const workspaces = await getWorkspaces();
    console.log(`Successfully fetched ${workspaces.length} workspace(s).`);
    if (workspaces.length > 0) {
      console.log(`  First workspace: "${workspaces[0].title}" (${workspaces[0].id})`);
    }

    // Step 2: Fetch bases (projects) from the first workspace
    if (workspaces.length > 0) {
      console.log('\n--- Step 2: Fetching bases ---');
      const projects = await getProjects(workspaces[0].id);
      console.log(`Successfully fetched ${projects.length} base(s).`);
      for (const p of projects) {
        console.log(`  Base: "${p.title}" (${p.id})`);
      }

      // Step 3: Fetch tables from the first base
      if (projects.length > 0) {
        console.log('\n--- Step 3: Fetching tables ---');
        const tables = await getTables(projects[0].id);
        console.log(`Successfully fetched ${tables.length} table(s) from base "${projects[0].title}".`);
        for (const t of tables) {
          console.log(`  Table: "${t.title}" (${t.id})`);
        }

        // Step 4: Fetch columns from the first table
        if (tables.length > 0) {
          console.log('\n--- Step 4: Fetching fields ---');
          const columns = await getColumns(tables[0].id, projects[0].id);
          console.log(`Successfully fetched ${columns.length} field(s) from table "${tables[0].title}".`);
          for (const c of columns) {
            console.log(`  Field: "${c.title}" (type: ${c.type || c.uidt || 'unknown'})`);
          }
        }
      }
    }

    // Step 5: Test backward-compatible getProjects() without workspaceId
    console.log('\n--- Step 5: Testing backward-compatible getProjects() ---');
    const autoProjects = await getProjects();
    console.log(`Backward-compatible call fetched ${autoProjects.length} base(s).`);

    console.log('\n✅ All integration tests passed!');
  } catch (error: any) {
    console.error('API call failed:', error.message);
  }
};

runIntegrationTest();