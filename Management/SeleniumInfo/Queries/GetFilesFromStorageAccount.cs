using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Info.Queries;
using Microsoft.Azure.Storage;
using Microsoft.Azure.Storage.Auth;
using Microsoft.Azure.Storage.File;

namespace SeleniumInfo.Queries
{
    public class GetFilesFromStorageAccount: IQuery<IEnumerable<CloudFile>>
    {
        private const string VmsFolderName = "vms";
        private readonly CloudFileDirectory vmsFolder;

        public GetFilesFromStorageAccount(StorageCredentials credentials, Uri storageUri, string shareName)
        {
            var client= new CloudFileClient(storageUri, credentials);
            this.vmsFolder = client.GetShareReference(shareName).GetRootDirectoryReference().GetDirectoryReference(VmsFolderName);
        }

        public async Task<IEnumerable<CloudFile>> Execute()
        {
            var files = this.vmsFolder.ListFilesAndDirectories()
                .OfType<CloudFile>().ToList();
            foreach (var cloudFile in files)
            {
                await cloudFile.FetchAttributesAsync();
            }

            return files;
        }

        public void Validate()
        {
        }
    }
}
