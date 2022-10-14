import type { Prisma } from "@prisma/client";
import type {
  ReactScan,
  ReactScanComponent,
  ReactScanInstance,
} from "~/types/ReactScanner";
import { determinePrefix } from "./determinePrefix";

const reactScanPropToPrisma = (
  key: string,
  value: string | number | boolean
): Prisma.PropCreateWithoutInstanceInput => {
  const valueKey =
    typeof value === "boolean"
      ? "booleanValue"
      : typeof value === "number"
      ? "intValue"
      : "stringValue";

  return {
    key,
    [valueKey]: value,
  };
};

const reactScanInstanceToPrisma = (
  instance: ReactScanInstance,
  locationPrefix: string
): Omit<Prisma.InstanceCreateInput, "component"> => {
  const completeFile = instance.location.file;
  const file = completeFile.startsWith(locationPrefix)
    ? completeFile.slice(locationPrefix.length)
    : completeFile;

  const prismaInstance: Omit<Prisma.InstanceCreateInput, "component"> = {
    propsSpread: instance.propsSpread,
    location: {
      create: {
        file,
        line: instance.location.start.line,
        column: instance.location.start.column,
      },
    },
    // knownProps: Object.keys(instance.props),
    props: {
      create: Object.entries(instance.props).map(([key, value]) =>
        reactScanPropToPrisma(key, value)
      ),
    },
  };

  if (instance.importInfo) {
    prismaInstance.importInfo = {
      create: {
        imported: instance.importInfo.imported ?? "",
        local: instance.importInfo.local,
        moduleName: instance.importInfo.moduleName,
        importType: instance.importInfo.importType,
      },
    };
  }

  const knownPropsCount = Object.keys(instance.props).length;
  console.log(
    `${knownPropsCount} props, ${
      prismaInstance.importInfo ? "with" : "without"
    } import info`
  );

  return prismaInstance;
};

const reactScanComponentToPrisma = (
  componentName: string,
  component: ReactScanComponent,
  locationPrefix: string
) => {
  const create =
    component.instances?.map((instance) =>
      reactScanInstanceToPrisma(instance, locationPrefix)
    ) ?? [];

  console.log(`Found ${create.length} instances...`);

  return {
    componentName,
    instances: {
      create,
    },
  };
};

export const reactScanToPrisma = (scan: ReactScan) => {
  const entries = Object.entries(scan);

  const locationPrefix = determinePrefix(
    entries.reduce((acc, [, component]) => {
      return [
        ...acc,
        ...(component.instances?.map((instance) => instance.location.file) ??
          []),
      ];
    }, [] as string[])
  );

  const create = entries.map(([componentName, component]) => {
    console.log(`Scanning ${componentName}...`);
    return reactScanComponentToPrisma(componentName, component, locationPrefix);
  });

  return {
    components: {
      create,
    },
  };
};
