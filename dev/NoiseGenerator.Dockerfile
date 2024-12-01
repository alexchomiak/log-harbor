# * Create Dockerfile for NoiseGenerator.py

# Use the official Python image
FROM python:3.8-slim

# Set working directory
WORKDIR /app/

# Copy Code
COPY NoiseGenerator.py ./

CMD ["python", "NoiseGenerator.py"]