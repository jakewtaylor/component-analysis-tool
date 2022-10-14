import type { InstanceWithRelations } from "~/models/analysis";

type InstanceJsxRepresentationProps = {
  componentName: string;
  instance: InstanceWithRelations;
};

export const InstanceJsxRepresentation = ({
  componentName,
  instance,
}: InstanceJsxRepresentationProps) => {
  const localComponentName = instance.importInfo?.local ?? componentName;

  return (
    <pre className="whitespace-pre-wrap text-gray-400">
      {`<`}
      <span className="text-blue-400">{localComponentName} </span>
      {instance.props.length > 0 ? (
        <>
          <br />
          {`  // should be ${instance.props.length} props`}
          <br />
          {instance.props.map(
            ({ key, stringValue, intValue, booleanValue }) => {
              const isValueless =
                stringValue === null &&
                intValue === null &&
                booleanValue === null;

              return (
                <span key={key} className="">
                  <span className="text-yellow-500">
                    {"  "}
                    {key}
                    {isValueless ? null : (
                      <>
                        <span className="text-orange-400">=</span>
                        {intValue !== null ? (
                          <>
                            {"{"}
                            <span className="text-purple-400">{intValue}</span>
                            {"}"}
                          </>
                        ) : booleanValue !== null ? (
                          <span>
                            {"{"}
                            <span className="text-purple-400">
                              {booleanValue ? "true" : "false"}
                            </span>
                            {"}"}
                          </span>
                        ) : stringValue !== null &&
                          /^\(\w+\)$/.test(stringValue) ? (
                          <span className="text-slate-400">{stringValue}</span>
                        ) : (
                          <span className="text-green-500">
                            "{stringValue}"
                          </span>
                        )}
                      </>
                    )}
                  </span>
                  <br />
                </span>
              );
            }
          )}
        </>
      ) : null}
      {`/>`}
    </pre>
  );
};
