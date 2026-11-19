// The app's server. It serves the static frontend, serves the workouts list
// from the app's database the way json-server served data.json, and proxies
// OpenAI Chat API calls so the API key stays on the server.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import service from './service.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const OPENAI_CHAT_API_URL = 'https://api.openai.com/v1/chat/completions';

const { db } = service.load();
const { openaiApiKey } = service.input();

const toApiWorkout = (workout) => ({
  id: workout.id,
  date: workout.date,
  exercises: workout.exercises.map((exercise) => ({
    type: exercise.type,
    place: exercise.place,
    details: exercise.details,
  })),
});

const readBody = (req) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });

const staticFiles = {
  '/': { file: 'index.html', contentType: 'text/html; charset=utf-8' },
  '/index.html': { file: 'index.html', contentType: 'text/html; charset=utf-8' },
  '/script.js': { file: 'script.js', contentType: 'text/javascript; charset=utf-8' },
};

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  const send = (status, body, contentType = 'application/json; charset=utf-8') => {
    res.writeHead(status, { 'Content-Type': contentType });
    res.end(body);
  };

  try {
    if (req.method === 'GET' && url.pathname === '/workouts') {
      const workouts = await db.client.orm.public.Workout
        .orderBy((workout) => workout.id.asc())
        .include('exercises', (exercises) => exercises.orderBy((exercise) => exercise.id.asc()))
        .all();
      send(200, JSON.stringify(workouts.map(toApiWorkout)));
      return;
    }

    const putMatch = req.method === 'PUT' && url.pathname.match(/^\/workouts\/([^/]+)$/);
    if (putMatch) {
      const id = Number(putMatch[1]);
      const workout = JSON.parse(await readBody(req));
      if (typeof workout?.date !== 'string' || !Array.isArray(workout.exercises)) {
        send(400, JSON.stringify({}));
        return;
      }
      const updated = await db.client.transaction(async (tx) => {
        const rows = await tx.orm.public.Workout
          .select('id')
          .where({ id })
          .update({ date: workout.date });
        if (rows.length === 0) {
          return null;
        }
        await tx.orm.public.Exercise.where({ workoutId: id }).deleteAll();
        for (const exercise of workout.exercises) {
          await tx.orm.public.Exercise.create({
            workoutId: id,
            type: exercise.type,
            place: exercise.place,
            details: exercise.details ?? null,
          });
        }
        return workout;
      });
      if (!updated) {
        send(404, JSON.stringify({}));
        return;
      }
      send(200, JSON.stringify(workout));
      return;
    }

    // OpenAI Chat API proxy: forwards the browser's chat completion request
    // with the API key attached server-side.
    if (req.method === 'POST' && url.pathname === '/openai/chat/completions') {
      const upstream = await fetch(OPENAI_CHAT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiApiKey.expose()}`,
        },
        body: await readBody(req),
      });
      send(upstream.status, await upstream.text());
      return;
    }

    const staticFile = req.method === 'GET' ? staticFiles[url.pathname] : undefined;
    if (staticFile) {
      send(200, await readFile(join(here, staticFile.file), 'utf8'), staticFile.contentType);
      return;
    }

    send(404, JSON.stringify({}));
  } catch (error) {
    send(500, JSON.stringify({ error: String(error) }));
  }
});

server.listen(service.port(), '0.0.0.0');
