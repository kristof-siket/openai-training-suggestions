import { module } from '@prisma/composer';
import { envSecret } from '@prisma/composer-prisma-cloud';
import { postgres } from '@prisma/composer-prisma-cloud/orm';
import web from './service.mjs';
import workoutData from './db.mjs';

export default module('openai-training-suggestions', ({ provision }) => {
  const db = provision(
    postgres({ name: 'db', contract: workoutData, config: './prisma.config.ts' }),
  );
  provision(web, {
    deps: { db },
    input: {
      openaiApiKey: envSecret('OPENAI_API_KEY'), // Calls the OpenAI Chat API for workout suggestions.
    },
  });
});
