#!/usr/bin/env bash
set -euo pipefail

printf '=== VERSION CHECK ===\n'
mongod --version | head -n 5

printf '\n=== MONGOSH VERSION ===\n'
mongosh --version

printf '\n=== SERVICE STATUS ===\n'
systemctl status mongod --no-pager

printf '\n=== ENABLED / ACTIVE ===\n'
systemctl is-enabled mongod
systemctl is-active mongod

printf '\n=== PORT LISTENER ===\n'
ss -lntp | grep 27017 || true

printf '\n=== CONFIG FILE ===\n'
sudo sed -n '1,120p' /etc/mongod.conf

printf '\n=== DATA DIRECTORY ===\n'
sudo ls -lah /var/lib/mongodb | head -n 40

printf '\n=== LOG DIRECTORY ===\n'
sudo ls -lah /var/log/mongodb

printf '\n=== RECENT LOGS ===\n'
sudo tail -n 40 /var/log/mongodb/mongod.log

printf '\n=== MONGOSH PING AND CRUD TEST ===\n'
mongosh --quiet --eval "printjson(db.adminCommand({ ping: 1 })); const lab = db.getSiblingDB('single_node_lab'); lab.install_check.insertOne({status:'ok', createdAt:new Date()}); printjson(lab.install_check.findOne({status:'ok'})); print('count=' + lab.install_check.countDocuments());"

printf '\n=== DATABASE LIST ===\n'
mongosh --quiet --eval "printjson(db.adminCommand({ listDatabases: 1 }).databases.map(d => ({ name: d.name, sizeOnDisk: d.sizeOnDisk })))"
