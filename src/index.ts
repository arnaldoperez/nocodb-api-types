import { getProjects, getTables, getColumns } from './api';
import { generateInterface } from './generator';
import * as fs from 'fs';
import * as path from 'path';

const main = async () => {
  try {
    console.log('Connecting to NocoDB...');
    const projects = await getProjects();
    console.log(`Found ${projects.length} projects.`);

    let allTypes = '';

    for (const project of projects) {
      console.log(`Processing project: ${project.title}`);
      const tables = await getTables(project.id);
      
      for (const table of tables) {
        console.log(`  Processing table: ${table.title}`);
        const columns = await getColumns(table.id);
        const interfaceDef = generateInterface(table, columns);
        allTypes += `// Table: ${table.title} (${table.table_name})\n`;
        allTypes += interfaceDef + '\n\n';
      }
    }

    const outputDir = path.join(process.cwd(), 'src', 'types');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const outputPath = path.join(outputDir, 'noco-generated.ts');
    fs.writeFileSync(outputPath, allTypes);
    console.log(`Types generated at: ${outputPath}`);

  } catch (error) {
    console.error('Error generating types:', error);
    process.exit(1);
  }
};

main();
