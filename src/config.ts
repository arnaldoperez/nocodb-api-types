import * as dotenv from 'dotenv';
dotenv.config();

export const config = {
  nocoUrl: (process.env.NOCODB_URL || 'http://localhost:8080').trim().replace(/\/$/, ''),
  xcToken: (process.env.XC_TOKEN || '').trim(),
};


if (!config.xcToken) {
  console.warn('XC_TOKEN is not set. API calls might fail.');
}
