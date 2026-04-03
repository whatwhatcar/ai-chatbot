export default {
  async fetch(request, env) {
    const url = "https://api.example.com/data";

    const response = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${env.API_KEY}`
      }
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" }
    });
  }
};