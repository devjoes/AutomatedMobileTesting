using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Management.Core;
using StackExchange.Redis;

namespace Management.Api.Commands
{
    public class AllocateFreeEmulator
    {
        private readonly IDatabase database;

        public AllocateFreeEmulator(IDatabase database)
        {
            this.database = database;
        }

        public string TestName { get; set; }

        public void Validate()
        {
            if (string.IsNullOrEmpty(this.TestName))
            {
                throw new ArgumentNullException(nameof(this.TestName));
            }
        }

        public async Task<string> Execute()
        {
            var nodes = await this.database.HashGetAllAsync(Constants.RedisNodesHash);//TODO: Randomize
            var freeNode = nodes.FirstOrDefault(h =>
                h.Value == string.Empty ||
                hasTimedOut(h.Value));
            if (freeNode == default)
            {
                return null;
            }

            var time = DateTime.UtcNow.ToString("s");
            await this.database.HashSetAsync(Constants.RedisNodesHash, freeNode.Name, $"{time}|{this.TestName}");
            return freeNode.Name;
        }

        private static bool hasTimedOut(RedisValue val)
            =>
                DateTime.Parse(val.ToString().Split('|').First())
                    .AddSeconds(Constants.EmulatorClaimTimeoutSecs)
                < DateTime.UtcNow;

    }
}
