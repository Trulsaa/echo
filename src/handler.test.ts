import { handler } from "./index";
import { ResponseBuilder } from "@fermyon/spin-sdk";

describe("handler", () => {
  let req: Partial<Request>;
  let res: Partial<ResponseBuilder>;

  beforeEach(() => {
    const headers = new Headers();
    headers.set("Content-Type", "text/plain");
    req = {
      headers,
      url: "http://example.com?param1=value1",
      method: "GET",
      body: new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(new TextEncoder().encode("test body"));
          controller.close();
        },
      }),
      text: jest.fn().mockResolvedValue("test body"),
    };

    res = {
      send: jest.fn(),
    };
  });

  it("should handle a request and send a response", async () => {
    req.headers?.set("origin", "http://example.com");

    await handler(req as Request, res as ResponseBuilder);

    expect(res.send).toHaveBeenCalledWith(
      JSON.stringify({
        method: "GET",
        url: "http://example.com?param1=value1",
        body: "test body",
        headers: { "content-type": "text/plain", origin: "http://example.com" },
        queryParams: { param1: "value1" },
      }),
    );
  });

  it("should handle missing origin header", async () => {
    await handler(req as Request, res as ResponseBuilder);

    expect(res.send).toHaveBeenCalledWith(
      JSON.stringify({
        method: "GET",
        url: "http://example.com?param1=value1",
        body: "test body",
        headers: { "content-type": "text/plain" },
        queryParams: { param1: "value1" },
      }),
    );
  });

  // Add more tests to cover different scenarios
});
