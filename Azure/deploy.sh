#!/bin/bash

export LOCATION=northeurope

function do_action {
    if [[ "$ACTION" == "C" ]]; then
        ./deploy-common.sh
    fi
    if [[ "$ACTION" == "A" ]]; then
        ./deploy-aks.sh
    fi
    if [[ "$ACTION" == "S" ]]; then
        ./deploy-storage.sh
    fi
}

if [ -z $SUBSCRIPTION_ID ]; then
    read -p "SUBSCRIPTION_ID: " SUBSCRIPTION_ID
fi

if [ -z $GROUP ]; then
    read -p "GROUP: " GROUP
fi

if [ -z "$TAGS" ]; then
    read -p "TAGS: " TAGS
fi

if [ -z $SUBSCRIPTION_ID ]; then
    echo "Please set the environment variable SUBSCRIPTION_ID"
fi

if [ -z $GROUP ]; then
    echo "Please set the environment variable GROUP"
    exit 1
fi

if [ -z "$TAGS" ]; then
    echo "Please set the environment variable TAGS"
    exit 1
fi

az login
az account set -s "$SUBSCRIPTION_ID"

if [ -z "$ACTION" ]; then
    while [[ 1 ]]; do
        echo "Enter C to deploy common components (resource group, vnet)"
        echo "Enter A to deploy the AKS cluster"
        echo "Enter S to deploy the Storage Account"
        echo "ctrl-c to exit"
        read -p "Action: " ACTION
        printf "\n\n"
        do_action
    done

else
    do_action
fi
exit 0
