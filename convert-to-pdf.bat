@echo off
echo ========================================
echo MyWellness EMS Documentation Converter
echo ========================================
echo.

echo Available conversion methods:
echo.
echo 1. Using Pandoc (Recommended)
echo    - Install Pandoc from https://pandoc.org/installing.html
echo    - Run: pandoc MyWellness_EMS_Documentation.md -o MyWellness_EMS_Documentation.pdf
echo.
echo 2. Using markdown-pdf npm package
echo    - Run: npm install -g markdown-pdf
echo    - Run: markdown-pdf MyWellness_EMS_Documentation.md
echo.
echo 3. Using HTML version
echo    - Open MyWellness_EMS_Documentation.html in browser
echo    - Print to PDF (Ctrl+P)
echo.
echo 4. Using VS Code
echo    - Install "Markdown PDF" extension
echo    - Right-click on .md file and select "Markdown PDF: Export (pdf)"
echo.

echo Files created:
echo - MyWellness_EMS_Documentation.md (Markdown format)
echo - MyWellness_EMS_Documentation.html (HTML format)
echo.

echo Choose your preferred method and follow the instructions above.
echo.
pause
