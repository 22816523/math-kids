# -*- coding: utf-8 -*-
"""启动日历应用"""
import os
import sys

# 设置工作目录为脚本所在目录
os.chdir(os.path.dirname(os.path.abspath(__file__)))

# 导入并运行主程序
from calendar_app import main
main()
