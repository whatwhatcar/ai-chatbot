import {
    prompt_message,
    reply_message,
    set_chat_busy,
    add_loading_bubble,
    remove_chat_element,
} from "./output.js";

let messages = [];
let request_in_flight = false;

/** Same-origin API (Wrangler / Worker-hosted site only). Never use /api/chat on github.io — it hits Pages, not your Worker → 405. */
function chatApiUrl() {
    const el = document.querySelector('meta[name="api-origin"]');
    const origin = el?.getAttribute("content")?.trim().replace(/\/$/, "") || "";
    if (origin) return `${origin}/api/chat`;

    const h = location.hostname;
    const sameOriginApi =
        h === "localhost" ||
        h === "127.0.0.1" ||
        h.endsWith(".workers.dev");
    if (sameOriginApi) return "/api/chat";

    return null;
}

export async function receive_input(input_text) {
    if (request_in_flight) return;

    request_in_flight = true;
    set_chat_busy(true);

    messages.push({ role: "user", content: input_text });
    prompt_message(input_text);

    const loading_el = add_loading_bubble();

    try {
        const apiUrl = chatApiUrl();
        if (!apiUrl) {
            throw new Error(
                'Missing api-origin. In public/index.html set <meta name="api-origin" content="https://YOUR-worker.workers.dev"> (no trailing slash), commit, push, and wait for GitHub Pages to rebuild.'
            );
        }

        const res = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ messages }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
            const msg = data.error || JSON.stringify(data);
            throw new Error(
                `Chat request failed (${res.status}): ${msg || res.statusText}`
            );
        }

        if (data.error && !data.reply) {
            throw new Error(data.error);
        }

        messages.push({ role: "assistant", content: data.reply });
        reply_message(data.reply);
    } catch (err) {
        reply_message(
            err instanceof Error ? err.message : "Something went wrong."
        );
    } finally {
        remove_chat_element(loading_el);
        set_chat_busy(false);
        request_in_flight = false;
    }
}