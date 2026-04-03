export default {
  async fetch(request) {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  },
};