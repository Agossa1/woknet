
import PostgresDatabase from './src/config/databases/configDB';
import { CompaniesRepository } from './src/modules/companies/companies.repository';
import Logger from './src/infra/logger/winston';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

async function testAppLogic() {
    const db = new PostgresDatabase();
    await db.connect();

    // Mock logger
    const logger = { instance: console } as any as Logger;

    const repo = new CompaniesRepository(db, logger);

    try {
        console.log("Testing getCompanyBySlug('ben-market')...");
        const company = await repo.getCompanyBySlug('ben-market');
        console.log("Result:", company);
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await db.close();
    }
}

testAppLogic();
