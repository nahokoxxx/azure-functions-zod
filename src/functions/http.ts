import {
  app,
  type InvocationContext,
  type HttpResponseInit,
} from "@azure/functions";
import { handle, type HttpFuncRequest } from "../handlers/http";
import { z } from "zod";

const schema = {
  body: z.object({
    age: z.number().min(0).max(150),
    gender: z.union([
      z.literal("male"),
      z.literal("female"),
      z.literal("other"),
    ]),
  }),
  query: z.object({
    name: z.string().max(20),
  }),
};

export async function http(
  request: HttpFuncRequest<typeof schema.body, typeof schema.query>,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const { name } = request.query;
  const { age, gender } = request.body;

  context.info("name", name);
  context.info("age", age);
  context.info("name", gender);

  return { body: `${name} Registered!` };
}

app.http("http", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: handle(http, schema),
});
