using System;
using System.IO;
using System.Net.Http;
using System.Threading.Tasks;
using InfluxDB.Net;
using InfluxDB.Net.Contracts;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Console;
using Microsoft.Extensions.Options;
using StackExchange.Redis;

namespace DataLogger
{
    class Program
    {
        static async Task Main(string[] args)
        {
            var services = BuildServices();
            var recordNodes = services.GetService<RecordNodes>();
            //await recordNodes.CreateInfluxDbIfMissing();
            await Task.Delay(5000);
            await recordNodes.Store();
        }

        private static ServiceProvider BuildServices()
        {
            var services = new ServiceCollection();
            services.AddLogging(l =>
            {
                l.SetMinimumLevel(LogLevel.Information);
                l.AddConsole();
            });
            services.AddSingleton(_ => GetConfig());
            services.AddSingleton(s =>
                ConnectionMultiplexer.Connect(
                    ConfigurationOptions.Parse(s.GetService<IConfiguration>().GetConnectionString("redis"))));
            services.AddScoped(s => s.GetService<ConnectionMultiplexer>().GetDatabase());
            services.AddScoped<IInfluxDb>(_ => null);
            services.AddScoped(_ => new HttpClient());
            services.AddScoped<RecordNodes>();
            return services.BuildServiceProvider();
        }

        private static IConfiguration GetConfig()
            => new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json")
                .AddEnvironmentVariables().Build();
    }
}
