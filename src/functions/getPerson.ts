import { app } from "@azure/functions";
import { handle, type HttpFunc } from "../handlers/http";
import { z } from "zod";

const schema = {
  params: z.object({
    id: z.string(),
  }),
  response: z.object({
    person: z.object({
      id: z.string(),
      name: z.string().max(20),
      age: z.number().min(0).max(150),
      gender: z.union([
        z.literal("male"),
        z.literal("female"),
        z.literal("other"),
      ]),
    }),
  }),
};

const getPerson: HttpFunc<typeof schema.params, any, typeof schema.response> = async (request) => {
  const person = {
    id: request.params.id,
    name: "nahoko",
    age: 31,
    gender: "female" as const,
  };

  return { body: { person } };
};

app.http("getPerson", {
  methods: ["GET"],
  route: "people/{id}",
  authLevel: "anonymous",
  handler: handle(getPerson, schema),
});
