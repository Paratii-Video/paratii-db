#!/bin/bash

ssh -o StrictHostKeyChecking=no ec2-user@35.166.190.37 << EOF
sudo sh restart.sh
EOF
