import { app } from "@azure/functions";
import { defineHttpFunc, handle } from "../handlers/http";
import { z } from "zod";

const schema = {
  req: {
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
  },
};

const createPerson = defineHttpFunc(schema, async (request, context) => {
  const { name } = request.query;
  const { age, gender } = request.body;

  context.info("name", name);
  context.info("age", age);
  context.info("name", gender);

  return { body: `${name} Registered!` };
});

app.http("createPerson", {
  methods: ["POST"],
  route: "people",
  authLevel: "anonymous",
  handler: handle(createPerson),
});