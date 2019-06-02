#!/bin/bash

AKS_NAME="ui-testing"

# if [ -z "$AKS_NAME" ]; then
#     read -p "AKS_NAME: " AKS_NAME
# fi

# if [ -z $AKS_NAME ]; then
#     echo "Please set the environment variable AKS_NAME"
#     exit 1
# fi

if [ ! -f subnet_id.ignore ]; then
    echo "subnet_id.ignore not found. Have you installed the 'common'"
    exit 1
fi

SUBNET_ID=`cat subnet_id.ignore`

echo "This will enable preview features on the ENTIRE subscription $SUBSCRIPTION_ID."
echo "Is autoscaling still a preview feature in AKS? Go and CHECK !!!!"
read -p "Press enter to enable preview features"
#todo press y
echo "Installing the preview version of the CLI"
az extension add --name aks-preview

echo "Enabling preview features the subscription $SUBSCRIPTION_ID"
az feature register --name VMSSPreview --namespace Microsoft.ContainerService
az provider register --namespace Microsoft.ContainerService

ready="0"
printf "Please wait..."
until az feature list -o table --query "[?contains(name, 'Microsoft.ContainerService/VMSSPreview')].{Name:name,State:properties.state}" | grep Registered > /dev/null
do
    sleep 10s
    printf "."
done
printf "\n\n"

set -e



read -p "Press enter to create the AKS cluster '$AKS_NAME' in the resource group '$GROUP'"

if [ -f ~/.azure/aksServicePrincipal.json ]; then
    rm ~/.azure/aksServicePrincipal.json
fi


echo az aks create \
  --resource-group "$GROUP" \
  --name "$AKS_NAME" \
  --node-count 1 \
  --enable-vmss \
  --enable-cluster-autoscaler \
  --generate-ssh-keys \
  --disable-rbac \
  --node-vm-size Standard_D4s_v3 \
  --vnet-subnet-id "$SUBNET_ID" \
  --min-count 1 \
  --max-count 5


az aks create \
  --resource-group "$GROUP" \
  --name "$AKS_NAME" \
  --node-count 1 \
  --enable-vmss \
  --enable-cluster-autoscaler \
  --generate-ssh-keys \
  --disable-rbac \
  --node-vm-size Standard_D4s_v3 \
  --vnet-subnet-id "$SUBNET_ID" \
  --min-count 1 \
  --max-count 5


 SP=`cat ~/.azure/aksServicePrincipal.json | grep -Eo 'service_principal.*$' | grep -Eo '[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}'`
 echo "Service principal ID: $SP"

az role assignment create --role owner -g "$GROUP" --assignee "$SP"


echo "Finished"
echo "Backup these SSH keys!"
echo "/root/.ssh/id_rsa"
cat /root/.ssh/id_rsa
echo "/root/.ssh/id_rsa.pub"
cat /root/.ssh/id_rsa.pub
echo .
echo "Connect to cluster using:"
echo .
echo "az aks get-credentials -g $GROUP -n $AKS_NAME"