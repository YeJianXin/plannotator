/**
 * Plannotator MCP Server for Qoder CLI
 *
 * Provides an MCP server with the following tools:
 *   submit_plan - Submit a plan for visual review
 *   plannotator_review - Review code changes
 *   plannotator_annotate - Annotate a markdown file
 *
 * Environment variables:
 *   PLANNOTATOR_REMOTE - Set to "1" or "true" for remote mode
 *   PLANNOTATOR_PORT   - Fixed port to use
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { existsSync, readFileSync } from "fs";
import path from "path";
import {
  startPlannotatorServer,
  handleServerReady,
} from "@plannotator/server";
import {
  startReviewServer,
  handleReviewServerReady,
} from "@plannotator/server/review";
import {
  startAnnotateServer,
  handleAnnotateServerReady,
} from "@plannotator/server/annotate";
import { getGitContext, runGitDiff } from "@plannotator/server/git";
import { resolveMarkdownFile } from "@plannotator/server/resolve-file";
import { planDenyFeedback } from "@plannotator/shared/feedback-templates";

const DEFAULT_PLAN_TIMEOUT_SECONDS = 345_600;

function isFilePath(value: string): boolean {
  return path.isAbsolute(value) && value.endsWith(".md") && existsSync(value);
}

function resolvePlanContent(plan: string): { content: string; filePath?: string } {
  if (isFilePath(plan)) {
    const content = readFileSync(plan, "utf-8");
    if (!content.trim()) {
      throw new Error(`Plan file at ${plan} is empty. Write your plan content first.`);
    }
    return { content, filePath: plan };
  }
  if (path.isAbsolute(plan) && plan.endsWith(".md")) {
    throw new Error(`File not found: ${plan}. Check the path and try again.`);
  }
  return { content: plan };
}

function getPlanTimeoutSeconds(): number | null {
  const raw = process.env.PLANNOTATOR_PLAN_TIMEOUT_SECONDS?.trim();
  if (!raw) return DEFAULT_PLAN_TIMEOUT_SECONDS;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    console.error(`[Plannotator] Invalid PLANNOTATOR_PLAN_TIMEOUT_SECONDS="${raw}". Using default.`);
    return DEFAULT_PLAN_TIMEOUT_SECONDS;
  }
  if (parsed === 0) return null;
  return parsed;
}

function getSharingEnabled(): boolean {
  return process.env.PLANNOTATOR_SHARE !== "disabled";
}

function getShareBaseUrl(): string | undefined {
  return process.env.PLANNOTATOR_SHARE_URL || undefined;
}

const server = new Server(
  {
    name: "plannotator",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "submit_plan",
        description:
          "Planning tool used to submit a plan to the user for review. Before calling this tool you must conduct interactive and exploratory analysis in order to submit a quality plan. Ask questions. Explore the codebase for context if needed. Only call submit_plan once you have enough details to create a quality plan. Pass either markdown text or an absolute path to a .md file.",
        inputSchema: {
          type: "object",
          properties: {
            plan: {
              type: "string",
              description: "The plan — either markdown text or an absolute path to a .md file on disk.",
            },
          },
          required: ["plan"],
        },
      },
      {
        name: "plannotator_review",
        description:
          "Open a visual code review UI for the current uncommitted changes. The user can annotate code, add comments, and provide feedback. Returns the review feedback after the user completes the review.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "plannotator_annotate",
        description:
          "Open a markdown file in the annotation UI for review. The user can add annotations, comments, and provide feedback. Pass the file path to annotate.",
        inputSchema: {
          type: "object",
          properties: {
            file_path: {
              type: "string",
              description: "Path to the markdown file to annotate (relative or absolute).",
            },
          },
          required: ["file_path"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "submit_plan") {
    const planArg = args?.plan as string;
    if (!planArg) {
      return {
        content: [{ type: "text", text: "Error: plan argument is required." }],
      };
    }

    let planContent: string;
    let sourceFilePath: string | undefined;
    try {
      const resolved = resolvePlanContent(planArg);
      planContent = resolved.content;
      sourceFilePath = resolved.filePath;
    } catch (err) {
      return {
        content: [{ type: "text", text: `Error: ${err instanceof Error ? err.message : String(err)}` }],
      };
    }

    if (!planContent.trim()) {
      return {
        content: [{ type: "text", text: "Error: Plan content is empty. Write your plan first." }],
      };
    }

    const plannotatorServer = await startPlannotatorServer({
      plan: planContent,
      origin: "qoder",
      sharingEnabled: getSharingEnabled(),
      shareBaseUrl: getShareBaseUrl(),
      htmlContent: await getPlanHtml(),
      onReady: handleServerReady,
    });

    const timeoutSeconds = getPlanTimeoutSeconds();
    const timeoutMs = timeoutSeconds === null ? null : timeoutSeconds * 1000;

    const result = timeoutMs === null
      ? await plannotatorServer.waitForDecision()
      : await new Promise<Awaited<ReturnType<typeof plannotatorServer.waitForDecision>>>((resolve) => {
          const timeoutId = setTimeout(
            () =>
              resolve({
                approved: false,
                feedback: `[Plannotator] No response within ${timeoutSeconds} seconds. Please call submit_plan again.`,
              }),
            timeoutMs
          );
          plannotatorServer.waitForDecision().then((r) => {
            clearTimeout(timeoutId);
            resolve(r);
          });
        });

    await Bun.sleep(1500);
    plannotatorServer.stop();

    if (result.approved) {
      const response = result.feedback
        ? `Plan approved with notes!\n${result.savedPath ? `Saved to: ${result.savedPath}` : ""}\n\n## Implementation Notes\n\nThe user approved your plan but added the following notes:\n\n${result.feedback}`
        : `Plan approved!${result.savedPath ? ` Saved to: ${result.savedPath}` : ""}`;
      return { content: [{ type: "text", text: response }] };
    } else {
      return {
        content: [{
          type: "text",
          text: planDenyFeedback(result.feedback || "", "submit_plan", {
            planFilePath: sourceFilePath,
          }) + "\n\nAfter making your revisions, call `submit_plan` again.",
        }],
      };
    }
  }

  if (name === "plannotator_review") {
    const gitContext = await getGitContext();
    const diffResult = await runGitDiff("uncommitted", gitContext.defaultBranch);

    if (!diffResult.patch) {
      return {
        content: [{ type: "text", text: "No uncommitted changes to review." }],
      };
    }

    const reviewServer = await startReviewServer({
      rawPatch: diffResult.patch,
      gitRef: diffResult.label,
      error: diffResult.error,
      origin: "qoder",
      diffType: "uncommitted",
      gitContext,
      sharingEnabled: getSharingEnabled(),
      shareBaseUrl: getShareBaseUrl(),
      htmlContent: await getReviewHtml(),
      onReady: handleReviewServerReady,
    });

    const result = await reviewServer.waitForDecision();
    await Bun.sleep(1500);
    reviewServer.stop();

    if (result.approved) {
      return {
        content: [{ type: "text", text: "Code review completed — no changes requested." }],
      };
    } else {
      return {
        content: [{ type: "text", text: `# Code Review Feedback\n\n${result.feedback}\n\nPlease address this feedback.` }],
      };
    }
  }

  if (name === "plannotator_annotate") {
    const filePath = args?.file_path as string;
    if (!filePath) {
      return {
        content: [{ type: "text", text: "Error: file_path argument is required." }],
      };
    }

    const projectRoot = process.cwd();
    const resolved = await resolveMarkdownFile(filePath, projectRoot);

    if (resolved.kind === "ambiguous") {
      return {
        content: [{
          type: "text",
          text: `Ambiguous filename "${resolved.input}" — found ${resolved.matches.length} matches:\n${resolved.matches.map((m) => `  ${m}`).join("\n")}`,
        }],
      };
    }
    if (resolved.kind === "not_found") {
      return {
        content: [{ type: "text", text: `File not found: ${resolved.input}` }],
      };
    }

    const absolutePath = resolved.path;
    const markdown = await Bun.file(absolutePath).text();

    const annotateServer = await startAnnotateServer({
      markdown,
      filePath: absolutePath,
      origin: "qoder",
      sharingEnabled: getSharingEnabled(),
      shareBaseUrl: getShareBaseUrl(),
      htmlContent: await getPlanHtml(),
      onReady: handleAnnotateServerReady,
    });

    const result = await annotateServer.waitForDecision();
    await Bun.sleep(1500);
    annotateServer.stop();

    return {
      content: [{
        type: "text",
        text: result.feedback || "No feedback provided.",
      }],
    };
  }

  return {
    content: [{ type: "text", text: `Unknown tool: ${name}` }],
  };
});

async function getPlanHtml(): Promise<string> {
  const htmlPath = path.join(import.meta.dir, "plannotator.html");
  return Bun.file(htmlPath).text();
}

async function getReviewHtml(): Promise<string> {
  const htmlPath = path.join(import.meta.dir, "review-editor.html");
  return Bun.file(htmlPath).text();
}

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Plannotator MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
