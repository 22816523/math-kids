# 创建开机启动快捷方式
$WshShell = New-Object -ComObject WScript.Shell
$StartupPath = [Environment]::GetFolderPath('Startup')
$ShortcutPath = Join-Path $StartupPath "桌面日历.lnk"
$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = "pythonw"
$Shortcut.Arguments = "`"D:\文档\JTY\VS Code\0-工具\桌面日历\启动日历.pyw`""
$Shortcut.WorkingDirectory = "D:\文档\JTY\VS Code\0-工具\桌面日历"
$Shortcut.Save()
Write-Host "开机启动快捷方式已创建: $ShortcutPath"
