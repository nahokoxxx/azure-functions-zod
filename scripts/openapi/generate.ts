import { generateSchema } from "@anatine/zod-openapi";
import util from "util";
import { glob } from "glob";
import path from "path";
import fs from "fs";
import { type HttpSchema } from "../../src/utils/httpFunc";
import {
  OpenApiBuilder,
  RequestBodyObject,
  type ParameterObject,
} from "openapi3-ts/oas31";
import { type HttpMethod } from "@azure/functions";

main();

async function main() {
  const routes = await load();
  const generated = generate(routes);

  fs.writeFileSync("openapi.json", JSON.stringify(generated, null, 2));

  console.info(
    formatTxt(
      "\n✨ openapi.json successfully generated ✨",
      util.inspect.colors.cyan
    )
  );
}

async function load() {
  const paths = await glob("src/functions/*.ts");
  return paths.map((p) => require(path.resolve(p)).default);
}

function generate(
  routes: {
    method: HttpMethod;
    route: string;
    schema: HttpSchema<any, any, any, any>;
  }[]
) {
  const paths = routes.map(({ method, route, schema }) => {
    const { res, req } = schema;

    const parameters: ParameterObject[] = [];
    if (req?.params) {
      parameters.push({
        name: "params",
        in: "path",
        required: true,
        schema: generateSchema(req.params),
      });
    }
    if (req?.query) {
      parameters.push({
        name: "query",
        in: "query",
        required: true,
        schema: generateSchema(req.query),
      });
    }

    let requestBody: RequestBodyObject | undefined = undefined;
    if (req?.body) {
      requestBody = {
        content: {
          "application/json": {
            schema: generateSchema(req.body),
          },
        },
      };
    }

    return [
      `/${route}`,
      {
        [method.toLowerCase()]: {
          parameters,
          requestBody,
          responses: {
            200: {
              description: "Success",
              content: res?.body
                ? {
                    "application/json": {
                      schema: generateSchema(res.body),
                    },
                  }
                : undefined,
            },
          },
        },
      },
    ];
  });

  const builder = OpenApiBuilder.create({
    openapi: "3.1.0",
    info: {
      title: "azure-functions-zod",
      version: "0.0.1",
    },
    paths: Object.fromEntries(paths),
  });

  return builder.getSpec();
}

function formatTxt(text: string, format?: [number, number]) {
  if (!format) {
    return text;
  }
  return `\u001b[${format[0]}m${text}\u001b[${format[1]}m`;
}
