#!/bin/bash
set -e

chown -R openclaw:openclaw /data
chmod 700 /data

if [ ! -d /data/.linuxbrew ]; then
  cp -a /home/linuxbrew/.linuxbrew /data/.linuxbrew
fi

rm -rf /home/linuxbrew/.linuxbrew
ln -sfn /data/.linuxbrew /home/linuxbrew/.linuxbrew

mkdir -p /data/logs
chown -R openclaw:openclaw /data/logs

if [ -f /data/bin/openclaw-pid-guard.py ]; then
  gosu openclaw sh -c 'while true; do python3 /data/bin/openclaw-pid-guard.py; sleep 120; done' \
    >> /data/logs/pid-guard-runner.log 2>&1 &
fi

exec gosu openclaw node src/server.js
