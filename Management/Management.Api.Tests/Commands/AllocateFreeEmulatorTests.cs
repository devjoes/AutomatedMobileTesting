using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DockerizedTesting.Redis;
using Management.Api.Commands;
using Management.Core;
using StackExchange.Redis;
using Xunit;

namespace Management.Api.Tests.Commands
{
    public class AllocateFreeEmulatorTests:IClassFixture<RedisFixture>
    {
        private RedisFixture redis;
        private ConnectionMultiplexer connection;

        public AllocateFreeEmulatorTests(RedisFixture redis)
        {
            redis.Start().Wait();
            this.redis = redis;
            this.connection = ConnectionMultiplexer.Connect(ConfigurationOptions.Parse("localhost:" + this.redis.Ports.Single()));
            this.connection.GetDatabase().Execute("FLUSHALL");
        }

        [InlineData(null)]
        [InlineData("")]
        [Theory]
        public void Validate_Throws_WhenNoTestNameIsProvided(string testName)
        {
            var cmd = new AllocateFreeEmulator(null)
            {
                TestName = testName
            };

            Assert.Throws<ArgumentNullException>(() => cmd.Validate());
        }

        [Fact]
        public async Task Execute_AssignsFreeEmulator_WhenAvailable()
        {
            const string testName = "foo";
            const string nodeName = "bar";

            var db = this.connection.GetDatabase();
            await db.HashSetAsync(Constants.RedisNodesHash, nodeName, string.Empty);

            var cmd = new AllocateFreeEmulator(db)
            {
                TestName = testName
            };

            var node = await cmd.Execute();

            var splitted = (await db.HashGetAsync(Constants.RedisNodesHash, nodeName))
                .ToString()
                .Split('|');
            var timeCached = DateTime.ParseExact(splitted.First(), "s", CultureInfo.InvariantCulture);

            Assert.Equal(nodeName, node);
            Assert.True(5 > Math.Abs((DateTime.UtcNow - timeCached).TotalSeconds));
            Assert.Equal(testName, splitted.Last());
        }

        [Fact]
        public async Task Execute_ReturnsNull_WhenNoEmulatorIsFree()
        {
            const string testName = "foo";
            const string nodeName = "bar";
            const string assignedTest = "baz";
            var time = DateTime.UtcNow.ToString("s");

            var db = this.connection.GetDatabase();
            await db.HashSetAsync(Constants.RedisNodesHash, nodeName,  $"{time}|{assignedTest}");

            var cmd = new AllocateFreeEmulator(db)
            {
                TestName = testName
            };

            var node = await cmd.Execute();
            
            var test = (await db.HashGetAsync(Constants.RedisNodesHash, nodeName))
                .ToString()
                .Split('|')
                .Last();
            Assert.Null(node);
            Assert.Equal(assignedTest, test);
        }


        [Fact]
        public async Task Execute_AssignsEmulator_WhenClaimHasExpired()
        {
            const string testName = "foo";
            const string nodeName = "bar";
            const string assignedTest = "baz";
            var time = DateTime.UtcNow.AddSeconds(0 - Constants.EmulatorClaimTimeoutSecs-1).ToString("s");

            var db = this.connection.GetDatabase();
            await db.HashSetAsync(Constants.RedisNodesHash, nodeName, $"{time}|{assignedTest}");

            var cmd = new AllocateFreeEmulator(db)
            {
                TestName = testName
            };

            var node = await cmd.Execute();

            var test = (await db.HashGetAsync(Constants.RedisNodesHash, nodeName))
                .ToString()
                .Split('|')
                .Last();
            Assert.Equal(nodeName, node);
            Assert.Equal(testName, test);
        }
    }
}
