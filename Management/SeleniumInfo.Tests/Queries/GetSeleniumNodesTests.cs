using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Info.Queries;
using Microsoft.Azure.Storage;
using Microsoft.Azure.Storage.Auth;
using Microsoft.Azure.Storage.File;
using Moq;
using SeleniumInfo.Queries;
using Xunit;

namespace SeleniumInfo.Tests.Queries
{
    public class GetSeleniumNodesTests
    {
        private const string NewVm = "newvm";

        private const string Content =
            "List of devices attached\n" +
            "foo_0:5555	device\n" +
            "foo_1:5555	device\n";

        private readonly Mock<IQuery<IEnumerable<CloudFile>>> getFiles;

        public GetSeleniumNodesTests()
        {
            this.getFiles = new Mock<IQuery<IEnumerable<CloudFile>>>();
            this.getFiles.Setup(f => f.Execute()).ReturnsAsync(new List<MockCloudFile>(new[]
            {
                new MockCloudFile($"{NewVm}.txt", Content, DateTime.Now),
                new MockCloudFile("old.txt", Content, DateTime.Now.AddSeconds(0-GetSeleniumNodes.MaxAgeSecs - 1))
            }));
        }

        [Fact]
        public async Task Execute_WhenCalled_QueriesStorageAccount()
        {
            var query = new GetSeleniumNodes(this.getFiles.Object);
            query.Validate();
            await query.Execute();

            this.getFiles.Verify(f => f.Execute());
        }


        [Fact]
        public async Task Execute_WhenCalled_ReturnsNewVms()
        {
            var query = new GetSeleniumNodes(this.getFiles.Object);
            query.Validate();
            var result = await query.Execute();

            Assert.Single(result);
            Assert.Equal(NewVm, result.Keys.Single());
        }

        [Fact]
        public async Task Execute_WhenCalled_ReturnsDevices()
        {
            var query = new GetSeleniumNodes(this.getFiles.Object);
            query.Validate();
            var result = await query.Execute();

            var devices = result.Values.Single();
            Assert.Collection(devices,
                l => Assert.Equal("foo_0:5555", l),
                l => Assert.Equal("foo_1:5555", l));
        }
    }

    public class MockCloudFile : CloudFile
    {
        private readonly string name;
        private readonly FileProperties properties;
        private string content;

        public MockCloudFile(string name, string content, DateTimeOffset lastMod) : base(new Uri("https://foo.bar/bat"))
        {
            this.name = name;
            this.content = content;
            this.properties = new FileProperties();
            this.SetLastModified(this.properties, lastMod);
        }

        private void SetLastModified(FileProperties properties, DateTimeOffset lastModVal)
        {
            var lastMod = properties.GetType().GetProperty("LastModified");
            lastMod.SetValue(properties, lastModVal);
        }

        public override string Name => this.name;
        public override FileProperties Properties => this.properties;
        public override Task<Stream> OpenReadAsync()
        {
            return Task.FromResult((Stream)new MemoryStream(Encoding.Default.GetBytes(this.content)));
        }

        public override string DownloadText(Encoding encoding = null, AccessCondition accessCondition = null, FileRequestOptions options = null,
            OperationContext operationContext = null)
        {
            return this.content;
        }

        public override Task<string> DownloadTextAsync()
        {
            return Task.FromResult(this.content);
        }
    }
}
