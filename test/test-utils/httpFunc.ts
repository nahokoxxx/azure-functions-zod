import { HttpRequest, HttpRequestInit } from "@azure/functions";
import {
  type HttpFuncRequest,
  type HttpSchema,
} from "../../src/utils/httpFunc";
import { z, type ZodSchema } from "zod";

export const createHttpFuncRequest = <
  ReqP extends ZodSchema,
  ReqB extends ZodSchema,
  ReqQ extends ZodSchema,
  ResB extends ZodSchema
>(
  {
    params,
    body,
    query,
    url = "https://azure.microsoft.com",
    method = "GET",
  }: {
    params?: z.infer<ReqP>;
    body?: z.infer<ReqB>;
    query?: z.infer<ReqQ>;
  } & Omit<HttpRequestInit, "body" | "query" | "params">,
  _schema: HttpSchema<ReqP, ReqB, ReqQ, ResB>
): HttpFuncRequest<ReqP, ReqB, ReqQ> => {
  const httpRequest = new HttpRequest({ url, method });
  return {
    ...httpRequest,
    params,
    body,
    query,
  };
};
