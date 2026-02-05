#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { book, learningPath, lessons } = require("../site/data/book");

const ROOT_DIR = path.resolve(__dirname, "..");
const TEMPLATE_DIR = path.join(ROOT_DIR, "site", "templates");
const ASSETS_DIR = path.join(ROOT_DIR, "site", "assets");
const PUBLIC_DIR = path.join(ROOT_DIR, "public");

function readTemplate(name) {
    return fs.readFileSync(path.join(TEMPLATE_DIR, name), "utf8");
}

function ensureCleanPublicDir() {
    fs.rmSync(PUBLIC_DIR, { recursive: true, force: true });
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function render(template, data) {
    return template.replace(/\{\{([A-Z0-9_]+)\}\}/g, (_, key) => {
        if (!Object.prototype.hasOwnProperty.call(data, key)) {
            return "";
        }

        return String(data[key]);
    });
}

function lessonFilename(lesson) {
    return `${lesson.slug}.html`;
}

function lessonNumber(id) {
    return String(id).padStart(2, "0");
}

function formatInlineText(value) {
    return escapeHtml(value).replace(/`([^`]+)`/g, "<code>$1</code>");
}

function renderBase({ title, description, content }) {
    const baseTemplate = readTemplate("base.html");
    return render(baseTemplate, {
        PAGE_TITLE: escapeHtml(title),
        PAGE_DESCRIPTION: escapeHtml(description),
        PAGE_CONTENT: content,
        CURRENT_YEAR: String(new Date().getFullYear()),
    });
}

function listToHtml(items) {
    return items.map((item) => `<li>${formatInlineText(item)}</li>`).join("\n");
}

function buildHomePage() {
    const homeTemplate = readTemplate("home.html");

    const outcomesHtml = listToHtml(book.outcomes);

    const learningPathHtml = learningPath
        .map((phase, index) => {
            return `
                <article class="path-card">
                    <h3>Этап ${index + 1}: ${escapeHtml(phase.title)}</h3>
                    <p>${escapeHtml(phase.description)}</p>
                </article>
            `;
        })
        .join("\n");

    const lessonCardsHtml = lessons
        .map((lesson) => {
            return `
                <a class="lesson-card" href="${lessonFilename(lesson)}">
                    <span class="lesson-number">Урок ${lessonNumber(lesson.id)}</span>
                    <h3>${escapeHtml(lesson.title)}</h3>
                    <p>${formatInlineText(lesson.summary)}</p>
                    <div class="meta-inline">
                        <span>${escapeHtml(lesson.level)}</span>
                        <span>${escapeHtml(lesson.duration)}</span>
                    </div>
                </a>
            `;
        })
        .join("\n");

    const homeContent = render(homeTemplate, {
        BOOK_TITLE: escapeHtml(book.title),
        BOOK_DESCRIPTION: escapeHtml(book.description),
        BOOK_AUDIENCE: escapeHtml(book.audience),
        OUTCOMES_LIST: outcomesHtml,
        LEARNING_PATH_BLOCKS: learningPathHtml,
        LESSON_CARDS: lessonCardsHtml,
    });

    return renderBase({
        title: book.title,
        description: book.description,
        content: homeContent,
    });
}

function buildLessonToc(currentLessonId) {
    return lessons
        .map((lesson) => {
            const currentClass = lesson.id === currentLessonId ? " current" : "";
            return `<a class="toc-link${currentClass}" href="${lessonFilename(lesson)}">${lessonNumber(lesson.id)}. ${escapeHtml(lesson.title)}</a>`;
        })
        .join("\n");
}

function buildPagerLink(lesson, label, direction) {
    if (!lesson) {
        return `<span class="pager-link disabled">${escapeHtml(label)}</span>`;
    }

    const arrow = direction === "prev" ? "← " : " →";
    const text = direction === "prev" ? `${arrow}${label}` : `${label}${arrow}`;

    return `<a class="pager-link" href="${lessonFilename(lesson)}">${escapeHtml(text)}</a>`;
}

function buildLessonPage(lesson, index) {
    const template = readTemplate("lesson.html");
    const sourcePath = path.join(ROOT_DIR, lesson.source);

    let lessonCode = "// Файл не найден";
    if (fs.existsSync(sourcePath)) {
        lessonCode = fs.readFileSync(sourcePath, "utf8");
    }

    const prevLesson = index > 0 ? lessons[index - 1] : null;
    const nextLesson = index < lessons.length - 1 ? lessons[index + 1] : null;

    const lessonContent = render(template, {
        LESSON_NUMBER: lessonNumber(lesson.id),
        LESSON_TITLE: escapeHtml(lesson.title),
        LESSON_LEVEL: escapeHtml(lesson.level),
        LESSON_DURATION: escapeHtml(lesson.duration),
        LESSON_SOURCE_PATH: escapeHtml(lesson.source),
        LESSON_SUMMARY: formatInlineText(lesson.summary),
        LESSON_OBJECTIVES: listToHtml(lesson.objectives),
        LESSON_KEY_POINTS: listToHtml(lesson.keyPoints),
        LESSON_CODE: escapeHtml(lessonCode),
        LESSON_TOC: buildLessonToc(lesson.id),
        PREV_LINK: buildPagerLink(prevLesson, "Предыдущий урок", "prev"),
        NEXT_LINK: buildPagerLink(nextLesson, "Следующий урок", "next"),
    });

    return renderBase({
        title: `Урок ${lessonNumber(lesson.id)} · ${lesson.title}`,
        description: lesson.summary,
        content: lessonContent,
    });
}

function copyAssets() {
    fs.cpSync(ASSETS_DIR, path.join(PUBLIC_DIR, "assets"), { recursive: true });

    const cnamePath = path.join(ROOT_DIR, "CNAME");
    if (fs.existsSync(cnamePath)) {
        fs.copyFileSync(cnamePath, path.join(PUBLIC_DIR, "CNAME"));
    }

    fs.writeFileSync(path.join(PUBLIC_DIR, ".nojekyll"), "", "utf8");
}

function build() {
    ensureCleanPublicDir();

    const homePage = buildHomePage();
    fs.writeFileSync(path.join(PUBLIC_DIR, "index.html"), homePage, "utf8");

    lessons.forEach((lesson, index) => {
        const page = buildLessonPage(lesson, index);
        fs.writeFileSync(path.join(PUBLIC_DIR, lessonFilename(lesson)), page, "utf8");
    });

    copyAssets();

    console.log(`Built ${lessons.length + 1} pages to ${PUBLIC_DIR}`);
}

build();
