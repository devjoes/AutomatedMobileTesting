using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Info.Queries
{
    public class QueryExecutor
    {
        public async Task<T> Execute<T>(IQuery<T> query)
        {
            query.Validate();
            return await query.Execute();
        }
    }
}
