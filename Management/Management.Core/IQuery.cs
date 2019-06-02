using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Info.Queries
{
    public interface IQuery<T>
    {
        Task<T> Execute();

        void Validate();
    }
}
