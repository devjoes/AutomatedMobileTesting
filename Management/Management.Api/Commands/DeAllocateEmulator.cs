using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Management.Core;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;

namespace Management.Api.Commands
{
    public class DeAllocateEmulator
    {
        private readonly IDatabase database;
        private readonly ILogger<DeAllocateEmulator> logger;
        private string testName;

        public DeAllocateEmulator(IDatabase database, ILogger<DeAllocateEmulator> logger)
        {
            this.database = database;
            this.logger = logger;
        }

        public string Emulator { get; set; }

        public string TestName
        {
            get => this.testName;
            set => this.testName = value?.Trim('|', ',').Replace(',', '_').Replace('|', '_');
        }

        public void Validate()
        {
            if (string.IsNullOrEmpty(this.Emulator))
            {
                throw new ArgumentNullException(nameof(this.Emulator));
            }
            if (string.IsNullOrEmpty(this.TestName))
            {
                throw new ArgumentNullException(nameof(this.TestName));
            }
        }

        public async Task Execute()
        {
            var tests = await this.database.HashGetAsync(Constants.RedisNodesHash, this.Emulator);
            if (tests.HasValue)
            {
                await this.database.HashSetAsync(Constants.RedisNodesHash, this.Emulator, 
                     Regex.Replace(tests.ToString(), @"[^\|\,]+\|"+ this.TestName, String.Empty)
                         .Trim(','));
                this.logger.LogInformation($"Removed '{this.TestName}' from '{this.Emulator}'");
            }
        }
    }
}
