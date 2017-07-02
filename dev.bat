set CHROME="C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
rem set URL=file:///B:/msys64/home/nagata/git/weflnote/dev/index.html
rem start /b "" %CHROME% %URL% --allow-file-access-from-files --remote-debugging-port=9222
if "%1"=="chrome" goto END

explorer .
code .
code ..\jsyjdlib

:END