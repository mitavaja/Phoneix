@echo off
echo Starting MongoDB on port 27017...
"C:\Program Files\MongoDB\Server\9.0\bin\mongod.exe" --dbpath "%~dp0mongodb_data"
pause
