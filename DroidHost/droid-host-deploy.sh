#!/bin/bash

echo "Installing docker"

apt-get update
apt-get install \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg2 \
    software-properties-common -y
curl -fsSL https://download.docker.com/linux/debian/gpg | apt-key add -
add-apt-repository \
   "deb [arch=amd64] https://download.docker.com/linux/debian \
   $(lsb_release -cs) \
   stable"
apt-get update
apt-get install docker-ce docker-ce-cli containerd.io -y

echo "Installed docker"

set -e

echo "Setting up mount point"
apt-get install cifs-utils -y
mkdir -p /mnt/apps
sudo mount -t cifs //$STORAGE_NAME.file.core.windows.net/apps /mnt/apps -o vers=3.0,username=$STORAGE_NAME,password=$STORAGE_KEY,dir_mode=0777,file_mode=0777,serverino
umount /mnt/apps
echo "//$STORAGE_NAME.file.core.windows.net/apps /mnt/apps cifs vers=3.0,username=$STORAGE_NAME,password=$STORAGE_KEY,dir_mode=0777,file_mode=0777" >> /etc/fstab
mount -a