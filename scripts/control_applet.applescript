-- STUPUL GENESIS v1.1 — Panou de Control macOS (auto-localizant)
-- Calea proiectului este fixă, astfel încât aplicația funcționează
-- indiferent de locul din care este lansată (proiect sau Desktop).

set projectDir to "/Users/severmarcus/Documents/STUPUL"
set pidFile to projectDir & "/runtime/stupul.pid"
set portFile to projectDir & "/runtime/stupul.port"
set startScript to projectDir & "/START_STUPUL.command"
set stopScript to projectDir & "/STOP_STUPUL.command"

-- Determină starea serverului
set isRunning to false
set currentPort to "5173"

try
	set pidCheck to do shell script "test -f " & quoted form of pidFile & " && cat " & quoted form of pidFile & " || echo ''"
	if pidCheck is not "" then
		set procCheck to do shell script "ps -p " & pidCheck & " >/dev/null 2>&1 && echo running || echo stopped"
		if procCheck is "running" then
			set isRunning to true
			try
				set currentPort to do shell script "cat " & quoted form of portFile
			end try
		end if
	end if
end try

set stateLabel to "OPRIT"
if isRunning then
	set stateLabel to "PORNIT — http://127.0.0.1:" & currentPort
end if

set dlg to display dialog "🏛️ STUPUL GENESIS v1.1

Stare server: " & stateLabel & "

Alege o acțiune:" buttons {"Pornește Jocul", "Deschide Jocul", "Oprește Jocul"} default button "Deschide Jocul" with title "STUPUL — Panou de Control"
set chosenBtn to button returned of dlg

if chosenBtn is "Pornește Jocul" then
	do shell script quoted form of startScript & " > /dev/null 2>&1 &"
	display dialog "🚀 STUPUL pornește în fundal...\nBrowserul se va deschide automat în câteva secunde." buttons {"OK"} default button "OK" with title "STUPUL Control"
else if chosenBtn is "Deschide Jocul" then
	if not isRunning then
		do shell script quoted form of startScript & " > /dev/null 2>&1 &"
		delay 1
	end if
	open location ("http://127.0.0.1:" & currentPort)
else if chosenBtn is "Oprește Jocul" then
	do shell script quoted form of stopScript
	display dialog "✅ STUPUL a fost oprit cu succes.\nSalvările și progresul au rămas intacte." buttons {"OK"} default button "OK" with title "STUPUL Control"
end if
