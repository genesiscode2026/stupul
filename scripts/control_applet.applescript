-- STUPUL GENESIS v1.1 Control Applet
set appPath to POSIX path of (path to me)
set projectDir to do shell script "dirname " & quoted form of appPath

set pidFile to projectDir & "/runtime/stupul.pid"
set portFile to projectDir & "/runtime/stupul.port"

set isRunning to false
set currentPort to "5173"

try
	set fileCheck to do shell script "test -f " & quoted form of pidFile & " && echo 'exists' || echo 'none'"
	if fileCheck is "exists" then
		set thePid to do shell script "cat " & quoted form of pidFile
		set procCheck to do shell script "ps -p " & thePid & " >/dev/null 2>&1 && echo 'running' || echo 'stopped'"
		if procCheck is "running" then
			set isRunning to true
			try
				set currentPort to do shell script "cat " & quoted form of portFile
			end try
		end if
	end if
end try

if isRunning then
	set dialogResult to display dialog "🏛️ STUPUL GENESIS v1.1\n\nStare Server: PORNIT (Activ)\nAdresă: http://127.0.0.1:" & currentPort & "\n\nCe doriți să faceți?" buttons {"Oprește Server", "Deschide în Browser", "Ieșire"} default button "Deschide în Browser" with title "STUPUL — Panou de Control"
	set chosenBtn to button returned of dialogResult
	
	if chosenBtn is "Oprește Server" then
		do shell script quoted form of (projectDir & "/STOP_STUPUL.command")
		display dialog "✅ STUPUL a fost oprit cu succes." buttons {"OK"} default button "OK" with title "STUPUL Control"
	else if chosenBtn is "Deschide în Browser" then
		open location ("http://127.0.0.1:" & currentPort)
	end if
else
	set dialogResult to display dialog "🏛️ STUPUL GENESIS v1.1\n\nStare Server: OPRIT\n\nDoriți să porniți jocul acum?" buttons {"Ieșire", "Pornește Jocul"} default button "Pornește Jocul" with title "STUPUL — Panou de Control"
	set chosenBtn to button returned of dialogResult
	
	if chosenBtn is "Pornește Jocul" then
		do shell script quoted form of (projectDir & "/START_STUPUL.command") & " >/dev/null 2>&1 &"
		display dialog "🚀 STUPUL pornește în fundal...\nBrowserul se va deschide automat în câteva secunde." buttons {"OK"} default button "OK" with title "STUPUL Control"
	end if
end if
