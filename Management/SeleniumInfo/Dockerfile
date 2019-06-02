FROM mcr.microsoft.com/dotnet/core/aspnet:2.2-stretch-slim AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/core/sdk:2.2-stretch AS build
WORKDIR /src
COPY ["SeleniumInfo/SeleniumInfo.csproj", "SeleniumInfo/"]
COPY ["Management.Core/Management.Core.csproj", "Management.Core/"]
RUN dotnet restore "SeleniumInfo/SeleniumInfo.csproj"
COPY . .
WORKDIR "/src/SeleniumInfo"
RUN dotnet build "SeleniumInfo.csproj" -c Release -o /app

FROM build AS publish
RUN dotnet publish "SeleniumInfo.csproj" -c Release -o /app

FROM base AS final
WORKDIR /app
COPY --from=publish /app .
ENTRYPOINT ["dotnet", "SeleniumInfo.dll"]
