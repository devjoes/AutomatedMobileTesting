FROM mcr.microsoft.com/dotnet/core/aspnet:2.2-stretch-slim AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/core/sdk:2.2-stretch AS build
WORKDIR /src
COPY ["Management.Api/Management.Api.csproj", "Management.Api/"]
RUN dotnet restore "Management.Api/Management.Api.csproj"
COPY . .
WORKDIR "/src/Management.Api"
RUN dotnet build "Management.Api.csproj" -c Release -o /app

FROM build AS publish
RUN dotnet publish "Management.Api.csproj" -c Release -o /app

FROM base AS final
WORKDIR /app
COPY --from=publish /app .
ENTRYPOINT ["dotnet", "Management.Api.dll"]
