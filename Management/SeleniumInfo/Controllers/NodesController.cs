using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using SeleniumInfo.Queries;

namespace SeleniumInfo.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NodesController : ControllerBase
    {
        private readonly GetSeleniumNodes getNodes;

        public NodesController(GetSeleniumNodes getNodes)
        {
            this.getNodes = getNodes;
        }
        // GET api/values
        [HttpGet]
        public async Task<ActionResult<IDictionary<string,string[]>>> Get()
        {
            this.getNodes.Validate();
            return new ActionResult<IDictionary<string, string[]>>(await this.getNodes.Execute());
        }
    }
}
