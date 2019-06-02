#!/bin/bash

echo "Creating resource group $GROUP"
az group create -n "$GROUP" -l "$LOCATION" --tags "$TAGS"

echo "Creating VNET common"
NAME="vnet-common"
az network vnet create --resource-group "$GROUP" --name "$NAME" --address-prefix 10.10.0.0/16 --subnet-name common --subnet-prefix 10.10.0.0/24 | tee vnet.tmp
cat vnet.tmp | grep "virtualNetworks/$NAME/subnets" | grep -Eo "\"/.*\"" > subnet_id.ignore
printf "Subnet ID: "
cat subnet_id.ignore

