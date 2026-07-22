<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# 🚨 專案開發與檔案管理強制規則
1. **禁止隨意亂產檔案**：嚴禁在專案根目錄或任意目錄下隨意新增未經使用者明確要求或授權的暫存檔、腳本、測試檔或批次檔。
2. **根目錄整潔維護**：專案根目錄只允許保留唯一的啟動腳本 `control.bat` 及必要設定檔，所有輔助工具與腳本必須收納於 `tools/` 資料夾中。

