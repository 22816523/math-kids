# -*- coding: utf-8 -*-
"""创建开机启动快捷方式"""
import os
import sys

try:
    import winshell
    from win32com.client import Dispatch
except ImportError:
    print("需要安装 pywin32 和 winshell 库")
    print("请运行: pip install pywin32 winshell")
    sys.exit(1)

# 获取启动文件夹路径
startup_folder = winshell.startup()

# 快捷方式路径
shortcut_path = os.path.join(startup_folder, "桌面日历.lnk")

# 目标程序
target = "pythonw"

# 脚本路径
script_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "启动日历.pyw")
working_dir = os.path.dirname(os.path.abspath(__file__))

# 创建快捷方式
shell = Dispatch('WScript.Shell')
shortcut = shell.CreateShortCut(shortcut_path)
shortcut.Targetpath = target
shortcut.Arguments = f'"{script_path}"'
shortcut.WorkingDirectory = working_dir
shortcut.save()

print(f"开机启动快捷方式已创建: {shortcut_path}")
