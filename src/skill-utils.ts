// src/skill-utils.ts
// Shared модуль: Skill-инфраструктура для уроков 05–08
import OpenAI from "openai";
import { execSync } from "child_process";
import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join } from "path";
import dotenv from "dotenv";

dotenv.config();

const client = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY ?? "",
});

const MODEL = "anthropic/claude-sonnet-4.5";

// === Интерфейс Skill ===
export interface Skill {
    name: string;
    description: string;       // Discovery-уровень: когда использовать
    instructions: string;      // Activation-уровень: полные инструкции
    location: string;          // путь к папке skill'а
    tools: OpenAI.ChatCompletionTool[];
    handlers: Record<string, (args: any) => string | Promise<string>>;
}

// === Парсер YAML frontmatter ===
export function parseFrontmatter(raw: string) {
    const parts = raw.split("---");
    if (parts.length < 3) {
        throw new Error("Invalid SKILL.md: no frontmatter found");
    }
    const frontmatter = parts[1].trim();
    const body = parts.slice(2).join("---").trim();

    const meta: Record<string, string> = {};
    for (const line of frontmatter.split("\n")) {
        const idx = line.indexOf(":");
        if (idx > 0 && !line.startsWith(" ")) {
            meta[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
        }
    }

    return { name: meta.name, description: meta.description, body };
}

// === Discovery: сканируем папку, извлекаем name + description ===
export function discoverSkills(dir: string) {
    const entries = readdirSync(dir)
        .filter(name => {
            const fullPath = join(dir, name, "SKILL.md");
            try { statSync(fullPath); return true; }
            catch { return false; }
        });

    console.log(`\n📋 Discovery: найдено ${entries.length} skill(s)`);

    return entries.map(name => {
        const skillPath = join(dir, name);
        const raw = readFileSync(join(skillPath, "SKILL.md"), "utf-8");
        const { name: skillName, description } = parseFrontmatter(raw);
        console.log(`  • ${skillName}: ${description}`);
        return { name: skillName, description, location: skillPath };
    });
}

// === Activation: загружаем полный SKILL.md ===
export function activateSkill(location: string) {
    const raw = readFileSync(join(location, "SKILL.md"), "utf-8");
    const { name, description, body } = parseFrontmatter(raw);
    console.log(`  ✅ ${name} activated (${body.length} chars)`);
    return { name, description, instructions: body, location };
}

// === Фабрики для переиспользуемых skills ===

type SkillMeta = ReturnType<typeof activateSkill>;

export function createFilesystemSkill(meta: SkillMeta): Skill {
    return {
        ...meta,
        tools: [
            {
                type: "function",
                function: {
                    name: "read_file",
                    description: "Прочитать файл",
                    parameters: {
                        type: "object",
                        properties: {
                            path: { type: "string", description: "Путь к файлу" },
                        },
                        required: ["path"],
                    },
                },
            },
            {
                type: "function",
                function: {
                    name: "write_file",
                    description: "Записать содержимое в файл",
                    parameters: {
                        type: "object",
                        properties: {
                            path: { type: "string", description: "Путь к файлу" },
                            content: { type: "string", description: "Содержимое" },
                        },
                        required: ["path", "content"],
                    },
                },
            },
            {
                type: "function",
                function: {
                    name: "list_dir",
                    description: "Список файлов в директории",
                    parameters: {
                        type: "object",
                        properties: {
                            path: { type: "string", description: "Путь к директории" },
                        },
                        required: ["path"],
                    },
                },
            },
        ],
        handlers: {
            read_file: ({ path }) => {
                try { return readFileSync(path, "utf-8"); }
                catch (e: any) { return `Ошибка: ${e.message}`; }
            },
            write_file: ({ path, content }) => {
                try { writeFileSync(path, content); return `Файл ${path} записан`; }
                catch (e: any) { return `Ошибка: ${e.message}`; }
            },
            list_dir: ({ path }) => {
                try { return execSync(`ls -la ${path}`, { encoding: "utf-8" }); }
                catch (e: any) { return `Ошибка: ${e.message}`; }
            },
        },
    };
}

export function createBashSkill(meta: SkillMeta): Skill {
    return {
        ...meta,
        tools: [
            {
                type: "function",
                function: {
                    name: "run_bash",
                    description: "Выполнить bash-команду",
                    parameters: {
                        type: "object",
                        properties: {
                            command: { type: "string", description: "Команда" },
                        },
                        required: ["command"],
                    },
                },
            },
        ],
        handlers: {
            run_bash: ({ command }) => {
                try {
                    return execSync(command, { encoding: "utf-8", timeout: 10000 }).trim();
                } catch (e: any) {
                    return `Ошибка: ${e.stderr || e.message}`;
                }
            },
        },
    };
}

export function createReasoningSkill(meta: SkillMeta): Skill {
    return {
        ...meta,
        tools: [
            {
                type: "function",
                function: {
                    name: "think",
                    description:
                        "Используй этот инструмент чтобы подумать, спланировать или порассуждать. " +
                        "Результат не виден пользователю — это твой внутренний блокнот.",
                    parameters: {
                        type: "object",
                        properties: {
                            thought: {
                                type: "string",
                                description: "Твои мысли, план, рассуждения",
                            },
                        },
                        required: ["thought"],
                    },
                },
            },
        ],
        handlers: {
            think: () => "OK",
        },
    };
}

export function createWebSearchSkill(meta: SkillMeta): Skill {
    return {
        ...meta,
        tools: [
            {
                type: "function",
                function: {
                    name: "web_search",
                    description: "Поиск в интернете",
                    parameters: {
                        type: "object",
                        properties: {
                            query: { type: "string", description: "Поисковый запрос" },
                        },
                        required: ["query"],
                    },
                },
            },
        ],
        handlers: {
            web_search: ({ query }) =>
                `[Заглушка] Результаты поиска по "${query}": ` +
                `1. Official docs — https://example.com/docs\n` +
                `2. Tutorial — https://example.com/tutorial`,
        },
    };
}

export function createInteractionSkill(meta: SkillMeta): Skill {
    const readline = require("readline");
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const ask = (q: string): Promise<string> =>
        new Promise(resolve => rl.question(q, (a: string) => resolve(a.trim())));

    return {
        ...meta,
        tools: [
            {
                type: "function",
                function: {
                    name: "ask_user_choice",
                    description:
                        "Предложить пользователю выбор из нескольких вариантов. " +
                        "Используй когда есть несколько хороших решений.",
                    parameters: {
                        type: "object",
                        properties: {
                            question: { type: "string", description: "Вопрос для пользователя" },
                            options: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        label: { type: "string" },
                                        description: { type: "string" },
                                    },
                                    required: ["label", "description"],
                                },
                                description: "Варианты (2-5 штук)",
                            },
                            allow_custom: { type: "boolean", description: "Разрешить свой вариант" },
                        },
                        required: ["question", "options"],
                    },
                },
            },
            {
                type: "function",
                function: {
                    name: "ask_user_input",
                    description:
                        "Запросить текстовый ввод. Используй когда нужна конкретная информация.",
                    parameters: {
                        type: "object",
                        properties: {
                            question: { type: "string", description: "Что спросить" },
                            hint: { type: "string", description: "Подсказка" },
                            default_value: { type: "string", description: "Значение по умолчанию" },
                        },
                        required: ["question"],
                    },
                },
            },
            {
                type: "function",
                function: {
                    name: "ask_user_confirm",
                    description:
                        "Запросить подтверждение да/нет. Используй перед важными действиями.",
                    parameters: {
                        type: "object",
                        properties: {
                            question: { type: "string", description: "Что подтвердить" },
                            details: { type: "string", description: "Детали для решения" },
                        },
                        required: ["question"],
                    },
                },
            },
        ],
        handlers: {
            ask_user_choice: async ({ question, options, allow_custom }) => {
                console.log("\n" + "═".repeat(50));
                console.log(`🤔 ${question}`);
                console.log("─".repeat(50));
                options.forEach((opt: any, i: number) => {
                    console.log(`  ${i + 1}) ${opt.label}`);
                    console.log(`     ${opt.description}`);
                });
                if (allow_custom) console.log(`  ${options.length + 1}) Свой вариант...`);
                console.log("─".repeat(50));
                const answer = await ask(`Выбор [1-${options.length + (allow_custom ? 1 : 0)}]: `);
                const num = parseInt(answer);
                if (allow_custom && num === options.length + 1) {
                    const custom = await ask("Введите свой вариант: ");
                    return `Пользователь выбрал свой вариант: "${custom}"`;
                }
                if (num >= 1 && num <= options.length) {
                    const chosen = options[num - 1];
                    return `Пользователь выбрал: "${chosen.label}" — ${chosen.description}`;
                }
                return `Пользователь ответил: "${answer}"`;
            },
            ask_user_input: async ({ question, hint, default_value }) => {
                console.log("\n" + "═".repeat(50));
                let prompt = `📝 ${question}`;
                if (hint) prompt += `\n   💡 ${hint}`;
                if (default_value) prompt += `\n   (Enter = "${default_value}")`;
                console.log(prompt);
                console.log("─".repeat(50));
                const answer = await ask("> ");
                return `Пользователь ввёл: "${answer || default_value || ""}"`;
            },
            ask_user_confirm: async ({ question, details }) => {
                console.log("\n" + "═".repeat(50));
                console.log(`❓ ${question}`);
                if (details) console.log(`   ${details}`);
                console.log("─".repeat(50));
                const answer = await ask("Да/Нет [y/n]: ");
                const confirmed = ["y", "д", "да", "yes"].includes(answer.toLowerCase());
                return confirmed ? "Пользователь подтвердил: ДА" : "Пользователь отказал: НЕТ";
            },
        },
    };
}

