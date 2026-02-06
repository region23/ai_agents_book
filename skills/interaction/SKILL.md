---
name: interaction
description: Ask the user questions, offer choices, and request confirmations. Use when the agent needs human input or approval.
metadata:
  author: ai-agents-book
  version: "1.0"
---

# Interaction Skill

Ты можешь взаимодействовать с пользователем: задавать вопросы, предлагать варианты, запрашивать подтверждения.

## Доступные инструменты
- **ask_user_choice** — предложить выбор из нескольких вариантов (wizard-стиль)
- **ask_user_input** — запросить текстовый ввод
- **ask_user_confirm** — запросить подтверждение да/нет

## Правила
- Предлагай 2-4 варианта с понятными описаниями плюсов и минусов
- Используй ask_user_confirm перед необратимыми действиями
- Не делай предположений — спрашивай, если не уверен
- Разбивай сложные решения на шаги (wizard-паттерн)
