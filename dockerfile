# 1. Build the React Frontend
FROM node:18-alpine as build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# 2. Setup Python Backend
FROM python:3.10-slim
WORKDIR /app

# Install dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy Backend Code
COPY backend/ .

# Copy the React build from step 1 into the backend's static folder
COPY --from=build /app/frontend/dist /app/static

# Expose port
EXPOSE 8000

# Run the server
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]