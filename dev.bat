set CHROME="C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
set URL=file:///B:/msys64/home/nagata/git/weflnote/dev/index.html
start /b "" %CHROME% %URL% --allow-file-access-from-files
if "%1"=="chrome" goto END

explorer .
code .
code ..\jsyjdlib

:END