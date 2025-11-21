import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
// Load test.env explicitly
const envPath = path.resolve(__dirname, '../test.env');
console.log(`Loading environment from: ${envPath}`);
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('Error loading test.env:', result.error);
  process.exit(1);
}

import { generateAllTypes } from '../src/index';
import { config } from '../src/config';

const runFullGenerationTest = async () => {
  console.log('Running Full Generation Test...');
  
  if (!config.xcToken || config.xcToken === 'test_token_placeholder') {
    console.warn('Skipping actual API call because XC_TOKEN is missing or a placeholder.');
    return;
  }

  const testOutputDir = path.join(__dirname, '../testOutput');

  // Clean up previous test output
  if (fs.existsSync(testOutputDir)) {
    fs.rmSync(testOutputDir, { recursive: true, force: true });
  }

  try {
    await generateAllTypes({ outputDir: testOutputDir });

    if (fs.existsSync(testOutputDir)) {
      const files = fs.readdirSync(testOutputDir);
      if (files.length > 0) {
        console.log(`SUCCESS: Found ${files.length} generated files in ${testOutputDir}.`);
        files.forEach(file => console.log(` - ${file}`));
      } else {
        console.error('FAILURE: Output directory exists but is empty.');
        process.exit(1);
      }
    } else {
      console.error('FAILURE: Output directory was not created.');
      process.exit(1);
    }

  } catch (error) {
    console.error('Test failed with error:', error);
    process.exit(1);
  }
};

runFullGenerationTest();
