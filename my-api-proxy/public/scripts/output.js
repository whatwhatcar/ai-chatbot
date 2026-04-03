import { marked } from "https://esm.sh/marked@14.1.0";
import DOMPurify from "https://esm.sh/dompurify@3.1.6";

const chat_box = document.getElementById("chat-box");

/**
 * Models often emit "1. **A** ... 2. **B**" in one paragraph. Markdown needs line breaks
 * between items. Also fix leftover **pairs** marked sometimes leaves as literal text.
 */
function normalizeAssistantMarkdown(text) {
    let t = text.trim();
    // After sentence end or colon, start a new block before "N. "
    t = t.replace(/([.!?:])\s+(\d+)\.\s+/g, "$1\n\n$2. ");
    // "word 2. **" — only for 2+ so we don't break "step 1. **"
    t = t.replace(/([a-zA-Z])\s+(\d+)\.\s+(\*\*)/g, (full, letter, n, stars) => {
        const num = parseInt(n, 10);
        if (num < 2) return full;
        return `${letter}\n\n${n}. ${stars}`;
    });
    // Run-on "… 2. **" / "… 10. **" — only split for item 2+ (avoid breaking "step 1. **")
    t = t.replace(/([^\n])(\d+)\.\s+(\*\*)/g, (full, prev, n, stars) => {
        const num = parseInt(n, 10);
        if (num < 2) return full;
        return `${prev}\n\n${n}. ${stars}`;
    });
    t = t.replace(/\n{3,}/g, "\n\n");
    return t;
}

function renderAssistantHtml(markdown) {
    let html = marked.parse(markdown, { breaks: true, gfm: true });
    // Any **still** left as plain text → bold (apostrophes / % in names can confuse the parser)
    html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    return DOMPurify.sanitize(html);
}

function scroll_down() {
    chat_box.scrollTo({
        top: chat_box.scrollHeight,
        behavior: "smooth"
    });
}

export function set_chat_busy(busy) {
    const input = document.getElementById("input-field");
    const btn = document.getElementById("send-button");
    if (input) {
        input.disabled = busy;
        input.setAttribute("aria-busy", busy ? "true" : "false");
    }
    if (btn) btn.disabled = busy;
}

export function add_loading_bubble() {
    const el = document.createElement("div");
    el.classList.add("reply", "loading-bubble");
    el.setAttribute("role", "status");
    el.setAttribute("aria-label", "Assistant is typing");
    el.innerHTML =
        '<span class="loading-dot"></span><span class="loading-dot"></span><span class="loading-dot"></span>';
    chat_box.appendChild(el);
    scroll_down();
    return el;
}

export function remove_chat_element(el) {
    el?.remove();
}

export function prompt_message(input_text) {
    const prompt = document.createElement("div");
    prompt.classList.add("prompt");
    prompt.textContent = input_text;
    chat_box.appendChild(prompt);
    scroll_down();
}

export function reply_message(input_text) {
    const reply = document.createElement("div");
    reply.classList.add("reply", "reply-markdown");
    const normalized = normalizeAssistantMarkdown(input_text);
    reply.innerHTML = renderAssistantHtml(normalized);
    chat_box.appendChild(reply);
    scroll_down();
}
