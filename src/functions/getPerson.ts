import { defineHttpFunc } from "../utils/httpFunc";
import { z } from "zod";

const schema = {
  req: {
    params: z.object({
      id: z.string(),
    }),
  },
  res: {
    body: z.object({
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
  },
};

export default defineHttpFunc(
  "GET",
  "people/{id}",
  schema,
  async (request) => {
    const person = {
      id: request.params.id,
      name: "nahoko",
      age: 31,
      gender: "female" as const,
    };

    return { body: { person } };
  },
  {
    authLevel: "anonymous",
  }
);
