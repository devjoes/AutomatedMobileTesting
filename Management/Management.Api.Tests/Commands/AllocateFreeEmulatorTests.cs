using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Threading.Tasks;
using DockerizedTesting.Redis;
using Management.Api.Commands;
using Management.Core;
using Moq;
using StackExchange.Redis;
using Xunit;

namespace Management.Api.Tests.Commands
{
    public class AllocateFreeEmulatorTests:IClassFixture<RedisFixture>
    {
        private readonly RedisFixture redis;
        private readonly ConnectionMultiplexer connection;
        private readonly Mock<IConfiguration> config;
        private readonly Mock<ILogger<AllocateFreeEmulator>> logger;
        private const int EmulatorClaimTimeoutSecs = 60;
        private const int MaxQueueLength = 3;

        public AllocateFreeEmulatorTests(RedisFixture redis)
        {
            redis.Start().Wait();
            this.redis = redis;
            this.connection = ConnectionMultiplexer.Connect(ConfigurationOptions.Parse("localhost:" + this.redis.Ports.Single()));
            this.connection.GetDatabase().Execute("FLUSHALL");
            this.config = new Mock<IConfiguration>();
            this.config.Setup(c => c["EmulatorClaimTimeoutSecs"]).Returns(EmulatorClaimTimeoutSecs.ToString);
            this.config.Setup(c => c["MaxQueueLength"]).Returns(MaxQueueLength.ToString);
            
            this.logger = new Mock<ILogger<AllocateFreeEmulator>>();
        }

        [InlineData(null)]
        [InlineData("")]
        [Theory]
        public void Validate_Throws_WhenNoTestNameIsProvided(string testName)
        {
            var cmd = new AllocateFreeEmulator(null, null, null)
            {
                TestName = testName
            };

            Assert.Throws<ArgumentNullException>(() => cmd.Validate());
        }
        
        [Fact]
        public void Test_RemovesInvalidChars_WhenSet()
        {
            var cmd = new AllocateFreeEmulator(null, null, null);

            cmd.TestName = "|foo|bar|,baz,,";

            Assert.Equal("foo_bar__baz", cmd.TestName);
        }

        [Theory]
        [InlineData("")]
        [InlineData("{0}|foo,")]
        [InlineData("{0}|foo,{0}|bar")]
        public async Task Execute_AssignsFreeEmulator_WhenAvailable(string queuedTests)
        {
            const string testName = "foo";
            const string nodeName = "bar";
            var time = DateTime.UtcNow.ToString("s");

            var db = this.connection.GetDatabase();
            await db.HashSetAsync(Constants.RedisNodesHash, nodeName,  string.Format(queuedTests, time));

            var cmd = new AllocateFreeEmulator(db, this.config.Object, this.logger.Object)
            {
                TestName = testName
            };

            var node = await cmd.Execute();

            var splitted = (await db.HashGetAsync(Constants.RedisNodesHash, nodeName))
                .ToString()
                .Split(',')
                .Last().Split('|');
            var timeCached = DateTime.ParseExact(splitted.First(), "s", CultureInfo.InvariantCulture);

            Assert.Equal(nodeName, node);
            Assert.True(5 > Math.Abs((DateTime.UtcNow - timeCached).TotalSeconds));
            Assert.Equal(testName, splitted.Last());
            this.logger.Verify(m => m.Log(It.Is<LogLevel>(l => l == LogLevel.Information), 0,
                It.IsAny<object>(), It.IsAny<TaskCanceledException>(), It.IsAny<Func<object, Exception, string>>()), Times.Once);
        }

        [Fact]
        public async Task Execute_ReturnsNull_WhenNoEmulatorIsFree()
        {
            const string testName = "foo";
            const string nodeName = "bar";
            
            var time = DateTime.UtcNow.ToString("s");
            string assignedTest = string.Format("{0}|foo,{0}|bar,{0}|baz", time);

            var db = this.connection.GetDatabase();
            await db.HashSetAsync(Constants.RedisNodesHash, nodeName,  assignedTest);

            var cmd = new AllocateFreeEmulator(db, this.config.Object, this.logger.Object)
            {
                TestName = testName
            };

            var node = await cmd.Execute();

            var test = (await db.HashGetAsync(Constants.RedisNodesHash, nodeName))
                .ToString();
            Assert.Null(node);
            Assert.Equal(assignedTest, test);
        }


        [Fact]
        public async Task Execute_AssignsEmulator_WhenClaimHasExpired()
        {
            const string testName = "foo";
            const string nodeName = "bar";
            var time = DateTime.UtcNow.ToString("s");
            var expiredTime = DateTime.UtcNow.AddSeconds(0 - EmulatorClaimTimeoutSecs - 1).ToString("s");
            string assignedTest = string.Format("{0}|foo,{0}|bar,{1}|baz", time, expiredTime);
            
            var db = this.connection.GetDatabase();
            await db.HashSetAsync(Constants.RedisNodesHash, nodeName, assignedTest);

            var cmd = new AllocateFreeEmulator(db, this.config.Object, this.logger.Object)
            {
                TestName = testName
            };

            var node = await cmd.Execute();

            var tests = (await db.HashGetAsync(Constants.RedisNodesHash, nodeName))
                .ToString()
                .Split(',')
                .Select(i => i.Split('|'))
                .ToArray();

            Assert.Equal(nodeName, node);
            Assert.Equal("foo", tests[0].Last());
            Assert.Equal("bar", tests[1].Last());
            Assert.Equal(time, tests[0].First());
            Assert.Equal(time, tests[1].First());
            Assert.Equal(testName, tests[0].Last());
            this.logger.Verify(m => m.Log(It.Is<LogLevel>(l => l == LogLevel.Information), 0,
                It.IsAny<object>(), It.IsAny<TaskCanceledException>(), It.IsAny<Func<object, Exception, string>>()), Times.Exactly(2));
        }
    }
}
