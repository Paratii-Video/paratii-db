#!/bin/bash

# Usage:
#   ./deploy.sh production
#   ./deploy.sh staging

echo "deploying to $1"
if [[ $1 == staging ]]; then
    host=db-staging.paratii.video
    branch=dev
elif [[ $1 == production ]]; then
    host=db.paratii.video
    branch=master
else
    echo "unknown parameter - please specify one of 'staging' or 'production'"
    exit
fi
ssh -o StrictHostKeyChecking=no paratii@$host << EOF
  cd paratii-db/ && git checkout ${branch} && git pull && npm i
  pm2 restart run.json --env $1
EOF
