#!/bin/bash
host_index=0 #todo: get this
IP=`ifconfig  | grep 'eth0' -A2 | grep -Po "(\d+\.){3}\d+" | head -n 1`

for i in {0..1}; do
        docker run --privileged -d -p "$IP:8${i}80:6080" -p "$IP:5${i}54:5554" -p "$IP:5${i}55:5555" -p "$IP:4${i}23:4723" --name "android-${host_index}-${i}-8-1-s7" \
            -e DEVICE="Samsung Galaxy S7" -e APPIUM="true" -e CONNECT_TO_GRID="true" -e MOBILE_WEB_TEST="true" \
            -e SELENIUM_HOST="10.10.0.10" -e SELENIUM_PORT="4444" -e APPIUM_HOST="$IP" -e APPIUM_PORT="4${i}23" \
            -v /mnt:/mnt budtmo/docker-android-x86-8.1
done
