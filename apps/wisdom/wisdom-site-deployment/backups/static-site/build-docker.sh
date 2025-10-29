#!/bin/bash

# Docker Build Script for WisdomOS Site
# Created: 2025-01-19

echo "================================================"
echo "Building WisdomOS Docker Image"
echo "================================================"

# Navigate to the correct directory
cd '/Volumes/DevOps/07-personal/wisdom-site-deployment' || exit 1

# Build the Docker image
echo "🐳 Building Docker image..."
docker build -t wisdom-site:latest .

if [ $? -eq 0 ]; then
    echo "✅ Docker image built successfully!"
    echo ""
    echo "🚀 To run the container:"
    echo "   docker run -d -p 8080:80 --name wisdom-site wisdom-site:latest"
    echo ""
    echo "🐳 To run with docker-compose:"
    echo "   docker-compose up -d"
    echo ""
    echo "📦 To push to Docker Hub:"
    echo "   docker tag wisdom-site:latest yourusername/wisdom-site:latest"
    echo "   docker push yourusername/wisdom-site:latest"
else
    echo "❌ Docker build failed"
    exit 1
fi