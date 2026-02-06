#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "..");
const SOURCE_INDEX_PATH = path.join(ROOT_DIR, "index.html");
const LESSONS_DIR = path.join(ROOT_DIR, "lessons");
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

const LITE_LESSONS_DIR = path.join(ROOT_DIR, "lessons-lite");
const LITE_LESSON_FILES = [
    { id: 1, file: "lite-lesson-01-basic-call.html" },
    { id: 2, file: "lite-lesson-02-with-tool.html" },
    { id: 3, file: "lite-lesson-03-agent-loop.html" },
    { id: 4, file: "lite-lesson-04-real-tools.html" },
    { id: 5, file: "lite-lesson-05-skills.html" },
    { id: 6, file: "lite-lesson-06-planning.html" },
    { id: 7, file: "lite-lesson-07-adaptive-agent.html" },
    { id: 8, file: "lite-lesson-08-interactive-agent.html" },
];

const EXTRA_STYLE = `
<style>
    .book-nav {
        position: sticky;
        top: 0;
        z-index: 40;
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        background: rgba(6, 6, 12, 0.8);
        border-bottom: 1px solid var(--border);
    }

    .book-nav-inner {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0.75rem 1.25rem;
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
        padding: 0.35rem 0.85rem;
        font-size: 0.88rem;
        min-height: 44px;
        display: inline-flex;
        align-items: center;
        transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
    }

    .book-nav a:hover {
        border-color: var(--accent);
        color: var(--text-bright);
        background: rgba(124, 127, 247, 0.08);
    }

    .book-nav-title {
        color: var(--text-dim);
        font-size: 0.82rem;
        white-space: nowrap;
        letter-spacing: 0.01em;
    }

    .lesson-shell {
        max-width: 1280px;
        margin: 0 auto;
        padding: 1.25rem;
        display: grid;
        grid-template-columns: 280px minmax(0, 1fr);
        gap: 1.25rem;
        align-items: start;
    }

    .lesson-sidebar {
        position: sticky;
        top: 68px;
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-radius: var(--radius-lg, 16px);
        padding: 1.1rem;
    }

    .lesson-sidebar h2 {
        margin: 0 0 0.7rem;
        font-size: 0.95rem;
        font-weight: 700;
        letter-spacing: -0.01em;
    }

    .lesson-toc {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
    }

    .lesson-toc a {
        display: flex;
        align-items: center;
        border: 1px solid var(--border);
        border-radius: var(--radius-sm, 8px);
        padding: 0.45rem 0.65rem;
        min-height: 44px;
        color: var(--text-dim);
        text-decoration: none;
        line-height: 1.35;
        font-size: 0.82rem;
        transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
    }

    .lesson-toc a:hover {
        color: var(--text);
        border-color: rgba(124, 127, 247, 0.35);
        background: rgba(124, 127, 247, 0.05);
    }

    .lesson-toc a.current {
        color: var(--text-bright);
        border-color: var(--accent);
        background: rgba(124, 127, 247, 0.1);
        box-shadow: 0 0 16px rgba(124, 127, 247, 0.08);
    }

    .lesson-main .steps-container {
        max-width: 100%;
        padding: 0;
        margin: 0;
    }

    .lesson-main .steps-container::before {
        display: none;
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

    .lesson-main .step-card::before {
        display: none;
    }

    .lesson-pager {
        margin: 1.5rem 0 0;
        display: flex;
        flex-wrap: wrap;
        gap: 0.55rem;
        justify-content: center;
    }

    .lesson-pager-link {
        color: var(--text);
        text-decoration: none;
        border: 1px solid var(--border);
        border-radius: 999px;
        padding: 0.45rem 0.9rem;
        font-size: 0.88rem;
        min-height: 44px;
        display: inline-flex;
        align-items: center;
        transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
    }

    .lesson-pager-link:hover {
        border-color: var(--accent);
        background: rgba(124, 127, 247, 0.08);
    }

    .lesson-pager-link.disabled {
        opacity: 0.35;
        pointer-events: none;
    }

    .book-outline-section {
        max-width: 1100px;
        margin: 0 auto;
        padding: 0 2rem 5rem;
    }

    .book-outline-grid {
        display: flex;
        flex-direction: column;
        gap: 0.85rem;
        margin-top: 1.25rem;
    }

    .book-outline-card {
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-radius: var(--radius-lg, 16px);
        padding: 1.15rem;
        text-decoration: none;
        color: inherit;
        transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
        position: relative;
    }

    .book-outline-card::before {
        content: '';
        position: absolute;
        inset: -1px;
        border-radius: inherit;
        background: linear-gradient(135deg, rgba(124, 127, 247, 0.2), rgba(34, 211, 238, 0.1), transparent 60%);
        opacity: 0;
        transition: opacity 0.4s ease;
        z-index: -1;
        pointer-events: none;
    }

    .book-outline-card:hover {
        border-color: rgba(124, 127, 247, 0.3);
        background: var(--bg-card-hover);
        transform: translateY(-3px);
    }

    .book-outline-card:hover::before {
        opacity: 1;
    }

    .book-outline-meta {
        color: var(--text-dim);
        font-size: 0.78rem;
        margin-bottom: 0.4rem;
        font-family: 'JetBrains Mono', monospace;
        letter-spacing: 0.02em;
    }

    .book-outline-title {
        font-weight: 700;
        line-height: 1.35;
        letter-spacing: -0.01em;
    }

    .book-outline-intro {
        color: var(--text-dim);
        margin-top: 0.5rem;
        font-size: 0.9rem;
        line-height: 1.55;
    }

    .sidebar-toggle {
        display: none;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid var(--border);
        border-radius: var(--radius-sm, 8px);
        color: var(--text);
        font-size: 1.2rem;
        cursor: pointer;
        min-height: 44px;
        min-width: 44px;
        align-items: center;
        justify-content: center;
        transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
    }

    .sidebar-toggle:hover {
        background: rgba(255, 255, 255, 0.08);
        border-color: var(--accent);
    }

    .sidebar-backdrop {
        display: none;
    }

    @media (max-width: 980px) {
        .sidebar-toggle {
            display: inline-flex;
        }

        .lesson-shell {
            grid-template-columns: minmax(0, 1fr);
        }

        .lesson-sidebar {
            position: fixed;
            left: 0;
            top: 0;
            bottom: 0;
            width: 280px;
            max-width: 80vw;
            z-index: 50;
            border-radius: 0;
            border-left: none;
            border-top: none;
            border-bottom: none;
            transform: translateX(-100%);
            transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
            overflow-y: auto;
        }

        .lesson-sidebar.open {
            transform: translateX(0);
        }

        .sidebar-backdrop.visible {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.6);
            z-index: 45;
        }
    }

    @media (max-width: 680px) {
        .book-nav-inner {
            padding: 0.65rem 0.8rem;
        }

        .book-nav-title {
            display: none;
        }

        .lesson-shell {
            padding: 0.75rem;
        }

        .lesson-pager {
            gap: 0.4rem;
        }

        .lesson-pager-link {
            font-size: 0.8rem;
            padding: 0.4rem 0.7rem;
        }

        .book-outline-section {
            padding: 0 0.8rem 2.5rem;
        }

        .book-outline-grid {
            /* already single-column */
        }
    }

    @media (max-width: 640px) {
        .lesson-page .step {
            padding-left: 0;
        }

        .lesson-page .step::before {
            display: none;
        }

        .lesson-page .step-number {
            width: 1.6rem;
            height: 1.6rem;
            font-size: 0.65rem;
            top: 0.6rem;
        }

        .lesson-page .step-card {
            background: transparent;
            border: none;
            border-radius: 0;
            padding: 0.5rem 0;
            overflow: visible;
        }

        .lesson-page .step-header {
            padding-left: 2.2rem;
        }
    }

    /* ====== Track Toggle ====== */
    .track-toggle {
        display: flex;
        justify-content: center;
        gap: 0.5rem;
        margin-bottom: 1.5rem;
    }

    .track-toggle-btn {
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid var(--border);
        border-radius: 999px;
        padding: 0.55rem 1.25rem;
        color: var(--text-dim);
        font-size: 0.92rem;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
        min-height: 44px;
    }

    .track-toggle-btn:hover {
        border-color: rgba(124, 127, 247, 0.4);
        color: var(--text);
        background: rgba(124, 127, 247, 0.06);
    }

    .track-toggle-btn.active[data-track="dev"] {
        border-color: var(--accent);
        color: var(--text-bright);
        background: rgba(124, 127, 247, 0.12);
        box-shadow: 0 0 20px rgba(124, 127, 247, 0.15);
    }

    .track-toggle-btn.active[data-track="lite"] {
        border-color: var(--accent-secondary, #a78bfa);
        color: var(--text-bright);
        background: rgba(167, 139, 250, 0.12);
        box-shadow: 0 0 20px rgba(167, 139, 250, 0.15);
    }

    /* ====== Lite Card Gradient ====== */
    .book-outline-card--lite::before {
        background: linear-gradient(135deg, rgba(167, 139, 250, 0.2), rgba(244, 114, 182, 0.15), transparent 60%);
    }

    .book-outline-card--lite:hover {
        border-color: rgba(167, 139, 250, 0.3);
    }

    /* ====== Analogy Block ====== */
    .analogy-block {
        border-left: 3px solid var(--accent-secondary, #a78bfa);
        background: rgba(167, 139, 250, 0.06);
        border-radius: 0 var(--radius-sm, 8px) var(--radius-sm, 8px) 0;
        padding: 1rem 1.25rem;
        margin: 1rem 0;
    }

    .analogy-block-title {
        font-weight: 700;
        font-size: 0.95rem;
        margin-bottom: 0.5rem;
        color: var(--text-bright);
    }

    .analogy-block p {
        color: var(--text);
        line-height: 1.65;
        margin: 0;
        font-size: 0.92rem;
    }

    /* ====== Scenario Block (Dialog) ====== */
    .scenario-block {
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-radius: var(--radius-lg, 16px);
        padding: 1.15rem;
        margin: 1rem 0;
    }

    .scenario-block-title {
        font-weight: 700;
        font-size: 0.88rem;
        color: var(--text-dim);
        margin-bottom: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.04em;
    }

    .scenario-line {
        display: flex;
        gap: 0.65rem;
        padding: 0.45rem 0;
        font-size: 0.9rem;
        line-height: 1.55;
    }

    .scenario-line + .scenario-line {
        border-top: 1px solid rgba(255, 255, 255, 0.04);
    }

    .scenario-role {
        font-weight: 700;
        font-size: 0.78rem;
        min-width: 3.8rem;
        text-align: right;
        padding-top: 0.1rem;
        flex-shrink: 0;
    }

    .scenario-role.user { color: var(--accent-cyan, #22d3ee); }
    .scenario-role.llm { color: var(--accent, #7c7ff7); }
    .scenario-role.tool { color: var(--accent-warm, #f59e0b); }
    .scenario-role.system { color: var(--text-dim); }

    .scenario-text {
        color: var(--text);
    }

    /* ====== Business Example ====== */
    .biz-example {
        border-left: 3px solid var(--accent-warm, #f59e0b);
        background: rgba(245, 158, 11, 0.06);
        border-radius: 0 var(--radius-sm, 8px) var(--radius-sm, 8px) 0;
        padding: 1rem 1.25rem;
        margin: 1rem 0;
    }

    .biz-example-title {
        font-weight: 700;
        font-size: 0.95rem;
        margin-bottom: 0.5rem;
        color: var(--text-bright);
    }

    .biz-example p {
        color: var(--text);
        line-height: 1.65;
        margin: 0;
        font-size: 0.92rem;
    }

    /* ====== Lite Summary ====== */
    .lite-summary {
        border: 1px solid rgba(52, 211, 153, 0.25);
        background: rgba(52, 211, 153, 0.06);
        border-radius: var(--radius-lg, 16px);
        padding: 1.15rem 1.25rem;
        margin: 1.25rem 0;
    }

    .lite-summary-title {
        font-weight: 700;
        font-size: 0.95rem;
        color: #34d399;
        margin-bottom: 0.65rem;
    }

    .lite-summary ul {
        margin: 0;
        padding-left: 1.25rem;
        color: var(--text);
        font-size: 0.92rem;
        line-height: 1.7;
    }

    .lite-summary li + li {
        margin-top: 0.25rem;
    }

    /* ====== Compare Table ====== */
    .compare-table {
        width: 100%;
        border-collapse: collapse;
        margin: 1rem 0;
        font-size: 0.9rem;
    }

    .compare-table th,
    .compare-table td {
        border: 1px solid var(--border);
        padding: 0.65rem 0.85rem;
        text-align: left;
    }

    .compare-table th {
        background: rgba(255, 255, 255, 0.04);
        color: var(--text-bright);
        font-weight: 700;
        font-size: 0.82rem;
        text-transform: uppercase;
        letter-spacing: 0.03em;
    }

    .compare-table td {
        color: var(--text);
        line-height: 1.5;
    }

    .compare-table tr:hover td {
        background: rgba(255, 255, 255, 0.02);
    }

    /* ====== Lite Cross-link ====== */
    .lite-crosslink {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        color: var(--accent-secondary, #a78bfa);
        text-decoration: none;
        font-size: 0.88rem;
        padding: 0.35rem 0.75rem;
        border: 1px solid rgba(167, 139, 250, 0.25);
        border-radius: 999px;
        transition: all 0.3s ease;
    }

    .lite-crosslink:hover {
        border-color: rgba(167, 139, 250, 0.5);
        background: rgba(167, 139, 250, 0.08);
    }

    @media (max-width: 680px) {
        .track-toggle {
            flex-direction: column;
            align-items: center;
        }

        .track-toggle-btn {
            width: 100%;
            max-width: 300px;
            text-align: center;
        }

        .scenario-line {
            flex-direction: column;
            gap: 0.2rem;
        }

        .scenario-role {
            text-align: left;
            min-width: auto;
        }

        .compare-table {
            font-size: 0.82rem;
        }

        .compare-table th,
        .compare-table td {
            padding: 0.45rem 0.55rem;
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
        introText: stripTags(introHtml),
        titleText: stripTags(titleHtml),
        badgeText,
    };
}

function readLessonFile(lessonId) {
    const pad = String(lessonId).padStart(2, "0");
    const raw = fs.readFileSync(path.join(LESSONS_DIR, `lesson-${pad}.html`), "utf8");

    const demoMatch = raw.match(/<script type="application\/json" data-demo-steps="([^"]+)">([\s\S]*?)<\/script>/);
    const demoKey = demoMatch ? demoMatch[1] : null;
    const demoData = demoMatch ? JSON.parse(demoMatch[2]) : null;

    const htmlEnd = demoMatch ? raw.indexOf(demoMatch[0]) : raw.length;
    // Strip trailing HTML comments (e.g. <!-- Демо-данные урока -->)
    const stepHtml = raw.slice(0, htmlEnd).replace(/\s*<!--[\s\S]*?-->\s*$/, "").trim();

    return { stepHtml, demoKey, demoData };
}

function readLiteLessonFile(lessonId) {
    const pad = String(lessonId).padStart(2, "0");
    const raw = fs.readFileSync(path.join(LITE_LESSONS_DIR, `lesson-${pad}.html`), "utf8");
    const stepHtml = raw.replace(/\s*<!--[\s\S]*?-->\s*$/, "").trim();
    return { stepHtml };
}

function buildDemoPlayersObject(lessons) {
    const obj = {};
    for (const lesson of lessons) {
        if (lesson.demoKey && lesson.demoData) {
            obj[lesson.demoKey] = lesson.demoData;
        }
    }
    return obj;
}

function build() {
    const sourceHtml = readSourceHtml();
    const sourceHead = extractMatch(sourceHtml, /<head>([\s\S]*?)<\/head>/i, "head");
    const sourceBody = extractMatch(sourceHtml, /<body>([\s\S]*?)<\/body>/i, "body");

    const heroSection = extractByToken(sourceBody, '<section class="hero">', "section");
    const conceptSection = extractByToken(sourceBody, '<section class="concept-section" id="step-0">', "section");
    const footerSection = extractByToken(sourceBody, '<section class="footer">', "section");

    const scriptsStart = sourceBody.indexOf('<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>');
    if (scriptsStart === -1) {
        throw new Error("Cannot find scripts block in source index.html");
    }
    const scriptsHtml = sourceBody.slice(scriptsStart).trim();

    const lessons = LESSON_FILES.map((lessonInfo) => {
        const { stepHtml, demoKey, demoData } = readLessonFile(lessonInfo.id);
        const meta = getStepMeta(stepHtml, lessonInfo.id);

        return {
            ...lessonInfo,
            ...meta,
            stepHtml,
            demoKey,
            demoData,
        };
    });

    const liteLessons = LITE_LESSON_FILES.map((lessonInfo) => {
        const { stepHtml } = readLiteLessonFile(lessonInfo.id);
        const meta = getStepMeta(stepHtml, lessonInfo.id);

        return {
            ...lessonInfo,
            ...meta,
            stepHtml,
        };
    });

    const demoPlayersObj = buildDemoPlayersObject(lessons);

    // Inject assembled demoPlayers into the scripts block
    const demoPlaceholder = "// ====== Demo Player Data (собирается из lessons/) ======\n        const demoPlayers = {}; // PLACEHOLDER — заполняется build-скриптом";
    const demoJson = JSON.stringify(demoPlayersObj, null, 4);
    // Re-indent to match original 8-space base indent inside <script> block
    const demoIndented = demoJson.split("\n").map((line, i) => i === 0 ? line : "        " + line).join("\n");
    const demoReplacement = `// ====== Demo Player (Step-by-step) ======\n        const demoPlayers = ${demoIndented};`;

    function injectDemoPlayers(scripts) {
        return scripts.replace(demoPlaceholder, demoReplacement);
    }

    ensurePublicDir();

    const outlineCardsHtml = lessons
        .map((lesson) => {
            const lessonNumber = String(lesson.id).padStart(2, "0");
            return `
<a class="book-outline-card" href="${lesson.file}">
    <div class="book-outline-meta">Урок ${lessonNumber}${lesson.badgeText ? ` · ${escapeHtml(lesson.badgeText)}` : ""}</div>
    <div class="book-outline-title">${lesson.titleHtml}</div>
    <div class="book-outline-intro">${escapeHtml(lesson.introText)}</div>
</a>`;
        })
        .join("\n");

    const liteOutlineCardsHtml = liteLessons
        .map((lesson) => {
            const lessonNumber = String(lesson.id).padStart(2, "0");
            return `
<a class="book-outline-card book-outline-card--lite" href="${lesson.file}">
    <div class="book-outline-meta">Урок ${lessonNumber}${lesson.badgeText ? ` · ${escapeHtml(lesson.badgeText)}` : ""}</div>
    <div class="book-outline-title">${lesson.titleHtml}</div>
    <div class="book-outline-intro">${escapeHtml(lesson.introText)}</div>
</a>`;
        })
        .join("\n");

    const homeBody = `
${heroSection}
${conceptSection}
<section class="book-outline-section" id="toc">
    <div class="concept-header" style="margin-bottom: 1.5rem;">
        <h2>Оглавление</h2>
    </div>
    <div class="track-toggle" id="trackToggle">
        <button class="track-toggle-btn active" data-track="dev">&lt;/&gt; Для разработчиков</button>
        <button class="track-toggle-btn" data-track="lite">💡 Для самых маааленьких!</button>
    </div>
    <div class="book-outline-grid" id="devTrack">
${outlineCardsHtml}
    </div>
    <div class="book-outline-grid" id="liteTrack" style="display:none">
${liteOutlineCardsHtml}
    </div>
</section>
${footerSection}
<script>
(function() {
    var STORAGE_KEY = 'agentbook-track';
    var toggle = document.getElementById('trackToggle');
    var devTrack = document.getElementById('devTrack');
    var liteTrack = document.getElementById('liteTrack');
    if (!toggle || !devTrack || !liteTrack) return;

    function setTrack(track) {
        var btns = toggle.querySelectorAll('.track-toggle-btn');
        btns.forEach(function(btn) {
            btn.classList.toggle('active', btn.getAttribute('data-track') === track);
        });
        devTrack.style.display = track === 'dev' ? '' : 'none';
        liteTrack.style.display = track === 'lite' ? '' : 'none';
        try { localStorage.setItem(STORAGE_KEY, track); } catch(e) {}
    }

    toggle.addEventListener('click', function(e) {
        var btn = e.target.closest('.track-toggle-btn');
        if (btn) setTrack(btn.getAttribute('data-track'));
    });

    try {
        var saved = localStorage.getItem(STORAGE_KEY);
        if (saved === 'lite') setTrack('lite');
    } catch(e) {}
})();
</script>
`;

    const homeHtml = buildDocument({
        sourceHead,
        title: "ИИ-агенты для самых маленьких — Оглавление",
        bodyContent: homeBody,
        scripts: injectDemoPlayers(scriptsHtml),
    });

    fs.writeFileSync(path.join(PUBLIC_DIR, "index.html"), homeHtml, "utf8");

    lessons.forEach((lesson, index) => {
        const lessonNumber = String(lesson.id).padStart(2, "0");
        const prevLesson = index > 0 ? lessons[index - 1] : null;
        const nextLesson = index < lessons.length - 1 ? lessons[index + 1] : null;
        const liteCounterpart = liteLessons[index];

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
        <button class="sidebar-toggle" aria-label="Меню уроков">☰</button>
        <a href="index.html">← Оглавление</a>
        <div class="book-nav-title">Урок ${lessonNumber} из ${String(lessons.length).padStart(2, "0")}</div>
        ${liteCounterpart ? `<a class="lite-crosslink" href="${liteCounterpart.file}">Для самых маленьких</a>` : ''}
        ${nextLesson ? `<a href="${nextLesson.file}">Следующий урок →</a>` : ''}
    </div>
</nav>
<div class="sidebar-backdrop"></div>
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
<script>
(function() {
    const toggle = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.lesson-sidebar');
    const backdrop = document.querySelector('.sidebar-backdrop');
    if (!toggle || !sidebar || !backdrop) return;

    function openSidebar() {
        sidebar.classList.add('open');
        backdrop.classList.add('visible');
    }
    function closeSidebar() {
        sidebar.classList.remove('open');
        backdrop.classList.remove('visible');
    }

    toggle.addEventListener('click', () => {
        sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
    });
    backdrop.addEventListener('click', closeSidebar);
    sidebar.querySelectorAll('.lesson-toc a').forEach(link => {
        link.addEventListener('click', closeSidebar);
    });
})();
</script>
`;

        const lessonHtml = buildDocument({
            sourceHead,
            title: `Урок ${lessonNumber} — ${lesson.titleText}`,
            bodyContent: lessonBody,
            scripts: injectDemoPlayers(scriptsHtml),
        });

        fs.writeFileSync(path.join(PUBLIC_DIR, lesson.file), lessonHtml, "utf8");
    });

    // Generate lite lesson pages
    liteLessons.forEach((lesson, index) => {
        const lessonNumber = String(lesson.id).padStart(2, "0");
        const prevLesson = index > 0 ? liteLessons[index - 1] : null;
        const nextLesson = index < liteLessons.length - 1 ? liteLessons[index + 1] : null;
        const devCounterpart = lessons[index];

        const tocHtml = liteLessons
            .map((entry) => {
                const entryNumber = String(entry.id).padStart(2, "0");
                const classAttr = entry.id === lesson.id ? ' class="current"' : "";
                return `<a${classAttr} href="${entry.file}">${entryNumber}. ${escapeHtml(entry.titleText)}</a>`;
            })
            .join("\n");

        const lessonBody = `
<nav class="book-nav">
    <div class="book-nav-inner">
        <button class="sidebar-toggle" aria-label="Меню уроков">☰</button>
        <a href="index.html">← Оглавление</a>
        <div class="book-nav-title">Урок ${lessonNumber} из ${String(liteLessons.length).padStart(2, "0")} · Lite</div>
        ${devCounterpart ? `<a class="lite-crosslink" href="${devCounterpart.file}">Для разработчиков</a>` : ''}
        ${nextLesson ? `<a href="${nextLesson.file}">Следующий урок →</a>` : ''}
    </div>
</nav>
<div class="sidebar-backdrop"></div>
<div class="lesson-shell lesson-page lesson-page--lite">
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
<script>
(function() {
    const toggle = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.lesson-sidebar');
    const backdrop = document.querySelector('.sidebar-backdrop');
    if (!toggle || !sidebar || !backdrop) return;

    function openSidebar() {
        sidebar.classList.add('open');
        backdrop.classList.add('visible');
    }
    function closeSidebar() {
        sidebar.classList.remove('open');
        backdrop.classList.remove('visible');
    }

    toggle.addEventListener('click', () => {
        sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
    });
    backdrop.addEventListener('click', closeSidebar);
    sidebar.querySelectorAll('.lesson-toc a').forEach(link => {
        link.addEventListener('click', closeSidebar);
    });
})();
</script>
`;

        const lessonHtml = buildDocument({
            sourceHead,
            title: `Урок ${lessonNumber} (Lite) — ${lesson.titleText}`,
            bodyContent: lessonBody,
            scripts: scriptsHtml,
        });

        fs.writeFileSync(path.join(PUBLIC_DIR, lesson.file), lessonHtml, "utf8");
    });

    copyStaticFiles();

    console.log(`Built ${lessons.length + liteLessons.length + 1} pages to ${PUBLIC_DIR}`);
}

build();