// === Создание агента из массива skills ===
interface AgentOptions {
    systemPrompt?: string;
    maxIterations?: number;
    extraTools?: OpenAI.ChatCompletionTool[];
    extraHandlers?: Record<string, (args: any) => string | Promise<string>>;
}

export function createAgent(skills: Skill[], options: AgentOptions = {}) {
    const allTools = [
        ...skills.flatMap(s => s.tools),
        ...(options.extraTools ?? []),
    ];
    const allHandlers: Record<string, (args: any) => string | Promise<string>> = {
        ...Object.assign({}, ...skills.map(s => s.handlers)),
        ...(options.extraHandlers ?? {}),
    };

    const skillsXml = skills.map(s =>
        `  <skill name="${s.name}">\n${s.instructions}\n  </skill>`
    ).join("\n");

    const systemPrompt = options.systemPrompt
        ? options.systemPrompt.replace("{{SKILLS}}", skillsXml)
        : `Ты полезный ассистент. Вот твои навыки:

<available_skills>
${skillsXml}
</available_skills>

Используй инструменты когда нужно. Отвечай на русском.`;

    const maxIterations = options.maxIterations ?? 10;

    return async function run(userMessage: string) {
        const messages: OpenAI.ChatCompletionMessageParam[] = [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
        ];

        let iteration = 0;

        while (iteration < maxIterations) {
            iteration++;
            console.log(`\n--- Итерация ${iteration} ---`);

            const response = await client.chat.completions.create({
                model: MODEL,
                messages,
                tools: allTools,
            });

            const message = response.choices[0].message;
            messages.push(message);

            if (!message.tool_calls?.length) {
                console.log("\nОтвет:", message.content);
                return message.content;
            }

            for (const toolCall of message.tool_calls) {
                const name = toolCall.function.name;
                const args = JSON.parse(toolCall.function.arguments);
                console.log(`Tool: ${name}(${JSON.stringify(args).slice(0, 120)})`);

                const handler = allHandlers[name];
                let result: string;
                if (handler) {
                    const output = handler(args);
                    result = output instanceof Promise ? await output : output;
                } else {
                    result = `Tool "${name}" не найден`;
                }
                console.log(`→ ${result.slice(0, 150)}`);

                messages.push({
                    role: "tool",
                    tool_call_id: toolCall.id,
                    content: result,
                });
            }
        }
    };
}
