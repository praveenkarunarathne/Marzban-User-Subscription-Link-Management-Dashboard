#!/bin/bash

ENV_FILE="/opt/marzban/.env"

# Ask for Webhook Address
read -p "Enter Apps Script URL: " WEBHOOK_ADDRESS

# Ensure directory exists
if [ ! -d "/opt/marzban" ]; then
  echo "Directory /opt/marzban does not exist. Creating it..."
  mkdir -p "/opt/marzban"
fi

# Ensure file exists
if [ ! -f "$ENV_FILE" ]; then
  echo "Creating $ENV_FILE..."
  touch "$ENV_FILE"
fi

# Update or Append WEBHOOK_ADDRESS
if grep -q "^WEBHOOK_ADDRESS=" "$ENV_FILE"; then
  sed -i "s|^WEBHOOK_ADDRESS=.*|WEBHOOK_ADDRESS=\"$WEBHOOK_ADDRESS\"|" "$ENV_FILE"
else
  echo "WEBHOOK_ADDRESS=\"$WEBHOOK_ADDRESS\"" >> "$ENV_FILE"
fi

# Update or Append JOB_SEND_NOTIFICATIONS_INTERVAL
if grep -q "^JOB_SEND_NOTIFICATIONS_INTERVAL=" "$ENV_FILE"; then
  sed -i "s|^JOB_SEND_NOTIFICATIONS_INTERVAL=.*|JOB_SEND_NOTIFICATIONS_INTERVAL=60|" "$ENV_FILE"
else
  echo "JOB_SEND_NOTIFICATIONS_INTERVAL=60" >> "$ENV_FILE"
fi

echo "Configuration updated in $ENV_FILE"

marzban restart