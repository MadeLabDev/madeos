import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function check() {
	const tables = [
		{ name: 'FormData', column: 'data' },
		{ name: 'ModuleInstance', column: 'fieldValues' },
		{ name: 'ModuleType', column: 'fieldSchema' },
		{ name: 'ModuleType', column: 'lockedFields' },
		{ name: 'KnowledgeModuleTypes', column: 'fieldSchema' },
		{ name: 'UserProfileModules', column: 'data' },
		{ name: 'UserProfiles', column: 'metaData' },
	];

	for (const t of tables) {
		try {
			const q = `SELECT COUNT(*) as count FROM \`${t.name}\` WHERE JSON_VALID(\`${t.column}\`) = 0`;
			const res: any = await prisma.$queryRawUnsafe(q);
			const count = res[0]?.count ?? 0;
			console.log(`${t.name}.${t.column}: ${count} invalid rows`);
			if (count > 0) {
				const sampleQuery = `SELECT id, \`${t.column}\` as data FROM \`${t.name}\` WHERE JSON_VALID(\`${t.column}\`) = 0 LIMIT 10`;
				const sample: any = await prisma.$queryRawUnsafe(sampleQuery);
				console.log('Sample rows:', sample);
			}
		} catch (err) {
			console.error('Error checking', t.name, err);
		}
	}
	await prisma.$disconnect();
}

check().catch((e) => {
	console.error(e);
	process.exit(1);
});
