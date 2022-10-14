import { Link } from "@remix-run/react";
import type { InstanceWithRelations } from "~/models/analysis";
import { InstanceImportRepresentation } from "./InstanceImportRepresentation";
import { InstanceJsxRepresentation } from "./InstanceJsxRepresenation";

type InstanceInspectorProps = {
  componentName: string;
  allInstances: InstanceWithRelations[];
  instanceLimit?: number;
  singleCol?: boolean;
  usingPropFilter?: string;
};

export const InstanceInspector = ({
  componentName,
  allInstances,
  instanceLimit,
  singleCol = false,
  usingPropFilter,
}: InstanceInspectorProps) => {
  const totalInstances = allInstances?.length ?? 0;
  const otherInstances = totalInstances - (instanceLimit ?? 0);

  const instances =
    (instanceLimit ? allInstances?.slice(0, instanceLimit) : allInstances) ??
    [];

  const usingProps = usingPropFilter?.split(",").map((prop) => prop.trim());

  return (
    <div className="bg-slate-800 text-slate-50 p-3 rounded flex flex-col">
      <div className="flex justify-between mb-3">
        <p className="font-mono text-xl font-semibold">{`<${componentName} ${
          usingProps ? usingProps.join(" ") : ""
        } />`}</p>
        <p>{allInstances.length ?? 0} instance(s)</p>
      </div>

      <ol
        className={`grid gap-4 grid-cols-1 mb-4 ${
          singleCol ? "" : "md:grid-cols-2"
        }`}
      >
        {instances.map((instance, index) => {
          const { file, line, column } = instance.location!;
          const location = `${file}@${line}:${column}`;

          return (
            <li key={location} className="flex space-x-2">
              <p className="font-mono text-slate-400 w-5">{index + 1}.</p>
              <div className="flex flex-col w-full">
                <code className="flex flex-col space-y-4 flex-1 bg-slate-900 text-slate-300 rounded p-2 leading-5 whitespace-pre-wrap break-all">
                  <span className="text-slate-400 italic text-xs break-words whitespace-pre-wrap">
                    {"//"} {location}
                  </span>

                  <InstanceImportRepresentation instance={instance} />

                  <InstanceJsxRepresentation
                    componentName={componentName}
                    instance={instance}
                  />
                </code>
              </div>
            </li>
          );
        })}
      </ol>

      {instanceLimit ? (
        <Link
          to={`${componentName}?usingProp=${usingPropFilter ?? ""}`}
          className="mt-auto block bg-blue-600 text-blue-50 text-center rounded p-2"
        >
          Click to see more info{" "}
          {otherInstances ? `& ${otherInstances} other instance(s)` : null}
        </Link>
      ) : null}
    </div>
  );
};
