using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using InfluxDB.Net.Contracts;
using InfluxDB.Net.Models;
using Management.Core;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using MockHttpClient;
using StackExchange.Redis;

namespace DataLogger.Tests
{
    public class UnitTest1
    {
        private const string NodesUrl = "http://seleniuminfo/api/nodes";
        private Mock<IConfiguration> config;

        public UnitTest1()
        {
            this.config = new Mock<IConfiguration>();
            this.config.SetupGet(c => c["SeleniumNodesUrl"]).Returns(NodesUrl);
        }

        [Fact]
        public async Task CreateInfluxDbIfMissing_DoesNothing_IfPresent()
        {
            var db = new Mock<IInfluxDb>();
            db.Setup(d => d.ShowDatabasesAsync())
                .ReturnsAsync(() => new List<Database> { new Database { Name = Constants.InfluxDb } });
            var recordNodes = new RecordNodes(this.config.Object,null, db.Object, null, null);

            await recordNodes.CreateInfluxDbIfMissing();

            db.Verify(d => d.CreateDatabaseAsync(Constants.InfluxDb), Times.Never);
        }

        [Fact]
        public async Task CreateInfluxDbIfMissing_CreatesDb_IfMissing()
        {
            var db = new Mock<IInfluxDb>();
            db.Setup(d => d.ShowDatabasesAsync())
                .ReturnsAsync(() => new List<Database>());
            var recordNodes = new RecordNodes(this.config.Object,null, db.Object, null, null);

            await recordNodes.CreateInfluxDbIfMissing();

            db.Verify(d => d.CreateDatabaseAsync(Constants.InfluxDb), Times.Once);
        }

        [Fact]
        public async Task RecordNodesToDb_WritesNewNodesToDb_WhenCalled()
        {
            var httpClient = new MockHttpClient.MockHttpClient();

            httpClient
                .When(NodesUrl)
                .Then(req => new HttpResponseMessage()
                    .WithJsonContent(new
                    {
                        droid7227000007 = new[] { "droid7227000007_0:5555", "droid7227000007_1:5555", "droid7227000007_2:5555" }
                    }));
            var db = new Mock<IDatabase>();
            db.Setup(d => d.HashGetAllAsync(Constants.RedisNodesHash, CommandFlags.None)).ReturnsAsync(() => new[]
            {
                new HashEntry("droid7227000007_0:5555", string.Empty),
            });

            var logger = new Mock<ILogger<RecordNodes>>();

            var recordNodes = new RecordNodes(this.config.Object, httpClient, null, db.Object, logger.Object);

            await recordNodes.Store();

            db.Verify(d => d.HashSetAsync(
                It.Is<RedisKey>(k => k.ToString() == Constants.RedisNodesHash),
                It.Is<RedisValue>(f => f.ToString() == "droid7227000007_0:5555"),
                It.Is<RedisValue>(f => f.ToString() == string.Empty), When.Always, CommandFlags.None), Times.Never);
            db.Verify(d => d.HashSetAsync(It.Is<RedisKey>(k => k.ToString() == Constants.RedisNodesHash),
                It.Is<RedisValue>(f => f.ToString() == "droid7227000007_1:5555"),
                It.Is<RedisValue>(f => f.ToString() == string.Empty), When.Always, CommandFlags.None), Times.Once);
            db.Verify(d => d.HashSetAsync(It.Is<RedisKey>(k => k.ToString() == Constants.RedisNodesHash),
                It.Is<RedisValue>(f => f.ToString() == "droid7227000007_2:5555"),
                It.Is<RedisValue>(f => f.ToString() == string.Empty), When.Always, CommandFlags.None), Times.Once);

            logger.Verify(m => m.Log(It.Is<LogLevel>(l => l == LogLevel.Information), 0,
                It.IsAny<object>(), It.IsAny<TaskCanceledException>(), It.IsAny<Func<object, Exception, string>>()), Times.Exactly(2));
        }


        [Fact]
        public async Task RecordNodesToDb_RemovesOldNodesFromDb_WhenCalled()
        {
            var httpClient = new MockHttpClient.MockHttpClient();

            httpClient
                .When(NodesUrl)
                .Then(req => new HttpResponseMessage()
                    .WithJsonContent(new
                    {
                        droid7227000007 = new[] { "droid7227000007_0:5555", "droid7227000007_1:5555", "droid7227000007_2:5555" }
                    }));
            var db = new Mock<IDatabase>();
            db.Setup(d => d.HashGetAllAsync(Constants.RedisNodesHash, CommandFlags.None)).ReturnsAsync(() => new[]
            {
                new HashEntry("droid7227000007_4:5555", string.Empty),
            });

            var logger = new Mock<ILogger<RecordNodes>>();
            var recordNodes = new RecordNodes(this.config.Object,httpClient, null, db.Object, logger.Object);

            await recordNodes.Store();

            db.Verify(d => d.HashSetAsync(It.Is<RedisKey>(k => k.ToString() == Constants.RedisNodesHash),
                It.Is<RedisValue>(f => f.ToString() == "droid7227000007_3:5555"),
                It.Is<RedisValue>(f => f.ToString() == string.Empty), When.Always, CommandFlags.None), Times.Never);
            db.Verify(d => d.HashDeleteAsync(
                It.Is<RedisKey>(k => k.ToString() == Constants.RedisNodesHash),
                It.Is<RedisValue>(f => f.ToString() == "droid7227000007_4:5555"), CommandFlags.None), Times.Once);
            
            logger.Verify(m => m.Log(It.Is<LogLevel>(l => l == LogLevel.Information), 0,
                It.IsAny<object>(), It.IsAny<TaskCanceledException>(), It.IsAny<Func<object, Exception, string>>()), Times.Exactly(4));
        }
    }
}
