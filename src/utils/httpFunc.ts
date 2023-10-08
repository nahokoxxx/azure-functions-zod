import {
  app,
  type HttpResponseInit,
  type HttpHandler,
  type HttpRequest,
  type InvocationContext,
  type HttpTriggerOptions,
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

export type HttpSchema<
  ReqP extends ZodSchema,
  ReqB extends ZodSchema,
  ReqQ extends ZodSchema,
  ResB extends ZodSchema
> = {
  req?: {
    params?: ReqP;
    body?: ReqB;
    query?: ReqQ;
  };
  res?: {
    body?: ResB;
  };
};

export type HttpFunc<
  P extends ZodSchema = any,
  B extends ZodSchema = any,
  Q extends ZodSchema = any,
  R extends ZodSchema = any
> = (
  request: HttpFuncRequest<P, B, Q>,
  context: InvocationContext
) => Promise<HttpFuncResponse<R>>;

const execute =
  <
    ReqP extends ZodSchema,
    ReqB extends ZodSchema,
    ReqQ extends ZodSchema,
    ResB extends ZodSchema
  >({
    func,
    schema,
  }: {
    func: HttpFunc<ReqP, ReqB, ReqQ, ResB>;
    schema?: HttpSchema<ReqP, ReqB, ReqQ, ResB>;
  }): HttpHandler =>
  async (request, context) => {
    const parsedReqParams = schema?.req?.params?.parse(request.params);
    const parsedReqBody = schema?.req?.body?.parse(await request.json());
    const parsedReqQuery = schema?.req?.query?.parse(
      Object.fromEntries(request.query)
    );

    const result = await func(
      {
        ...request,
        params: parsedReqParams,
        body: parsedReqBody,
        query: parsedReqQuery,
      },
      context
    );

    const parsedResBody = schema?.res?.body
      ? schema.res.body.parse(result.body)
      : result.body;

    // TODO: handle status code

    return { ...result, body: JSON.stringify(parsedResBody) };
  };

export const defineHttpFunc = <
  ReqP extends ZodSchema,
  ReqB extends ZodSchema,
  ReqQ extends ZodSchema,
  ResB extends ZodSchema
>(
  name: string,
  schema: HttpSchema<ReqP, ReqB, ReqQ, ResB>,
  func: HttpFunc<ReqP, ReqB, ReqQ, ResB>,
  options?: HttpTriggerOptions
) => {
  app.http(name, {
    ...options,
    handler: execute({ schema, func }),
  });

  return {
    schema,
    func,
  };
};
