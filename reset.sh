#!/bin/bash

# Script to reset the database by dropping the existing database and importing from SQL file

# Database connection settings from .env.local

bash ./tools/resetdb.sh # DEV
npx prisma migrate deploy
yarn db:generate
npx tsx tools/add-new-roles-modules.ts
yarn db:seed # DEV
