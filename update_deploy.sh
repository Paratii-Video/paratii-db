#!/bin/bash

ssh -o StrictHostKeyChecking=no ec2-user@35.166.190.37 << EOF
sudo cp -r paratii-db/* /home/paratii/paratii-db
sudo sh restart.sh
EOF
