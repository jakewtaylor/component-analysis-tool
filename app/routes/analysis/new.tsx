import type { ActionFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import type { MetaFunction } from "@remix-run/node";
import { Form, useActionData, useTransition } from "@remix-run/react";
import { createAnalysisFromReactScan } from "~/models/analysis";
import type { ReactScan } from "~/types/ReactScanner";
import type { Analysis } from "@prisma/client";

type ActionData = {
  analysis: string;
};

export const meta: MetaFunction = () => {
  return {
    title: "Create New Analysis",
  };
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();

  const analysisJson = formData.get("analysis");

  if (!analysisJson || typeof analysisJson !== "string")
    return json<ActionData>({
      analysis: "You must provide an analysis!",
    });

  let parsedAnalysis: ReactScan;

  try {
    parsedAnalysis = JSON.parse(analysisJson) as ReactScan;
  } catch (err) {
    console.error(err);
    return json<ActionData>({
      analysis: "Couldnt parse input as JSON.",
    });
  }

  let analysis: Analysis;
  try {
    analysis = await createAnalysisFromReactScan(parsedAnalysis);
  } catch (err) {
    console.log(err);
    return json<ActionData>({
      analysis: "Something went wrong, sorry.",
    });
  }

  if (!analysis) {
    return json<ActionData>({
      analysis: "Failed creating analysis. Sorry!",
    });
  }

  console.log(request.headers.get("Accept"));

  if (request.headers.get("Accept") === "application/json") {
    const url = new URL(request.url);
    const analysisUrl = `${url.protocol}//${url.host}/analysis/${analysis.id}`;

    return new Response(JSON.stringify({ analysisUrl }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  return redirect(`/analysis/${analysis.id}`);
};

export default function NewAnalysis() {
  const errors = useActionData<ActionData>();
  const transition = useTransition();

  return (
    <div className="h-full flex items-center justify-center px-4">
      <Form
        method="post"
        action="/analysis/new"
        className="bg-slate-800 p-4 rounded w-full max-w-2xl shadow-md"
      >
        <p className="text-slate-50 text-lg mb-2 leading-none">
          Paste in a component analysis from{" "}
          <span className="font-mono bg-slate-900 inline-block px-1 rounded text-base align-middle">
            react-scanner
          </span>
          :
        </p>

        <div className="mb-4">
          {transition.state === "submitting" ? (
            <div className="h-60 bg-slate-900 rounded flex items-center justify-center">
              <p className="leading-none text-slate-50">
                Loading - this might take a minute.
              </p>
            </div>
          ) : (
            <>
              <textarea
                name="analysis"
                className="block rounded w-full h-60 bg-slate-900 focus:outline outline-2 outline-offset-2 outline-blue-400 font-mono text-slate-50 p-2"
              ></textarea>
              {errors?.analysis ? (
                <p className="text-red-500 leading-none block mt-1">
                  {errors.analysis}
                </p>
              ) : null}
            </>
          )}
        </div>

        <button
          type="submit"
          className="block w-full bg-blue-600 text-center rounded p-2 text-blue-50 font-semibold focus:outline outline-2 outline-offset-2 outline-blue-400 cursor-pointer"
          disabled={transition.state === "submitting"}
        >
          {transition.state === "submitting" ? "Working..." : "Start"}
        </button>
      </Form>
    </div>
  );
}
