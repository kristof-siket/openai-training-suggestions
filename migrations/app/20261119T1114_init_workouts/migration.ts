#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/4cefb5069e45a2c190c6653a4bf3a62aaddbf8c5951050c3f228c0f68ac94892/contract';
import endContract from '../../snapshots/4cefb5069e45a2c190c6653a4bf3a62aaddbf8c5951050c3f228c0f68ac94892/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, primaryKey, rawSql } from '@prisma/orm-postgres/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'public' }),
      this.createTable({
        schema: 'public',
        table: 'Exercise',
        columns: [
          col('details', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('place', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('type', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('workoutId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'Workout',
        columns: [
          col('date', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Exercise',
        index: 'Exercise_workoutId_idx_7a4e5f00',
        columns: ['workoutId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Exercise',
        foreignKey: {
          name: 'Exercise_workoutId_fkey',
          columns: ['workoutId'],
          references: { schema: 'public', table: 'Workout', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      // Seed the workouts the app originally loaded from data.json, so a
      // fresh database starts with the same list. Ids come from the SERIAL
      // columns in insertion order, so the exercises reference 1..8.
      rawSql({
        id: 'seed.workouts',
        label: 'Seed the initial workouts',
        operationClass: 'additive',
        target: { id: 'seed-workouts', details: { schema: 'public', name: 'Workout' } },
        precheck: [],
        execute: [
          {
            description: 'Insert the initial workouts',
            sql: `INSERT INTO "public"."Workout" ("date") VALUES
  ('2023-03-21'),
  ('2023-03-22'),
  ('2023-03-23'),
  ('2023-03-24'),
  ('2023-03-25'),
  ('2023-03-26'),
  ('2023-03-27'),
  ('2023-03-28');`,
          },
          {
            description: 'Insert the initial exercises',
            sql: `INSERT INTO "public"."Exercise" ("workoutId", "type", "place") VALUES
  (1, 'leg', 'gym'),
  (1, 'arm', 'home'),
  (2, 'cardio', 'office'),
  (2, 'chest', 'gym'),
  (3, 'back', 'home'),
  (3, 'leg', 'gym'),
  (4, 'arm', 'office'),
  (4, 'chest', 'gym'),
  (5, 'cardio', 'home'),
  (5, 'leg', 'gym'),
  (6, 'back', 'office'),
  (6, 'chest', 'gym'),
  (7, 'arm', 'home'),
  (7, 'leg', 'gym'),
  (8, 'cardio', 'gym'),
  (8, 'chest', 'gym');`,
          },
        ],
        postcheck: [],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
