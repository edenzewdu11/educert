# EduCerts backend - FastAPI
FROM python:3.12-slim

# Avoid .pyc files and buffer issues
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install Python dependencies first (better layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy the backend source
COPY . .

# Ensure runtime write directories exist (they may be gitignored/empty)
RUN mkdir -p generated_certs user_templates static templates

EXPOSE 8000

# Seed an initial admin (idempotent), then start the API.
CMD ["sh", "-c", "python seed_data.py; uvicorn main:app --host 0.0.0.0 --port 8000"]
