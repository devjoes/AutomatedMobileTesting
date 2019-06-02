using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using InfluxDB.Net;
using InfluxDB.Net.Contracts;
using Management.Core;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using StackExchange.Redis;

namespace DataLogger
{
    public class RecordNodes
    {
        private readonly IConfiguration configuration;
        private readonly HttpClient httpClient;
        private readonly IInfluxDb influxClient;
        private readonly IDatabase database;
        private readonly ILogger<RecordNodes> logger;

        public RecordNodes(IConfiguration configuration,HttpClient httpClient, IInfluxDb influxClient, IDatabase database, ILogger<RecordNodes> logger)
        {
            this.configuration = configuration;
            this.httpClient = httpClient;
            this.influxClient = influxClient;
            this.database = database;
            this.logger = logger;
        }

        public async Task CreateInfluxDbIfMissing()
        {
            var dbs = await this.influxClient.ShowDatabasesAsync();
            if (dbs.All(d => d.Name != Constants.InfluxDb))
            {
                await this.influxClient.CreateDatabaseAsync(Constants.InfluxDb);
            }
        }

        public async Task Store()
        {
            var json = await this.httpClient.GetStringAsync(this.configuration["SeleniumNodesUrl"]);
            var newNodes = JsonConvert.DeserializeObject<Dictionary<string, string[]>>(json).Values.SelectMany(v => v).ToArray();
            var oldNodes = (await this.database.HashGetAllAsync(Constants.RedisNodesHash)).Select(i => i.Name).ToArray();

            foreach (var oldNode in oldNodes.Where(o => newNodes.All(n => n != o)))
            {
                await this.database.HashDeleteAsync(Constants.RedisNodesHash, oldNode);
                this.logger.LogInformation("Removed emulator: " + oldNode);
            }

            foreach (var newNode in newNodes.Where(n => oldNodes.All(o => o != n)))
            {
                await this.database.HashSetAsync(Constants.RedisNodesHash, newNode, string.Empty);
                this.logger.LogInformation("Added emulator: " + newNode);
            }
        }
    }
}
