import { expect, suite, test } from "vitest";
import getPerson from "../../src/functions/getPerson";
import { InvocationContext } from "@azure/functions";
import { createHttpFuncRequest } from "../test-utils/httpFunc";

suite("getPerson", () => {
  test("should return a person", async () => {
    const { func, schema } = getPerson;
    const id = "1";
    const request = createHttpFuncRequest(
      {
        params: {
          id,
        },
      },
      schema
    );
    const context = new InvocationContext();
    const response = await func(request, context);

    expect(response.body.person).toEqual({
      id,
      name: "nahoko",
      age: 31,
      gender: "female",
    });
  });
});
