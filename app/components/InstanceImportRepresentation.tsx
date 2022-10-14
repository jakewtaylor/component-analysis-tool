import type { InstanceWithRelations } from "~/models/analysis";

type InstanceImportRepresentationProps = {
  instance: InstanceWithRelations;
};

export const InstanceImportRepresentation = ({
  instance,
}: InstanceImportRepresentationProps) => {
  if (!instance.importInfo) return null;

  const { imported, local, moduleName, importType } = instance.importInfo;

  return (
    <span className="text-gray-400">
      import{" "}
      {importType === "ImportDefaultSpecifier" ? (
        <span className="text-yellow-500">{local}</span>
      ) : (
        <>
          {"{"}{" "}
          {imported === local ? (
            <span className="text-yellow-500">{imported}</span>
          ) : (
            <>
              <span className="text-yellow-500">{imported}</span> as{" "}
              <span className="text-yellow-500">{local}</span>
            </>
          )}{" "}
          {"}"}
        </>
      )}{" "}
      from '{moduleName}';
    </span>
  );
};
