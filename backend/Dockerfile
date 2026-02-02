# backend/Dockerfile
FROM python:3.10-slim

WORKDIR /app

# Install uv
RUN pip install uv

# Copy dependency file
COPY pyproject.toml ./

# Install dependencies
RUN uv pip install --system -e .

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Start command
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
