import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { createAnalysisFromReactScan } from "~/models/analysis";
import type { ReactScan } from "~/types/ReactScanner";
import type { Analysis } from "@prisma/client";

type ActionData = {
  analysis: string;
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

  const url = new URL(request.url);
  const analysisUrl = `${url.protocol}//${url.host}/analysis/${analysis.id}`;

  return new Response(JSON.stringify({ analysisUrl }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
