; Naranxia - Windows installer (per-user, no admin rights needed)
Unicode true
!include "MUI2.nsh"
Name "Naranxia"
OutFile "out\Naranxia-Setup-Windows.exe"
InstallDir "$LOCALAPPDATA\Programs\Naranxia"
InstallDirRegKey HKCU "Software\Naranxia" "InstallDir"
RequestExecutionLevel user
SetCompressor /SOLID lzma
!define MUI_ICON "icon.ico"
!define MUI_UNICON "icon.ico"
!define MUI_WELCOMEPAGE_TITLE "Naranxia - the kingdom of King Naraige"
!define MUI_WELCOMEPAGE_TEXT "This will install Naranxia on your computer.$\r$\n$\r$\nThe game checks for updates every time it starts and installs them by itself. Your saved games are kept in your user folder and survive updates."
!define MUI_FINISHPAGE_RUN "$INSTDIR\Naranxia.exe"
!define MUI_FINISHPAGE_RUN_TEXT "Play Naranxia now"
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_LANGUAGE "English"
!insertmacro MUI_LANGUAGE "French"

Section "Naranxia" SecMain
  SetOutPath "$INSTDIR"
  File /r "dist\Naranxia-win32-x64\*.*"
  File "icon.ico"
  WriteRegStr HKCU "Software\Naranxia" "InstallDir" "$INSTDIR"
  WriteUninstaller "$INSTDIR\Uninstall Naranxia.exe"
  CreateDirectory "$SMPROGRAMS\Naranxia"
  CreateShortcut "$SMPROGRAMS\Naranxia\Naranxia.lnk" "$INSTDIR\Naranxia.exe" "" "$INSTDIR\icon.ico"
  CreateShortcut "$SMPROGRAMS\Naranxia\Uninstall Naranxia.lnk" "$INSTDIR\Uninstall Naranxia.exe"
  CreateShortcut "$DESKTOP\Naranxia.lnk" "$INSTDIR\Naranxia.exe" "" "$INSTDIR\icon.ico"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\Naranxia" "DisplayName" "Naranxia"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\Naranxia" "DisplayIcon" "$INSTDIR\icon.ico"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\Naranxia" "Publisher" "Naranxia clan"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\Naranxia" "UninstallString" '"$INSTDIR\Uninstall Naranxia.exe"'
  WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\Naranxia" "NoModify" 1
  WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\Naranxia" "NoRepair" 1
SectionEnd

Section "Uninstall"
  Delete "$DESKTOP\Naranxia.lnk"
  RMDir /r "$SMPROGRAMS\Naranxia"
  RMDir /r "$INSTDIR"
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\Naranxia"
  DeleteRegKey HKCU "Software\Naranxia"
  ; saved games ($APPDATA\Naranxia\saves) are kept on purpose
SectionEnd
