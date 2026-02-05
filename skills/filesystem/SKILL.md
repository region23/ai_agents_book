---
name: filesystem
description: Read, write, and list files. Use when the agent needs to work with the file system.
metadata:
  author: ai-agents-book
  version: "1.0"
---

# Filesystem Skill

Ты умеешь работать с файлами: читать, записывать и просматривать директории.

## Доступные инструменты

- **read_file** — прочитать содержимое файла по пути
- **write_file** — записать содержимое в файл
- **list_dir** — получить список файлов в директории

## Правила
- Перед записью всегда проверяй, существует ли файл
- Для больших директорий используй фильтрацию
- Подробности по каждому инструменту — см. [references/REFERENCE.md](references/REFERENCE.md)
