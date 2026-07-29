#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="${PROJECT_DIR:-$HOME/anna-ai-voice-server}"
cd "$PROJECT_DIR"

if [[ ! -f .env ]]; then
  cp .env.example .env
  echo "Created .env. Edit it before production use: $PROJECT_DIR/.env"
  exit 1
fi

if ! curl -fsS http://127.0.0.1:11434/api/tags >/dev/null; then
  echo "Ollama is not reachable on 127.0.0.1:11434."
  exit 1
fi

docker compose pull || true
docker compose up -d --build --remove-orphans
docker image prune -f

docker compose ps
curl --retry 20 --retry-delay 5 --retry-connrefused -fsS http://127.0.0.1:8000/health
echo
echo "Deployment completed."
