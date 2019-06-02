using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Info.Queries;
using Microsoft.Azure.Storage;
using Microsoft.Azure.Storage.File;

namespace SeleniumInfo.Queries
{
    public class GetSeleniumNodes : IQuery<IDictionary<string, string[]>>
    {
        public const int MaxAgeSecs = 90;
        private IQuery<IEnumerable<CloudFile>> getFilesQuery;

        public GetSeleniumNodes(IQuery<IEnumerable<CloudFile>> getFilesQuery)
        {
            this.getFilesQuery = getFilesQuery;
        }

        public async Task<IDictionary<string, string[]>> Execute()
        {
            this.getFilesQuery.Validate();
            var files = await this.getFilesQuery.Execute();
            return files
                .Where(f => f.Properties.LastModified.HasValue &&
                            f.Properties.LastModified.Value.AddSeconds(MaxAgeSecs) > DateTimeOffset.Now)
                .ToDictionary(
                    k => k.Name.Replace(".txt", String.Empty, StringComparison.InvariantCultureIgnoreCase),
                    v => v.DownloadText()
                        .Split("\n")
                        .Skip(1)
                        .Select(l => l.Trim().Split("\t").First())
                        .Where(s => !string.IsNullOrWhiteSpace(s))
                        .ToArray()
                );
        }

        public void Validate()
        {
        }
    }
}
