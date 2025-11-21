
import * as fs from 'fs';
import * as path from 'path';

const filePath = path.join(__dirname, 'testOutput', 'noco-generated.ts');
const content = fs.readFileSync(filePath, 'utf-8');

const interfaceRegex = /export interface (\w+)/g;
let match;
const interfaces = new Set<string>();
const duplicates: string[] = [];

while ((match = interfaceRegex.exec(content)) !== null) {
  const name = match[1];
  if (interfaces.has(name)) {
    duplicates.push(name);
  } else {
    interfaces.add(name);
  }
}

if (duplicates.length > 0) {
  console.error('Found duplicate interfaces:', duplicates);
  process.exit(1);
} else {
  console.log('No duplicate interfaces found.');
  console.log(`Found ${interfaces.size} unique interfaces.`);
}
