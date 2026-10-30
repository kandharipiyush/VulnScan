FROM python:3.10-slim

WORKDIR /app

# Install git, curl, and build tools for repository cloning and scanning
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create persistent storage folders
RUN mkdir -p /app/generated_reports /app/scanned_repos

# Pre-seed SQLite database if not present
RUN python seed.py || true

ENV PORT=8000
EXPOSE 8000

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]

