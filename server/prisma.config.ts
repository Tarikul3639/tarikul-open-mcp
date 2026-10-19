import { config as loadEnv } from 'dotenv';
import { defineConfig } from 'prisma/config';

for (const path of ['.env', '.env.local', '.env.prod']) {
  loadEnv({ path });
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env['DATABASE_URL'],
  },
});
