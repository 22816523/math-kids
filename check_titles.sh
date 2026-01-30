#!/bin/bash

dir="d:\文档\JTY\VS Code\2-AI伴读V1.0\界面原型\教师端"
cd "$dir"

echo "检查HTML文件标题一致性"
echo "========================"
echo ""

for file in *.html; do
    # 提取文件名（去掉编号和.html后缀）
    filename=$(echo "$file" | sed 's/^[0-9]*-//' | sed 's/\.html$//')
    
    # 提取title标签内容（去掉" - 校校读吧小管家（教师端）"部分）
    title=$(grep -oP '(?<=<title>)[^<]+' "$file" | sed 's/ - 校校读吧小管家（教师端）$//')
    
    # 提取navbar-title内容
    navbar=$(grep -oP '(?<=class="navbar-title">)[^<]+' "$file")
    
    # 比较三者是否一致
    if [ "$filename" != "$title" ] || [ "$filename" != "$navbar" ] || [ "$title" != "$navbar" ]; then
        echo "文件: $file"
        echo "  文件名: $filename"
        echo "  Title: $title"
        echo "  Navbar: $navbar"
        echo ""
    fi
done
