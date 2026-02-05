#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "..");
const SOURCE_INDEX_PATH = path.join(ROOT_DIR, "index.html");
const PUBLIC_DIR = path.join(ROOT_DIR, "public");

const LESSON_FILES = [
    { id: 1, file: "lesson-01-basic-call.html" },
    { id: 2, file: "lesson-02-with-tool.html" },
    { id: 3, file: "lesson-03-agent-loop.html" },
    { id: 4, file: "lesson-04-real-tools.html" },
    { id: 5, file: "lesson-05-skills.html" },
    { id: 6, file: "lesson-06-planning.html" },
    { id: 7, file: "lesson-07-adaptive-agent.html" },
    { id: 8, file: "lesson-08-interactive-agent.html" },
];

const EXTRA_STYLE = `
<style>
    .book-nav {
        position: sticky;
        top: 0;
        z-index: 40;
        backdrop-filter: blur(8px);
        background: rgba(10, 10, 15, 0.85);
        border-bottom: 1px solid var(--border);
    }

    .book-nav-inner {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0.8rem 1.25rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
        flex-wrap: wrap;
    }

    .book-nav a {
        color: var(--text);
        text-decoration: none;
        border: 1px solid var(--border);
        border-radius: 999px;
        padding: 0.35rem 0.75rem;
        font-size: 0.9rem;
        transition: all 0.2s;
    }

    .book-nav a:hover {
        border-color: var(--accent);
        color: var(--text-bright);
    }

    .book-nav-title {
        color: var(--text-dim);
        font-size: 0.85rem;
        white-space: nowrap;
    }

    .lesson-shell {
        max-width: 1280px;
        margin: 0 auto;
        padding: 1.25rem;
        display: grid;
        grid-template-columns: 300px minmax(0, 1fr);
        gap: 1rem;
        align-items: start;
    }

    .lesson-sidebar {
        position: sticky;
        top: 76px;
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-radius: 14px;
        padding: 1rem;
    }

    .lesson-sidebar h2 {
        margin: 0 0 0.6rem;
        font-size: 1rem;
    }

    .lesson-toc {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
    }

    .lesson-toc a {
        display: block;
        border: 1px solid var(--border);
        border-radius: 10px;
        padding: 0.45rem 0.6rem;
        color: var(--text-dim);
        text-decoration: none;
        line-height: 1.35;
        font-size: 0.85rem;
    }

    .lesson-toc a:hover {
        color: var(--text);
        border-color: var(--accent);
    }

    .lesson-toc a.current {
        color: var(--text-bright);
        border-color: var(--accent);
        background: rgba(99, 102, 241, 0.12);
    }

    .lesson-main .steps-container {
        max-width: 100%;
        padding: 0;
        margin: 0;
    }

    .lesson-main .step {
        margin: 0;
    }

    .lesson-main .step-card {
        cursor: default;
    }

    .lesson-main .step-card:hover {
        transform: none;
        box-shadow: none;
    }

    .lesson-pager {
        margin: 1rem 0 0;
        display: flex;
        flex-wrap: wrap;
        gap: 0.55rem;
    }

    .lesson-pager-link {
        color: var(--text);
        text-decoration: none;
        border: 1px solid var(--border);
        border-radius: 999px;
        padding: 0.45rem 0.8rem;
        font-size: 0.9rem;
    }

    .lesson-pager-link:hover {
        border-color: var(--accent);
    }

    .lesson-pager-link.disabled {
        opacity: 0.5;
        pointer-events: none;
    }

    .book-outline-section {
        max-width: 1100px;
        margin: 0 auto;
        padding: 0 2rem 4rem;
    }

    .book-outline-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 0.75rem;
        margin-top: 1rem;
    }

    .book-outline-card {
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-radius: 14px;
        padding: 1rem;
        text-decoration: none;
        color: inherit;
        transition: all 0.2s;
    }

    .book-outline-card:hover {
        border-color: var(--accent);
        background: var(--bg-card-hover);
        transform: translateY(-2px);
    }

    .book-outline-meta {
        color: var(--text-dim);
        font-size: 0.8rem;
        margin-bottom: 0.35rem;
    }

    .book-outline-title {
        font-weight: 700;
        line-height: 1.35;
    }

    .book-outline-intro {
        color: var(--text-dim);
        margin-top: 0.45rem;
        font-size: 0.92rem;
    }

    @media (max-width: 980px) {
        .lesson-shell {
            grid-template-columns: minmax(0, 1fr);
        }

        .lesson-sidebar {
            position: static;
        }
    }

    @media (max-width: 680px) {
        .book-nav-inner {
            padding: 0.7rem 0.8rem;
        }

        .lesson-shell {
            padding: 0.75rem;
        }

        .book-outline-section {
            padding: 0 0.8rem 2.5rem;
        }
    }
</style>
`;

