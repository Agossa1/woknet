import dotenv from 'dotenv';
import path from 'path';

const envFile = process.env.NODE_ENV === 'production' ? '.env' : '.env';
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

// Optionally export parsed env for other modules
export default process.env;
