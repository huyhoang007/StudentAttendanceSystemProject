@echo off
echo Creating migration for DateTimeOffset changes...
dotnet ef migrations add UpdateToDateTimeOffset
echo Migration created! Run the following command to apply:
echo dotnet ef database update
pause