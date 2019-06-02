FROM microsoft/azure-cli
WORKDIR /root
COPY . .
RUN dos2unix *.sh
RUN chmod 755 *.sh
WORKDIR /root/
CMD "./deploy.sh"