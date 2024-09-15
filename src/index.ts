import { ResponseBuilder } from "@fermyon/spin-sdk";

async function parseBody(req: Request): Promise<any> {
  const contentType = req.headers.get("Content-Type") || "";
  try {
    if (contentType.includes("application/json")) {
      return await req.json();
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData: any = await req.formData();
      const formDataObj: { [key: string]: any } = {};
      formData.forEach((value: string, key: string) => {
        formDataObj[key] = value;
      });
      return formDataObj;
    } else if (contentType.includes("text/plain")) {
      return await req.text();
    } else {
      return await req.arrayBuffer();
    }
  } catch (error: any) {
    return {
      error: `Unable to parse the body. The request body doe's not match the content-type header value: ${contentType}`,
    };
  }
}

export async function handler(req: Request, res: ResponseBuilder) {
  try {
    let headers: { [key: string]: string } = {};
    req.headers.forEach((v, k) => {
      headers[k] = v;
    });
    const url = new URL(req.url);
    const body = {
      method: req.method,
      url: req.url,
      body: await parseBody(req),
      headers,
      queryParams: Object.fromEntries(url.searchParams.entries()),
    };
    console.log(body);
    res.send(JSON.stringify(body));
  } catch (error: any) {
    res.status(500).send(JSON.stringify({ error: error.message }));
  }
}
