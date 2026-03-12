# OpenClaw（小龙虾）安装记录

## 环境信息

- 系统：Windows 11 Home China
- 用户：zbb09
- 日期：2026-03-12

## 安装步骤

### 第一步：检查 WSL2

在 PowerShell 中运行 `wsl --version`，发现未安装 WSL

### 第二步：安装 WSL2

系统提示按任意键安装，安装完成后显示 WSL 版本 2.6.3.0，内核版本 6.6.87.2-1

提示需要重启电脑才能生效，已重启

### 第三步：安装 Ubuntu

运行 `wsl --install -d Ubuntu`

- 第一次报错：WININET_E_CANNOT_CONNECT，无法连接 GitHub 服务器
- 第二次报错：0x80072f78，服务器返回无效响应
- 尝试从 Microsoft Store 安装，但商店初始化失败
- 开启全局代理后第三次运行成功，Ubuntu 安装完成

### 第四步：设置 Ubuntu 用户

- 创建了默认用户 zbb09123456
- 设置了密码

### 第五步：更新系统包

运行 `sudo apt update && sudo apt upgrade -y`

由于 WSL 内部无法访问网络，更新失败（Temporary failure resolving）

### 第六步：修复 WSL 网络

- 手动设置 DNS：`echo "nameserver 223.5.5.5" | sudo tee /etc/resolv.conf`
- 换阿里云镜像源：`sudo sed -i 's|http://archive.ubuntu.com|http://mirrors.aliyun.com|g' /etc/apt/sources.list.d/ubuntu.sources`
- 再次 `sudo apt update` 成功

### 第七步：安装编译依赖

运行 `sudo apt install -y git build-essential cmake libsdl2-dev libsdl2-image-dev libsdl2-mixer-dev libsdl2-ttf-dev libtinyxml-dev`，安装成功

### 第八步：克隆 OpenClaw 源码（失败）

多次尝试 `git clone` 均因代理/网络问题失败：
- host.docker.internal 无法解析
- 通过 Windows 主机 IP 172.27.160.1:7890 连接超时（Clash 允许局域网已开启）
- 取消代理后直接克隆也失败

### 结果：放弃安装

用户决定不继续安装，已卸载 Ubuntu（`wsl --unregister Ubuntu`）

## 最终状态

- WSL2 仍保留在系统中（不占资源）
- Ubuntu 已卸载
- Windows 系统无残留影响
