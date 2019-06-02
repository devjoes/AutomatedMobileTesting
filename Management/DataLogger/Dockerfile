FROM mcr.microsoft.com/dotnet/core/runtime:2.2-stretch-slim AS base
WORKDIR /app

FROM mcr.microsoft.com/dotnet/core/sdk:2.2-stretch AS build
WORKDIR /src
COPY ["DataLogger/DataLogger.csproj", "DataLogger/"]
COPY ["Management.Core/Management.Core.csproj", "Management.Core/"]
RUN dotnet restore "DataLogger/DataLogger.csproj"
COPY . .
WORKDIR "/src/DataLogger"
RUN dotnet build "DataLogger.csproj" -c Release -o /app

FROM build AS publish
RUN dotnet publish "DataLogger.csproj" -c Release -o /app

FROM base AS final
WORKDIR /app
COPY --from=publish /app .
ENTRYPOINT ["dotnet", "DataLogger.dll"]
