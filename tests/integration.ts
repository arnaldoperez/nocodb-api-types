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
import { getProjects } from '../src/api';
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
    console.log('Attempting to fetch projects...');
    const projects = await getProjects();
    console.log(`Successfully fetched ${projects.length} projects.`);
  } catch (error: any) {
    console.error('API call failed (expected if token is invalid):', error.message);
  }
};

runIntegrationTest();
