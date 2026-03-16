import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
const prisma = new PrismaClient();
(async () => {
	const tables: any = await prisma.$queryRawUnsafe('SHOW TABLES');
	console.log(tables);
	await prisma.$disconnect();
})();
