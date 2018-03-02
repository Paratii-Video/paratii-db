#!/bin/bash

# Usage:
#   ./deploy.sh production
#   ./deploy.sh staging
#   ./deploy.sh production verbose



if [[ $1 == staging ]]; then
    # ok
    echo "deploying to $1"
    ssh -o StrictHostKeyChecking=no paratii@build.paratii.video "cd ~/devops && sh deploy_db.sh staging </dev/null"
elif [[ $1 == production ]]; then
    # ok
    echo "deploying to $1"
    ssh -o StrictHostKeyChecking=no paratii@build.paratii.video "cd ~/devops && sh deploy_db.sh production </dev/null"
else
    echo "unknown parameter - please specify one of 'staging' or 'production'"
    exit
fi

if [[ $2 == verbose ]]; then
    ssh -o StrictHostKeyChecking=no paratii@build.paratii.video "cd ~/devops && fab deploy_db:$1 </dev/null"
else
    ssh -o StrictHostKeyChecking=no paratii@build.paratii.video "cd ~/devops && fab deploy_db:$1 </dev/null >ldeploy_db.log 2>&1 &"
fi
