#!/usr/bin/env bash
set -euo pipefail
rm -rf creator-college-junior-v9
base64 -d deploy/creator-college-junior-runtime.tar.xz.b64 | tar -xJf -
cd creator-college-junior-v9
npm install
npm run build
