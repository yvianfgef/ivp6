export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const targetUrl = url.searchParams.get("url");

    if (!targetUrl) {
      return new Response("Missing 'url' parameter", { status: 400 });
    }

    // 处理 m3u8 文件，替换源地址为 Worker 代理地址
    if (targetUrl.includes(".m3u8")) {
      const m3u8Res = await fetch(targetUrl, {
        headers: request.headers,
        method: request.method,
      });
      
      let m3u8Text = await m3u8Res.text();
      const baseUrl = new URL(targetUrl).origin;
      
      // 替换所有链接为当前 Worker 代理
      m3u8Text = m3u8Text.replace(/(^|\n)(http[^:\n]+)/g, `$1${url.origin}/?url=$2`);
      
      return new Response(m3u8Text, {
        headers: {
          "Content-Type": "application/vnd.apple.mpegurl",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // 直接转发 TS 流文件
    const tsRes = await fetch(targetUrl, {
      headers: request.headers,
      method: request.method,
    });
    
    return new Response(tsRes.body, {
      headers: {
        "Content-Type": "video/MP2T",
        "Access-Control-Allow-Origin": "*",
      },
    });
  },
};
