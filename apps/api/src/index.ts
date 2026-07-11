import { buildApp } from './app';
import { config } from './config';

export async function start() {
  const app = await buildApp();
  await app.listen({ port: config.PORT, host: '0.0.0.0' });
  console.log(`API running on http://localhost:${config.PORT}`);
}

if (typeof require !== 'undefined' && require.main === module) {
  start().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
