import { getProjects, getTables, getColumns } from './api';
import { generateInterface, sanitizeClassName, sanitizeFileName, generateClientBase, generateProjectClient, generateLinkedFieldsEnum } from './generator';
import * as fs from 'fs';
import * as path from 'path';

export const generateAllTypes = async (config: { outputDir: string } = { outputDir: path.join(process.cwd(), 'nc-client') }) => {
  try {
    console.log('Connecting to NocoDB...');
    const projects = await getProjects();
    console.log(`Found ${projects.length} projects.`);

    const { outputDir } = config;
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Generate Client Base
    const clientBase = generateClientBase();
    fs.writeFileSync(path.join(outputDir, 'client-base.ts'), clientBase);
    console.log(`Client base generated at: ${path.join(outputDir, 'client-base.ts')}`);

    for (const project of projects) {
      console.log(`Processing project: ${project.title}`);
      let projectTypes = '';

      const tables = await getTables(project.id);
      const tableInterfaceMap = new Map<string, string>();
      const usedInterfaceNames = new Map<string, number>();

      // 1. Pre-calculate interface names
      for (const table of tables) {
        let interfaceName = sanitizeClassName(table.table_name);
        if (usedInterfaceNames.has(interfaceName)) {
          const count = usedInterfaceNames.get(interfaceName)! + 1;
          usedInterfaceNames.set(interfaceName, count);
          interfaceName = `${interfaceName}_${count}`;
        } else {
          usedInterfaceNames.set(interfaceName, 1);
        }
        tableInterfaceMap.set(table.id, interfaceName);
      }

      const projectTables: { title: string; table_name: string; id: string; interfaceName: string; hasLinkedFieldsEnum?: boolean }[] = [];

      // 2. Generate types
      for (const table of tables) {
        console.log(`  Processing table: ${table.title}`);
        const columns = await getColumns(table.id);
        const interfaceName = tableInterfaceMap.get(table.id)!;

        const interfaceDef = generateInterface(table, columns, interfaceName, tableInterfaceMap);
        projectTypes += `// Table: ${table.title} (${table.table_name})\n`;
        projectTypes += interfaceDef + '\n\n';

        const enumDef = generateLinkedFieldsEnum(table, columns, interfaceName);
        let hasLinkedFieldsEnum = false;
        if (enumDef) {
          projectTypes += enumDef + '\n\n';
          hasLinkedFieldsEnum = true;
        }

        projectTables.push({
          title: table.title,
          table_name: table.table_name,
          id: table.id,
          interfaceName,
          hasLinkedFieldsEnum
        });
      }

      const fileName = `${sanitizeFileName(project.title)}.ts`;
      const outputPath = path.join(outputDir, fileName);
      const contentWithImport = `import { Attachment } from './client-base';\n\n${projectTypes}`;
      fs.writeFileSync(outputPath, contentWithImport);
      console.log(`Types generated for project "${project.title}" at: ${outputPath}`);

      // Generate Project Client
      const projectClient = generateProjectClient(project.title, projectTables);
      const clientFileName = `${sanitizeFileName(project.title)}-client.ts`;
      fs.writeFileSync(path.join(outputDir, clientFileName), projectClient);
      console.log(`Client generated for project "${project.title}" at: ${path.join(outputDir, clientFileName)}`);
    }

  } catch (error) {
    console.error('Error generating types:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  const args = process.argv.slice(2);
  const outputDir = args[0] || path.join(process.cwd(), 'nc-client');
  generateAllTypes({ outputDir });
}