function readSourceHtml() {
    return fs.readFileSync(SOURCE_INDEX_PATH, "utf8");
}

function ensurePublicDir() {
    fs.rmSync(PUBLIC_DIR, { recursive: true, force: true });
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}

function extractMatch(html, pattern, label) {
    const match = html.match(pattern);
    if (!match) {
        throw new Error(`Cannot extract ${label}`);
    }

    return match[1];
}

function extractBalancedElement(html, startIndex, tagName) {
    if (startIndex < 0) {
        throw new Error(`Invalid start index for <${tagName}>`);
    }

    let depth = 1;
    let cursor = startIndex + tagName.length + 1;

    while (depth > 0) {
        const nextOpen = html.indexOf(`<${tagName}`, cursor);
        const nextClose = html.indexOf(`</${tagName}>`, cursor);

        if (nextClose === -1) {
            throw new Error(`Cannot find closing </${tagName}>`);
        }

        if (nextOpen !== -1 && nextOpen < nextClose) {
            depth += 1;
            cursor = nextOpen + tagName.length + 1;
            continue;
        }

        depth -= 1;
        cursor = nextClose + tagName.length + 3;
    }

    return html.slice(startIndex, cursor);
}

function extractByToken(html, token, tagName) {
    const startIndex = html.indexOf(token);
    if (startIndex === -1) {
        throw new Error(`Token not found: ${token}`);
    }

    return extractBalancedElement(html, startIndex, tagName);
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function stripTags(value) {
    return String(value)
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+-\s*/g, "-")
        .replace(/\s+/g, " ")
        .trim();
}

function normalizeInlineHtml(value) {
    return String(value).replace(/\s+/g, " ").trim();
}

function makeHead(sourceHead, title) {
    const titleTag = `<title>${escapeHtml(title)}</title>`;
    let head = sourceHead;

    if (/<title>[\s\S]*?<\/title>/i.test(head)) {
        head = head.replace(/<title>[\s\S]*?<\/title>/i, titleTag);
    } else {
        head = `${titleTag}\n${head}`;
    }

    return `${head}\n${EXTRA_STYLE}`;
}

function buildDocument({ sourceHead, title, bodyContent, scripts }) {
    const head = makeHead(sourceHead, title);

    return [
        "<!DOCTYPE html>",
        '<html lang="ru">',
        "<head>",
        head,
        "</head>",
        "<body>",
        bodyContent,
        scripts,
        "</body>",
        "</html>",
        "",
    ].join("\n");
}

function ensureActiveStep(stepHtml) {
    if (/class="step[^\"]*\bactive\b/.test(stepHtml)) {
        return stepHtml;
    }

    return stepHtml.replace("class=\"step\"", "class=\"step active\"");
}

function buildLessonPagerLink(lesson, label, direction) {
    if (!lesson) {
        return `<span class="lesson-pager-link disabled">${escapeHtml(label)}</span>`;
    }

    const arrowed = direction === "prev" ? `← ${label}` : `${label} →`;
    return `<a class="lesson-pager-link" href="${lesson.file}">${escapeHtml(arrowed)}</a>`;
}

function copyStaticFiles() {
    const cnamePath = path.join(ROOT_DIR, "CNAME");
    if (fs.existsSync(cnamePath)) {
        fs.copyFileSync(cnamePath, path.join(PUBLIC_DIR, "CNAME"));
    }

    fs.writeFileSync(path.join(PUBLIC_DIR, ".nojekyll"), "", "utf8");
}

function getStepMeta(stepHtml, id) {
    const titleHtml = normalizeInlineHtml(stepHtml.match(/<div class="step-title">([\s\S]*?)<\/div>/)?.[1] || `Урок ${id}`);
    const introHtml = normalizeInlineHtml(stepHtml.match(/<p class="step-intro">([\s\S]*?)<\/p>/)?.[1] || "");
    const badgeText = stripTags(stepHtml.match(/<span class="step-badge[^\"]*">([\s\S]*?)<\/span>/)?.[1] || "");

    return {
        titleHtml,
        introHtml,
        titleText: stripTags(titleHtml),
        badgeText,
    };
}

