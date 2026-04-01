#!/bin/sh

# Exit on error
set -e

echo "Running migrations..."
# In a real-world scenario, you might want to use 'deploy' 
# for production which only applies completed migrations.
# Here's how to do it safely:
npx prisma db push --schema=prisma/schema.prisma

echo "Starting the application..."
node dist/main
