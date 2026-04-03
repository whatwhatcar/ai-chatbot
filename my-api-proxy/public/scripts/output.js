const chat_box = document.getElementById("chat-box");

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
    reply.classList.add("reply");
    reply.textContent = input_text;
    chat_box.appendChild(reply);
    scroll_down();
}