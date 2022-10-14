import type { ReactScan } from "~/types/ReactScanner";
import { AnalysisFactory } from "~/utils/AnalysisFactory";
import { prisma } from "~/utils/prisma.server";

export const createAnalysisFromReactScan = async (scan: ReactScan) => {
  const factory = new AnalysisFactory(scan);

  return factory.create();
};

type InstanceFilters = {
  componentNames?: string[];
  usingProps?: string[];
};

const getPropValueQuery = ({
  intValue,
  stringValue,
  boolValue,
}: {
  intValue: number | null;
  stringValue: string | null;
  boolValue: boolean | null;
}) => {
  if (intValue !== null) {
    return { intValue: { equals: intValue } };
  }

  if (stringValue !== null) {
    return { stringValue: { equals: stringValue } };
  }

  if (boolValue !== null) {
    return { booleanValue: { equals: boolValue } };
  }

  return {};
};

export const getAnalysis = async (id: number, filters?: InstanceFilters) => {
  const componentNames = filters?.componentNames;
  const usingProps = filters?.usingProps;

  const props = usingProps
    ? usingProps.map((prop) => {
        const [key, rawValue = ""] = prop.split("=");

        const isString = rawValue.startsWith('"') && rawValue.endsWith('"');
        const isIntOrBool = rawValue.startsWith("{") && rawValue.endsWith("}");

        const valueString =
          isString || isIntOrBool ? rawValue.slice(1, -1) : rawValue;

        const intValue =
          isIntOrBool && /[\d.]+/.test(valueString)
            ? parseFloat(valueString)
            : null;

        const boolValue =
          isIntOrBool && /^(true|false)$/.test(valueString)
            ? valueString === "true"
            : null;

        const stringValue = isString ? valueString : null;

        return [key, { intValue, boolValue, stringValue }] as const;
      })
    : [];

  try {
    const model = await prisma.analysis.findFirst({
      where: {
        id,
      },
      include: {
        components: {
          where: {
            componentName: {
              in: componentNames,
            },
          },
          include: {
            instances: {
              where: {
                AND: props.map(([prop, values]) => ({
                  props: {
                    some: {
                      key: { equals: prop },
                      ...getPropValueQuery(values),
                    },
                  },
                })),
              },
              include: {
                importInfo: true,
                location: true,
                props: {
                  orderBy: { key: "asc" },
                },
              },
            },
          },
        },
      },
    });

    return model;
  } catch (err) {
    console.error(err);
    return null;
  }
};

type Resolved<T> = T extends Promise<infer U> ? U : T;
export type AnalysisWithRelations = Exclude<
  Resolved<ReturnType<typeof getAnalysis>>,
  null
>;

export type ComponentWithRelations = AnalysisWithRelations["components"][0];

export type InstanceWithRelations = ComponentWithRelations["instances"][0];
