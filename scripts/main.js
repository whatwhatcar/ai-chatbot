import { prompt_message, reply_message } from './output.js'

export function receive_input(input_text) {
    prompt_message(input_text);
    reply_message(input_text);
    console.log(input_text);
}