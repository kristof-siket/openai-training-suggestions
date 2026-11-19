// The app's service declaration. Everything the running app needs arrives
// through it: the port (service.port()), the input (service.input()), and
// its database (service.load()).
import { compute } from '@prisma/composer-prisma-cloud';
import { postgres } from '@prisma/composer-prisma-cloud/orm';
import nodeBuild from '@prisma/composer/node';
import { type } from 'arktype';
import { secretString } from '@prisma/composer/arktype';
import workoutData from './db.mjs';

export default compute({
  name: 'web',
  deps: { db: postgres(workoutData) },
  input: type({
    // The OpenAI API key: the server uses it for the chat completions it
    // proxies for the browser.
    openaiApiKey: secretString(),
  }),
  build: nodeBuild({
    module: import.meta.url,
    dir: './dist',
    entry: './server.mjs',
    dependencies: 'external',
  }),
});
