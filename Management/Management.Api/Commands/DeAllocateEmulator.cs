using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Management.Core;
using StackExchange.Redis;

namespace Management.Api.Commands
{
    public class DeAllocateEmulator
    {
        private readonly IDatabase database;

        public DeAllocateEmulator(IDatabase database)
        {
            this.database = database;
        }

        public string Emulator { get; set; }

        public void Validate()
        {
            if (string.IsNullOrEmpty(this.Emulator))
            {
                throw new ArgumentNullException(nameof(this.Emulator));
            }
        }

        public async Task Execute()
        {
            if ((await this.database.HashGetAsync(Constants.RedisNodesHash, this.Emulator)).HasValue)
            {
                await this.database.HashSetAsync(Constants.RedisNodesHash, this.Emulator, string.Empty);
            }
        }
    }
}
