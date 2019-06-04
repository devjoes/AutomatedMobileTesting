using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DockerizedTesting.Redis;
using Management.Api.Commands;
using Management.Core;
using Microsoft.Extensions.Logging;
using Moq;
using StackExchange.Redis;
using Xunit;

namespace Management.Api.Tests.Commands
{
    public class DeAllocateEmulatorTests : IClassFixture<RedisFixture>
    {
        private readonly RedisFixture redis;
        private readonly ConnectionMultiplexer connection;
        private readonly Mock<ILogger<DeAllocateEmulator>> logger;

        public DeAllocateEmulatorTests(RedisFixture redis)
        {
            redis.Start().Wait();
            this.redis = redis;
            this.logger = new Mock<ILogger<DeAllocateEmulator>>();
            this.connection = ConnectionMultiplexer.Connect(ConfigurationOptions.Parse("localhost:" + this.redis.Ports.Single()));
        }

        [InlineData(null)]
        [InlineData("")]
        [Theory]
        public void Validate_Throws_WhenNoEmulatorIsProvided(string emulator)
        {
            var cmd = new DeAllocateEmulator(null,null)
            {
                Emulator = emulator
            };

            Assert.Throws<ArgumentNullException>(() => cmd.Validate());
        }

        [InlineData(null)]
        [InlineData("")]
        [Theory]
        public void Validate_Throws_WhenNoTestNameIsProvided(string testName)
        {
            var cmd = new DeAllocateEmulator(null, null)
            {
                Emulator = testName
            };

            Assert.Throws<ArgumentNullException>(() => cmd.Validate());
        }


        [Fact]
        public async Task Execute_ClearsEmulator_WhenFound()
        {
            string now = DateTime.UtcNow.ToString("s");
            string testName = "foo";
            const string nodeName = "bar";

            var db = this.connection.GetDatabase();
            await db.HashSetAsync(Constants.RedisNodesHash, nodeName, $"{now}|{testName}");

            var cmd = new DeAllocateEmulator(db, this.logger.Object)
            {
                Emulator = nodeName,
                TestName = testName
            };

            await cmd.Execute();

            var test = await db.HashGetAsync(Constants.RedisNodesHash, nodeName);
            Assert.Equal(string.Empty, test);
            this.logger.Verify(m => m.Log(It.Is<LogLevel>(l => l == LogLevel.Information), 0,
                It.IsAny<object>(), It.IsAny<TaskCanceledException>(), It.IsAny<Func<object, Exception, string>>()), Times.Once);
        }

        [Fact]
        public async Task Execute_RemovesEmulator_WhenSeveralQueued()
        {
            string now = DateTime.UtcNow.ToString("s");
            string testName = "foo";
            const string nodeName = "bar";
            string otherTests = now+"|baz";

            var db = this.connection.GetDatabase();
            await db.HashSetAsync(Constants.RedisNodesHash, nodeName, $"{otherTests},{now}|{testName}");

            var cmd = new DeAllocateEmulator(db, this.logger.Object)
            {
                Emulator = nodeName,
                TestName = testName
            };

            await cmd.Execute();

            var test = await db.HashGetAsync(Constants.RedisNodesHash, nodeName);
            Assert.Equal(otherTests, test);

            this.logger.Verify(m => m.Log(It.Is<LogLevel>(l => l == LogLevel.Information), 0,
                It.IsAny<object>(), It.IsAny<TaskCanceledException>(), It.IsAny<Func<object, Exception, string>>()), Times.Once);
        }

        [Fact]
        public void Test_RemovesInvalidChars_WhenSet()
        {
            var cmd = new DeAllocateEmulator(null,null);

            cmd.TestName = "|foo|bar|,baz,,";

            Assert.Equal("foo_bar__baz", cmd.TestName);
        }

        [Fact]
        public async Task Execute_DoesNothing_WhenNotFound()
        {
            const string missingNodeName = "foo";
            const string nodeName = "bar";
            const string testName = "baz";

            var db = this.connection.GetDatabase();
            await db.HashSetAsync(Constants.RedisNodesHash, nodeName, testName);

            var cmd = new DeAllocateEmulator(db, null)
            {
                Emulator = missingNodeName,
                TestName = testName
            };

            await cmd.Execute();

            var nodes = await db.HashGetAllAsync(Constants.RedisNodesHash);
            Assert.Single(nodes);
            Assert.Equal(nodeName, nodes.Single().Name);
            Assert.Equal(testName, nodes.Single().Value);
            this.logger.Verify(m => m.Log(It.Is<LogLevel>(l => l == LogLevel.Information), 0,
                It.IsAny<object>(), It.IsAny<TaskCanceledException>(), It.IsAny<Func<object, Exception, string>>()), Times.Never);
        }
    }
}
