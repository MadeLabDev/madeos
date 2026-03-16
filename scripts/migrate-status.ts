import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
const prisma = new PrismaClient();

async function main() {
	const rows: any = await prisma.$queryRawUnsafe('SELECT * FROM _prisma_migrations ORDER BY finished_at DESC LIMIT 10');
	console.log(rows);
	await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1) });
