#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUTPUT_DIR="${ROOT_DIR}/dist"
PROJECT_NAME="saleparts-ai-agent-source"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
OUTPUT_FILE="${OUTPUT_DIR}/${PROJECT_NAME}-${TIMESTAMP}.zip"

mkdir -p "${OUTPUT_DIR}"

cd "${ROOT_DIR}"

zip -r "${OUTPUT_FILE}" . \
  -x "./.git/*" \
  -x "./node_modules/*" \
  -x "./ai-backend/node_modules/*" \
  -x "./dist/*" \
  -x "./*.log" \
  -x "./ai-backend/.env" \
  -x "./.env"

echo "Created source archive: ${OUTPUT_FILE}"
