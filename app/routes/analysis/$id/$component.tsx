import { useEffect, useRef, useState } from "react";
import type { LoaderFunction } from "@remix-run/node";
import type { ComponentWithRelations } from "~/models/analysis";
import { getAnalysis } from "~/models/analysis";
import { json } from "@remix-run/node";
import { InstanceInspector } from "~/components/InstanceInspector";
import { Form, useLoaderData, useTransition } from "@remix-run/react";

type LoaderData = {
  id: number;
  filters: {
    usingProp?: string;
  };
  component: ComponentWithRelations;
};

const notFound = () => new Response("Not Found", { status: 404 });

export const loader: LoaderFunction = async ({
  params: { id: idString, component: componentName },
  request,
}) => {
  if (!idString || !componentName) throw notFound();

  const id = parseInt(idString, 10);

  const url = new URL(request.url);
  const usingProp = url.searchParams.get("usingProp");

  const analysis = await getAnalysis(id, {
    componentNames: [componentName],
    usingProps: usingProp
      ?.split(",")
      .map((term) => term.trim())
      .filter(Boolean),
  });

  const component = analysis?.components.find(
    (comp) => comp.componentName === componentName
  );

  if (!component) throw notFound();

  return json<LoaderData>({
    id,
    component,
    filters: { usingProp: usingProp ?? undefined },
  });
};

export default function ViewComponent() {
  const { id, component, filters } = useLoaderData<LoaderData>();
  const transition = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const [hasFocused, setHasFocused] = useState(false);

  useEffect(() => {
    if (transition.state === "idle" && hasFocused) {
      inputRef.current?.focus();
    }
  }, [transition.state, hasFocused]);

  return (
    <div className="text-slate-50">
      <section className="w-full bg-slate-700 p-4">
        <Form
          method="get"
          action={`/analysis/${id}/${component.componentName}`}
          className="flex flex-col items-end md:flex-row space-y-4 md:space-y-0 md:space-x-4 flex-wrap"
        >
          <div className="flex-1">
            <label htmlFor="usingProp" className="block text-sm mb-2">
              Using Prop(s) (comma separated)
            </label>
            <input
              ref={inputRef}
              type="text"
              name="usingProp"
              className="bg-slate-800 p-2 leading-none rounded focus:outline outline-2 outline-offset-2 outline-blue-400 w-full font-mono"
              defaultValue={filters.usingProp}
              disabled={transition.state === "submitting"}
              onFocus={() => setHasFocused(true)}
            />
          </div>

          <button type="submit" className="w-0 h-0" />
        </Form>
      </section>

      <InstanceInspector
        componentName={component.componentName}
        allInstances={component.instances}
        usingPropFilter={filters.usingProp}
      />
    </div>
  );
}
