#!/usr/bin/env node
const { generateAllTypes } = require('../dist/index.js');
const path = require('path');
const args = process.argv.slice(2);
const outputDir = args[0] || path.join(process.cwd(), 'nc-client');
generateAllTypes({ outputDir });
