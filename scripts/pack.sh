#!/usr/bin/env bash
set -e

APP_NAME="web3-api-gateway"
BUILD_DIR="build"

VERSION=$(node -p "require('./package.json').version")

mkdir -p "${BUILD_DIR}"

tar -czf "${BUILD_DIR}/${APP_NAME}-v${VERSION}.tar.gz" \
  dist \
  package.json \
  package-lock.json \
  README.md \
  AGENT.md \
  doc

echo "Completed: ${BUILD_DIR}/${APP_NAME}-v${VERSION}.tar.gz"