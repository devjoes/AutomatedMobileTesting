using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Management.Api.Commands;
using Management.Api.Models;
using Management.Core;
using Microsoft.AspNetCore.Mvc;

namespace Management.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TestsController : ControllerBase
    {
        private readonly AllocateFreeEmulator allocateEmulator;
        private readonly DeAllocateEmulator deAllocateEmulator;

        public TestsController(AllocateFreeEmulator allocateEmulator, DeAllocateEmulator deAllocateEmulator)
        {
            this.allocateEmulator = allocateEmulator;
            this.deAllocateEmulator = deAllocateEmulator;
        }
        // GET api/values
        [HttpPost]
        public async Task<ActionResult> Post([FromBody]string testName)
        {
            this.allocateEmulator.TestName = testName;
            this.allocateEmulator.Validate();
            var emulator = await this.allocateEmulator.Execute();
            if (emulator == null)
            {
                this.Response.Headers.Add("retry-after", Constants.GetEmulatorBackOffSecs.ToString());
                return this.StatusCode(503, $"No emulator available, please try again in {Constants.GetEmulatorBackOffSecs} seconds.");
            }

            return new JsonResult(new
            {
                node = "node-" + emulator.Split('_').First(),
                emulator
            });
        }
        
        [HttpDelete]
        public async Task Delete([FromBody]TestAllocatedToEmulator model)
        {
            this.deAllocateEmulator.Emulator = model.Emulator;
            this.deAllocateEmulator.TestName = model.Test;
            this.deAllocateEmulator.Validate();
            await this.deAllocateEmulator.Execute();
        }
    }
}
