using System;
using System.Collections.Generic;
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
    public class DeAllocateEmulatorTests : IClassFixture<RedisFixture>
    {
        private RedisFixture redis;
        private ConnectionMultiplexer connection;

        public DeAllocateEmulatorTests(RedisFixture redis)
        {
            redis.Start().Wait();
            this.redis = redis;
            this.connection = ConnectionMultiplexer.Connect(ConfigurationOptions.Parse("localhost:" + this.redis.Ports.Single()));
        }

        [InlineData(null)]
        [InlineData("")]
        [Theory]
        public void Validate_Throws_WhenNoEmulatorIsProvided(string emulator)
        {
            var cmd = new DeAllocateEmulator(null)
            {
                Emulator = emulator
            };

            Assert.Throws<ArgumentNullException>(() => cmd.Validate());
        }


        [Fact]
        public async Task Execute_ClearsEmulator_WhenFound()
        {
            const string testName = "foo";
            const string nodeName = "bar";

            var db = this.connection.GetDatabase();
            await db.HashSetAsync(Constants.RedisNodesHash, nodeName, testName);

            var cmd = new DeAllocateEmulator(db)
            {
                Emulator = nodeName
            };

            await cmd.Execute();

            var test = await db.HashGetAsync(Constants.RedisNodesHash, nodeName);
            Assert.Equal(string.Empty, test);
        }


        [Fact]
        public async Task Execute_DoesNothing_WhenNotFound()
        {
            const string missingNodeName = "foo";
            const string nodeName = "bar";
            const string testName = "baz";

            var db = this.connection.GetDatabase();
            await db.HashSetAsync(Constants.RedisNodesHash, nodeName, testName);

            var cmd = new DeAllocateEmulator(db)
            {
                Emulator = missingNodeName
            };

            await cmd.Execute();

            var nodes = await db.HashGetAllAsync(Constants.RedisNodesHash);
            Assert.Single(nodes);
            Assert.Equal(nodeName, nodes.Single().Name);
            Assert.Equal(testName, nodes.Single().Value);
        }
    }
}
