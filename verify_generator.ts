
import { generateClientBase } from './src/generator';

const output = generateClientBase();
if (output.includes('xcAuth?: string;') &&
    output.includes("if (config.xcAuth) {") &&
    output.includes("headers['xc-auth'] = config.xcAuth;") &&
    output.includes("headers['xc-gui'] = 'true';")) {
    console.log("Verification PASSED: xcAuth logic found.");
} else {
    console.log("Verification FAILED: xcAuth logic missing.");
    console.log(output.substring(0, 1000));
}
