#!/bin/bash
node server/init-db.js
node server/index.js &
npx vite --port 5000
