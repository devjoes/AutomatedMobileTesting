#!/bin/bash
trap 'kill %1; kill %2; kill %3' SIGINT
kubectl port-forward -n selenium svc/selenium-hub 4444:4444 & \
kubectl port-forward -n selenium svc/selenium-node-s7-droid-9-0 6080:6080 & \
#kubectl port-forward -n selenium svc/appium 4723:4723 & \
kubectl port-forward -n selenium svc/selenium-node-s7-droid-9-0 4723:4723 & \
sleep infinity
