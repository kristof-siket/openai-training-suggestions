# AI workout planner using OpenAI Chat API
This repo contains a very simple example on how ChatGPT functionality can be built into your own app.

## App workflow

The main appp displays a list of different trainings that is stored in the app's PostgreSQL database (seeded by the app's first migration). By default, the training details column is empty. Then, we ask OpenAI Chat Completion API to give us a suggestion for the workout based on the place and the type of the workout.

The app is a small Node server (`server.mjs`) that serves the frontend, serves the workouts list from the database through its Prisma ORM client, and proxies the OpenAI Chat API calls so the API key stays on the server. The schema lives in `src/prisma/contract.prisma` (Prisma 8 data contract); migrations under `migrations/` are applied on deploy and by `prisma dev`.

## Trying it out

The app is a Prisma App, deployed with Prisma Composer. Two values come from the project on Prisma Cloud: its PostgreSQL database (provisioned through `module.mjs`) and the OpenAI API key, a secret input of the service read through `module.mjs` from the `OPENAI_API_KEY` platform variable (set it in the project before deploying).

To run the app locally, build it and start it with `prisma dev`, which wires the service the same way the deployment does, against a local PostgreSQL database:

```
npm install
npm run build
OPENAI_API_KEY=<your key> npx prisma dev --detach
```

`prisma dev` prints the app's URL (for example `http://localhost:3000`), where the app works as deployed. Stop it with `npx prisma dev stop`.

## Improvement ideas

This is a very tiny proof-of-concept, so there are several things that could be improved:
- Add feature to create new workouts. Each time you add a new one, ChatGPT could generate its program right after the creation.
- Currently we batch update all the empty training details fields from ChatGPT. This could be done in a more fine-grained way, so that the text would be updated on the UI step by step.
- Using some nice framework like React or Next.js and making a real app out of it.
