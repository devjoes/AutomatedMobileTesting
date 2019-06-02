#!/bin/bash

# jsuiautomationapps
if [ -z "$STORAGE_NAME" ]; then
    read -p "STORAGE_NAME: " STORAGE_NAME
fi

if [ -z $STORAGE_NAME ]; then
    echo "Please set the environment variable STORAGE_NAME"
    exit 1
fi

az storage account create -n $STORAGE_NAME -g $GROUP
CONNECTION_STRING=$(az storage account show-connection-string -n $STORAGE_NAME -g $GROUP --query 'connectionString' -o tsv)
az storage share create --name apps --quota 1024 --connection-string $CONNECTION_STRING
export STORAGE_KEY=$(az storage account keys list -g $GROUP -n $STORAGE_NAME --query "[0].value" -o tsv)
export STORAGE_NAME="$STORAGE_NAME"


printf "\n\n"
echo "STORAGE_NAME=\"$STORAGE_NAME\""
echo "STORAGE_KEY=\"$STORAGE_KEY\""
printf "\n\n"
