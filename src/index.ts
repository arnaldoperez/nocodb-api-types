import { getProjects, getTables, getColumns } from './api';
import { generateInterface, sanitizeClassName, sanitizeFileName } from './generator';
import * as fs from 'fs';
import * as path from 'path';

export const generateAllTypes = async (config: { outputDir: string } = { outputDir: path.join(process.cwd(), 'testOutput') }) => {
  try {
    console.log('Connecting to NocoDB...');
    const projects = await getProjects();
    console.log(`Found ${projects.length} projects.`);

    const { outputDir } = config;
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    for (const project of projects) {
      console.log(`Processing project: ${project.title}`);
      let projectTypes = '';
      const usedInterfaceNames = new Map<string, number>();
      
      const tables = await getTables(project.id);
      
      for (const table of tables) {
        console.log(`  Processing table: ${table.title}`);
        const columns = await getColumns(table.id);
        
        let interfaceName = sanitizeClassName(table.table_name);
        if (usedInterfaceNames.has(interfaceName)) {
          const count = usedInterfaceNames.get(interfaceName)! + 1;
          usedInterfaceNames.set(interfaceName, count);
          interfaceName = `${interfaceName}_${count}`;
        } else {
          usedInterfaceNames.set(interfaceName, 1);
        }

        const interfaceDef = generateInterface(table, columns, interfaceName);
        projectTypes += `// Table: ${table.title} (${table.table_name})\n`;
        projectTypes += interfaceDef + '\n\n';
      }

      const fileName = `${sanitizeFileName(project.title)}.ts`;
      const outputPath = path.join(outputDir, fileName);
      fs.writeFileSync(outputPath, projectTypes);
      console.log(`Types generated for project "${project.title}" at: ${outputPath}`);
    }

  } catch (error) {
    console.error('Error generating types:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  generateAllTypes();
}
