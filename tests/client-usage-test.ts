import { EstudiantesClient } from '../testOutput/estudiantes-client';
import { config } from '../src/config';

async function testClient() {
  console.log('Testing generated client...');
  
  const db = new EstudiantesClient({
    baseURL: config.nocoUrl,
    token: config.xcToken
  });

  console.log('Client instantiated.');

  // Check if properties exist (compile-time check mainly)
  if (db.Matricula) {
    console.log('Table Matricula exists on client.');
  }

  try {
    console.log('Listing matriculas...');
    const result = await db.Matricula.list({ limit: 1 });
    console.log('List result:', result);
  } catch (error: any) {
    console.error('List failed (expected if network/auth issues):', error.message);
  }
}

testClient();