function build() {
    const sourceHtml = readSourceHtml();
    const sourceHead = extractMatch(sourceHtml, /<head>([\s\S]*?)<\/head>/i, "head");
    const sourceBody = extractMatch(sourceHtml, /<body>([\s\S]*?)<\/body>/i, "body");

    const heroSection = extractByToken(sourceBody, '<section class="hero">', "section");
    const prepSection = extractByToken(sourceBody, '<section class="prep-section" id="before-start">', "section");
    const conceptSection = extractByToken(sourceBody, '<section class="concept-section" id="step-0">', "section");
    const footerSection = extractByToken(sourceBody, '<section class="footer">', "section");

    const scriptsStart = sourceBody.indexOf('<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>');
    if (scriptsStart === -1) {
        throw new Error("Cannot find scripts block in source index.html");
    }
    const scriptsHtml = sourceBody.slice(scriptsStart).trim();

    const stepsContainer = extractByToken(sourceBody, '<div class="steps-container">', "div");

    const lessons = LESSON_FILES.map((lessonInfo) => {
        const marker = `id="step-${lessonInfo.id}"`;
        const markerIndex = stepsContainer.indexOf(marker);
        if (markerIndex === -1) {
            throw new Error(`Cannot find step ${lessonInfo.id} in source index.html`);
        }

        const stepStart = stepsContainer.lastIndexOf('<div class="step', markerIndex);
        if (stepStart === -1) {
            throw new Error(`Cannot find step start for step ${lessonInfo.id}`);
        }

        const stepHtml = extractBalancedElement(stepsContainer, stepStart, "div");
        const meta = getStepMeta(stepHtml, lessonInfo.id);

        return {
            ...lessonInfo,
            ...meta,
            stepHtml,
        };
    });

    ensurePublicDir();

    const outlineCardsHtml = lessons
        .map((lesson) => {
            const lessonNumber = String(lesson.id).padStart(2, "0");
            return `
<a class="book-outline-card" href="${lesson.file}">
    <div class="book-outline-meta">Урок ${lessonNumber}${lesson.badgeText ? ` · ${escapeHtml(lesson.badgeText)}` : ""}</div>
    <div class="book-outline-title">${lesson.titleHtml}</div>
    <div class="book-outline-intro">${lesson.introHtml}</div>
</a>`;
        })
        .join("\n");

    const homeBody = `
<nav class="book-nav">
    <div class="book-nav-inner">
        <a href="#step-0">Что такое агент</a>
        <div class="book-nav-title">8 уроков от первого вызова до интерактивного агента</div>
        <a href="${lessons[0].file}">Начать с урока 01</a>
    </div>
</nav>
${heroSection}
${prepSection}
${conceptSection}
<section class="book-outline-section" id="toc">
    <div class="concept-header" style="margin-bottom: 1.5rem;">
        <h2>Оглавление уроков</h2>
        <p>Каждый урок открыт на отдельной странице. Структура, текст и демо-блоки сохранены как в исходном учебнике.</p>
    </div>
    <div class="book-outline-grid">
${outlineCardsHtml}
    </div>
</section>
${footerSection}
`;

    const homeHtml = buildDocument({
        sourceHead,
        title: "ИИ-агенты для самых маленьких — Оглавление",
        bodyContent: homeBody,
        scripts: scriptsHtml,
    });

    fs.writeFileSync(path.join(PUBLIC_DIR, "index.html"), homeHtml, "utf8");

    lessons.forEach((lesson, index) => {
        const lessonNumber = String(lesson.id).padStart(2, "0");
        const prevLesson = index > 0 ? lessons[index - 1] : null;
        const nextLesson = index < lessons.length - 1 ? lessons[index + 1] : null;

        const tocHtml = lessons
            .map((entry) => {
                const entryNumber = String(entry.id).padStart(2, "0");
                const classAttr = entry.id === lesson.id ? ' class="current"' : "";
                return `<a${classAttr} href="${entry.file}">${entryNumber}. ${escapeHtml(entry.titleText)}</a>`;
            })
            .join("\n");

        const lessonBody = `
<nav class="book-nav">
    <div class="book-nav-inner">
        <a href="index.html">← Оглавление</a>
        <div class="book-nav-title">Урок ${lessonNumber} из ${String(lessons.length).padStart(2, "0")}</div>
        ${nextLesson ? `<a href="${nextLesson.file}">Следующий урок →</a>` : '<a href="index.html">К оглавлению</a>'}
    </div>
</nav>
<div class="lesson-shell lesson-page">
    <aside class="lesson-sidebar">
        <h2>Навигация по урокам</h2>
        <div class="lesson-toc">
${tocHtml}
        </div>
    </aside>
    <main class="lesson-main">
        <div class="steps-container">
${ensureActiveStep(lesson.stepHtml)}
        </div>
        <div class="lesson-pager">
            ${buildLessonPagerLink(prevLesson, "Предыдущий урок", "prev")}
            <a class="lesson-pager-link" href="index.html">Оглавление</a>
            ${buildLessonPagerLink(nextLesson, "Следующий урок", "next")}
        </div>
    </main>
</div>
`;

        const lessonHtml = buildDocument({
            sourceHead,
            title: `Урок ${lessonNumber} — ${lesson.titleText}`,
            bodyContent: lessonBody,
            scripts: scriptsHtml,
        });

        fs.writeFileSync(path.join(PUBLIC_DIR, lesson.file), lessonHtml, "utf8");
    });

    copyStaticFiles();

    console.log(`Built ${lessons.length + 1} pages to ${PUBLIC_DIR}`);
}

build();
