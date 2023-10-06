import {
  type HttpResponseInit,
  type HttpHandler,
  type HttpRequest,
  type InvocationContext,
} from "@azure/functions";
import { z, type ZodSchema } from "zod";

export type HttpFuncRequest<B extends ZodSchema, Q extends ZodSchema> = Omit<
  HttpRequest,
  "query" | "body"
> & {
  query: z.infer<Q>;
  body: z.infer<B>;
};

export type HttpFunc<B extends ZodSchema, Q extends ZodSchema> = (
  request: HttpFuncRequest<B, Q>,
  context: InvocationContext
) => Promise<HttpResponseInit>;

export const handle =
  <B extends ZodSchema, Q extends ZodSchema>(
    func: HttpFunc<B, Q>,
    schema?: {
      body?: B;
      query?: Q;
    }
  ): HttpHandler =>
  async (request, context) => {
    const parsedBody = schema?.body?.parse(await request.json());
    const parsedQuery = schema?.query?.parse(Object.fromEntries(request.query));
    const result = await func(
      {
        ...request,
        body: parsedBody,
        query: parsedQuery,
      },
      context
    );
    // TODO: handle result
    return result;
  };
