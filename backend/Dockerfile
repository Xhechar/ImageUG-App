
FROM mcr.microsoft.com/dotnet/sdk:8.0 as build
WORKDIR /src
COPY *.csproj .
COPY . .
RUN dotnet restore
RUN dotnet build --production