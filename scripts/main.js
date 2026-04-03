import { prompt_message, reply_message } from './output.js'

let messages = [];

/*
export function receive_input(input_text) {
    prompt_message(input_text);
    reply_message(input_text);
    console.log(input_text);
}
*/

export async function receive_input(input_text) {
    messages.push({ role: "user", content: input_text });

    const res = await fetch("https://my-api-proxy.myworker-aichatbot.workers.dev/", {
        method: "POST",
        body: JSON.stringify({ messages })
    });

    const data = await res.json();

    messages.push({ role: "assistant", content: data.reply });

    reply_message(data.reply);
}