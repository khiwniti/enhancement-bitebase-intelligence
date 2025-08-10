import {
  CopilotRuntime,
  LangGraphAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { NextRequest } from "next/server";

async function createRuntime() {
  const runtime = new CopilotRuntime({
    remoteActions: [
      process.env.LANGCHAIN_AGENT_URL
        ? { url: `${process.env.LANGCHAIN_AGENT_URL}/analytics-agent` }
        : undefined,
    ].filter(Boolean) as { url: string }[],
  });

  if (process.env.LANGCHAIN_AGENT_URL) {
    const lgAdapter = new LangGraphAdapter({
      chainUrl: process.env.LANGCHAIN_AGENT_URL,
      apiKey: process.env.LANGCHAIN_API_KEY,
    });
    runtime.addAdapter(lgAdapter);
  }

  return runtime;
}

export const POST = async (req: NextRequest) => {
  const runtime = await createRuntime();
  return copilotRuntimeNextJSAppRouterEndpoint({
    endpoint: "/api/copilotkit",
    runtime,
  })(req);
};
