@echo off
cd /d "%~dp0"

echo ===============================
echo 城市活跃度雷达 - 部署脚本
echo ===============================
echo.
echo 正在部署到 GitHub Pages...
echo.

git push -u origin main

if %errorlevel%==0 (
    echo.
    echo ✓ 部署成功!
    echo.
    echo 现在去 GitHub 仓库设置 Pages:
    echo 1. 打开 https://github.com/liuhei276-ai/city-radar-light/settings/pages
    echo 2. Source 选 "main" 分支, 根目录 "/"
    echo 3. 点 Save, 等 2 分钟
    echo 4. 访问 https://liuhei276-ai.github.io/city-radar-light/
) else (
    echo.
    echo ✕ 推送失败，请检查网络
    echo 也可以直接用 Git Bash 手动执行:
    echo   git push -u origin main
)

pause
