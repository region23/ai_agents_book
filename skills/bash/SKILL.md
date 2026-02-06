---
name: bash
description: Execute shell commands. Use when the agent needs to run scripts, install packages, or interact with the system.
metadata:
  author: ai-agents-book
  version: "1.0"
---

# Bash Skill

Ты умеешь выполнять shell-команды через bash.

## Доступные инструменты
- **run_bash** — выполнить bash-команду и получить stdout

## Правила
- Используй для чтения структуры проекта (find, ls, tree)
- Используй для анализа кода (grep, wc, diff)
- Таймаут: 10 секунд. Не запускай долгие процессы
- Будь осторожен с деструктивными командами (rm, mv)
