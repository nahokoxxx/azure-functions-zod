import {
  type HttpResponseInit,
  type HttpHandler,
  type HttpRequest,
  type InvocationContext,
} from "@azure/functions";
import { z, type ZodSchema } from "zod";

export type HttpFuncRequest<
  P extends ZodSchema = any,
  B extends ZodSchema = any,
  Q extends ZodSchema = any
> = Omit<HttpRequest, "params" | "query" | "body"> & {
  params: z.infer<P>;
  query: z.infer<Q>;
  body: z.infer<B>;
};

export type HttpFuncResponse<R extends ZodSchema = any> = Omit<
  HttpResponseInit,
  "body"
> & { body: z.infer<R> };

export type HttpFunc<
  P extends ZodSchema = any,
  B extends ZodSchema = any,
  Q extends ZodSchema = any,
  R extends ZodSchema = any
> = (
  request: HttpFuncRequest<P, B, Q>,
  context: InvocationContext
) => Promise<HttpFuncResponse<R>>;

export const handle =
  <
    P extends ZodSchema,
    B extends ZodSchema,
    Q extends ZodSchema,
    R extends ZodSchema
  >(
    func: HttpFunc<P, B, Q, R>,
    schema?: {
      params?: P;
      body?: B;
      query?: Q;
      response?: R;
    }
  ): HttpHandler =>
  async (request, context) => {
    const persedParams = schema?.params?.parse(request.params);
    const parsedBody = schema?.body?.parse(await request.json());
    const parsedQuery = schema?.query?.parse(Object.fromEntries(request.query));

    const result = await func(
      {
        ...request,
        params: persedParams,
        body: parsedBody,
        query: parsedQuery,
      },
      context
    );

    const persedBody = schema?.response
      ? schema.response.parse(result.body)
      : result.body;

    // TODO: handle status code

    return { ...result, body: JSON.stringify(persedBody) };
  };
