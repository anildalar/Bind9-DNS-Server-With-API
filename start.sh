#!/bin/bash

# Start Node.js app using PM2
pm2 start /app/server.js

# Wait for PM2 to initialize the app (optional, depending on app startup time)
# sleep 5

# Start Bind9 service
named -g

# Alternatively, you can log Bind9 to syslog or a custom log file:
# service bind9 start && tail -f /var/log/syslog
