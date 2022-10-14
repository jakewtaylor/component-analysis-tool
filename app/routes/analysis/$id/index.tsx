import type { LoaderFunction } from "@remix-run/node";
import type { Prisma } from "@prisma/client";
import { json } from "@remix-run/node";
import type { AnalysisWithRelations } from "~/models/analysis";
import { getAnalysis } from "~/models/analysis";
import {
  Form,
  useLoaderData,
  useParams,
  useTransition,
} from "@remix-run/react";
import { useMemo } from "react";
import { InstanceInspector } from "~/components/InstanceInspector";

type LoaderData = {
  analysis: AnalysisWithRelations;
  filters: {
    componentName: string;
    usingProp: string;
  };
};

export const loader: LoaderFunction = async ({
  params: { id: idString },
  request,
}) => {
  const url = new URL(request.url);
  const componentName = url.searchParams.get("componentName");
  const usingProp = url.searchParams.get("usingProp");

  const id = idString ? parseInt(idString, 10) : null;

  const analysis = id
    ? await getAnalysis(id, {
        componentNames: componentName
          ? componentName
              .split(",")
              .map((term) => term.trim())
              .filter(Boolean)
          : undefined,
        usingProps: usingProp
          ? usingProp
              .split(",")
              .map((term) => term.trim())
              .filter(Boolean)
          : undefined,
      })
    : null;

  if (!analysis) {
    throw new Response("Not Found", {
      status: 404,
    });
  }

  return json<LoaderData>({
    analysis: analysis,
    filters: {
      componentName: componentName ?? "",
      usingProp: usingProp ?? "",
    },
  });
};

const useQuickInfo = (analysis: Prisma.JsonValue) => {
  const componentCount = useMemo(() => {
    if (!analysis) return 0;

    return Object.keys(analysis).length;
  }, [analysis]);

  return { componentCount };
};

export default function ViewAnalysis() {
  const { id } = useParams();
  const transition = useTransition();
  const { analysis, filters } = useLoaderData<LoaderData>();
  const { componentCount } = useQuickInfo(analysis);

  return (
    <div className="text-slate-50">
      <header className="bg-slate-800 w-full p-4 shadow flex justify-between">
        <h1 className="text-xl font-bold">Analysis</h1>

        <p>{componentCount} components</p>
      </header>

      <section className="w-full bg-slate-700 p-4">
        <Form
          method="get"
          action={`/analysis/${id}`}
          className="flex flex-col items-end md:flex-row space-y-4 md:space-y-0 md:space-x-4 flex-wrap"
        >
          <div className="flex-1">
            <label htmlFor="componentName" className="block text-sm mb-2">
              Component Name(s) (comma separated)
            </label>
            <input
              type="text"
              name="componentName"
              className="bg-slate-800 p-2 leading-none rounded focus:outline outline-2 outline-offset-2 outline-blue-400 w-full font-mono"
              placeholder="Filter by component name (use commas to separate)"
              defaultValue={filters.componentName}
              disabled={transition.state === "submitting"}
            />
          </div>

          <div className="flex-1">
            <label htmlFor="usingProp" className="block text-sm mb-2">
              Using Prop(s) (comma separated)
            </label>
            <input
              type="text"
              name="usingProp"
              className="bg-slate-800 p-2 leading-none rounded focus:outline outline-2 outline-offset-2 outline-blue-400 w-full font-mono"
              defaultValue={filters.usingProp}
              disabled={transition.state === "submitting"}
            />
          </div>

          <button type="submit" className="w-0 h-0" />
        </Form>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 flex-wrap items-stretch">
        {transition.state === "submitting" ? (
          <p>Looking up...</p>
        ) : (
          analysis.components.map((component) => (
            <InstanceInspector
              key={component.componentName}
              componentName={component.componentName}
              allInstances={component.instances}
              singleCol
              instanceLimit={
                analysis.components.length === 1
                  ? undefined
                  : filters.componentName
                  ? 3
                  : 1
              }
              usingPropFilter={filters.usingProp}
            />
          ))
        )}
      </div>
    </div>
  );
}
