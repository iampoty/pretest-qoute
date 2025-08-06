#!/bin/bash

# kill $(ps ef -C server | grep server | awk '{print $1}')

echo "Building backend image..."
docker-compose build backend

echo "Restarting backend container..."
docker-compose up -d backend

echo "Backend restarted successfully!"
