#!/bin/sh
[ -f /app/config.json ] && chown nextjs:nodejs /app/config.json
exec su-exec nextjs node server.js
