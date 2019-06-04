using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Management.Core;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;

namespace Management.Api.Commands
{
    public class AllocateFreeEmulator
    {
        private readonly IDatabase database;
        private readonly IConfiguration config;
        private readonly ILogger<AllocateFreeEmulator> logger;
        private string testName;

        public AllocateFreeEmulator(IDatabase database, IConfiguration config, ILogger<AllocateFreeEmulator> logger)
        {
            this.database = database;
            this.config = config;
            this.logger = logger;
        }


        public string TestName
        {
            get => this.testName;
            set => this.testName = value?.Trim('|', ',').Replace(',', '_').Replace('|', '_');
        }

        public void Validate()
        {
            if (string.IsNullOrEmpty(this.TestName))
            {
                throw new ArgumentNullException(nameof(this.TestName));
            }
        }

        private static readonly object Locker = new object();
        public async Task<string> Execute()
        {
            int emulatorClaimTimeoutSecs = int.Parse(this.config["EmulatorClaimTimeoutSecs"]);
            var rnd = new Random();
            lock (Locker) //TODO: We should use transactions for this but they are a pain in redis and I dont have time. Replicas must be 1
            {
                var nodes = (this.database.HashGetAll(Constants.RedisNodesHash)).ToList();
                    var withoutTimedOut = nodes
                    .Select(h => new string[] { h.Name, h.Value.ToString() == string.Empty ? string.Empty : removedTimedOut(h.Value, emulatorClaimTimeoutSecs) });
                var freeNode = withoutTimedOut.OrderBy(_ => rnd.Next())
                    .FirstOrDefault(n => n[1].Split(',').Length <  int.Parse(this.config["MaxQueueLength"]));
                if (freeNode == default)
                {
                    return null;
                }

                var remainingTestsInNode = freeNode[1].Split(',').Select(i => i.Split('|').Last()).ToArray();
                foreach (var removedTest in nodes.Single(n => n.Name == freeNode[0]).Value.ToString()
                    .Split(',').Select(i => i.Split('|').Last())
                    .Where(n => !remainingTestsInNode.Contains(n)))
                {
                    this.logger.LogInformation($"'{removedTest}' expired and was removed from '{freeNode[0]}'");
                }
                

                var time = DateTime.UtcNow.ToString("s");
                this.database.HashSet(Constants.RedisNodesHash, freeNode[0], $"{freeNode[1]},{time}|{this.TestName}".Trim(','));
                this.logger.LogInformation($"Running '{this.TestName}' on '{freeNode[0]}'");
                return freeNode[0];
            }
        }

        private static string removedTimedOut(RedisValue val, int emulatorTimeoutSecs)
            => string.Join(',',
                val.ToString().Split(',').Where(i =>
                    !DateTime.TryParse(i.Split('|').First(), out _) ||
                    DateTime.Parse(i.Split('|').First())
                        .AddSeconds(emulatorTimeoutSecs)
                    > DateTime.UtcNow));

    }
}
