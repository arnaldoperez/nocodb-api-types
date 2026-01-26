
import { generateClientBase } from './src/generator';

const output = generateClientBase();
if (output.includes('listLinkedRecords') && output.includes('ListLinkedRecordParams')) {
  console.log("Verification PASSED: listLinkedRecords method found.");
} else {
  console.log("Verification FAILED: listLinkedRecords method missing.");
  console.log(output.substring(output.length - 2000));
}
