export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const targetUrl = url.searchParams.get("url");

    if (!targetUrl) {
      return new Response("Missing 'url' parameter", { status: 400 });
    }

    // 处理m3u8文件，替换源地址为Worker代理地址
    if (targetUrl.includes(".m3u8")) {
      const m3u8Res = await fetch(targetUrl, {
        headers: request.headers,
        method: request.method,
      });
      const m3u8Text = await m3u8Res.text();
      
      // 替换ts文件地址为Worker代理
      const baseUrl = new URL(targetUrl).origin;
      const modifiedText = m3u8Text.replace(
        /^(?!#)(?!http)(.+)/g,
        (match) => `${url.origin}${url.pathname}?url=${baseUrl}/${match}`
      );

      return new Response(modifiedText, {
        headers: {
          "Content-Type": "application/vnd.apple.mpegurl",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // 直接转发ts流文件
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
