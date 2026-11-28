# Coding Agent from Scratch

A small AI coding agent for your terminal, written in TypeScript on top of the Claude API. No agent framework: a chat loop, tools, a permission check, and four context-engineering layers. One mechanism per layer.

🎬 **Watch the video:** [Build an AI Coding Agent from Scratch in TypeScript (No Framework)](https://youtu.be/eTiCrkRwWHs)

It is the code for a code-along video course. Each step of the course is a tagged commit, so you can build it yourself or jump to any point.

## Requirements

- Node.js 20.6 or newer (needed for the built-in `--env-file` flag)
- An [Anthropic API key](https://console.anthropic.com/) with a few dollars of credit
- Git

## Setup

```bash
git clone https://github.com/omni-builds/coding-agent-from-scratch.git
cd coding-agent-from-scratch
npm install
cp .env.example .env   # on Windows PowerShell: Copy-Item .env.example .env
```

Put your key in `.env`:

```
ANTHROPIC_API_KEY=your-key
```

`ANTHROPIC_MODEL` is optional and overrides the default model. `ANTHROPIC_SUMMARY_MODEL` is optional too, and overrides the smaller model that summarizes old agent notes. `.env` is git-ignored, so don't commit it.

## Run

```bash
npm start
```

Type a message at the `you>` prompt, and `exit` to quit. A plan that would edit files asks for approval before the coder runs. Try:

- `what time is it?`
- `read package.json and tell me the project name`
- `create a file called hello.txt that says hi` (the agent asks for approval first)

To check the types, run `npm run typecheck`.

> **Warning:** the agent can write files in the folder you run it from. Use a throwaway folder, and read each approval prompt before you answer `y`.

## How it works

1. **Chat:** `src/index.ts` reads your input and calls `runSupervisor`. It keeps no message history. What carries over between turns is the shared state.
2. **Shared state:** `src/context/shared-state.ts` keeps the plan and the agent notes. An agent note is a user request or one agent's final summary. Past 8,000 characters, the older agent notes are merged into a summary. The supervisor also sees the findings index.
3. **Isolated agents:** the supervisor, planner, and coder each start with a fresh message list, and only the final text leaves it. Only the supervisor is handed the shared state. The planner and coder get the instruction it writes for them.
4. **Tools:** the model never runs anything itself. It replies with a `tool_use` request, we run it, and send back a `tool_result`.
5. **Round limit:** each agent's tool loop stops after `MAX_TOOL_ROUNDS` rounds (10).
6. **Permissions:** `write_file` asks `[y/N]` before it runs. A plan with unchecked coder tasks also asks before any edit. A denial is sent back as an error result.
7. **Visibility:** each agent run prints an `[agent]` line with a rough count of the tokens it is sent, tool calls print as `[tool]` lines, and a summary of old agent notes prints a `[compact]` line.

## Context engineering

These follow the four layers in [Four layers of context engineering for production AI agents](https://aws.amazon.com/blogs/machine-learning/four-layers-of-context-engineering-for-production-ai-agents-how-deep-insight-applies-them-in-working-code/), adapted to this coding agent.

| Layer | What this branch shows | Where |
| --- | --- | --- |
| Isolate | A specialist starts with an empty message list and returns only its last text. | `src/agents/run-agent.ts` |
| Select | Only the supervisor is handed the shared state. It chooses planner, coder, or respond, and writes the instruction the next agent gets. | `src/agents/supervisor.ts` |
| Write | Each long finding goes to its own file in `.agent/findings/`, with a one-line description in a findings index. The supervisor picks a finding by its description and passes the path. That coder opens just that file with `read_file`. | `save_finding` in `src/context/store.ts` |
| Compress | The coder must return a short status shape, clipped to 6,000 characters before it reaches the shared state. Past 8,000 characters, the older agent notes are merged into a summary by a smaller model. The newest notes and the user's requests stay word for word. | `src/agents/prompts.ts`, `src/agents/supervisor.ts`, `src/context/compact.ts` |

## Project structure

| File                     | Purpose                                                                 |
| ------------------------ | ----------------------------------------------------------------------- |
| `src/index.ts`           | Terminal chat loop and approval prompt                                  |
| `src/agents/`            | Supervisor loop, the agent and summarizer prompts, and decision parsing |
| `src/context/`           | Shared state, note summarizing, and the findings files with their index |
| `src/llm.ts`             | `chat()`: one streaming call, with an optional tool list and model      |
| `src/types.ts`           | Shared types                                                            |
| `src/constants.ts`       | Models, token limit, tool round limit, and base prompt                  |
| `src/tools/`             | Tool definitions and implementations                                    |

Tools: `get_current_time`, `log_text`, `read_file`, `save_finding`, and `write_file`. File tools only accept paths inside the project folder. Findings live in `.agent/findings/`, one file each. The folder is git-ignored and cleared at startup.

## Following the course

Stage 5 continues the original agent course. Check one step out, then return with `git checkout master`.

```bash
git checkout stage-5-step-1
git checkout master
```

| Lesson | Tag | What you add |
| --- | --- | --- |
| 1. See the growing transcript | `stage-5-step-1` | A rough token count of the history sent each turn |
| 2. Isolate | `stage-5-step-2` | One specialist. Its tool transcript is thrown away |
| 3. Remember the answers | `stage-5-step-3` | Earlier requests and final answers go back in |
| 4. Add a planner | `stage-5-step-4` | A second specialist with no tools that writes a plan for the coder |
| 5. Approve the plan | `stage-5-step-5` | A yes/no check before a plan changes files |
| 6. Save the plan and answers | `stage-5-step-6` | The plan and answers move into shared state |
| 7. Select | `stage-5-step-7` | A supervisor that reads the shared state and picks the next agent |
| 8. Write | `stage-5-step-8` | Long findings go to their own files, listed in an index the supervisor reads |
| 9. Compress | `stage-5-step-9` | A required summary shape, a size limit on it, and a summary of old agent notes |

The original agent course is tagged `stage-1` through `stage-4`. These nine steps are stage 5. The README was updated in one commit after `stage-5-step-9`, so the tags show the stage 4 README.

The model's wording will differ from the videos, and that's fine.

## Known limits

- Approval is per call, with no "always allow".
- `read_file` doesn't ask, so the agent can read any file in the folder, including `.env`.
- A long coder tool loop can still fill that specialist's own window. This course summarizes agent notes, not a specialist's own transcript.
- Summarizing loses detail. Older agent notes become a summary of about 200 words. If the summary call fails, those notes are dropped.
- The findings index is only as good as the descriptions the coder writes. A vague one like "stats" won't help the supervisor pick it.
- The round limit counts rounds of the loop, not individual tool calls, and it can't undo files the agent already wrote before it stopped.

These are left as exercises. Ideas: a deny list for `.env`, `list_files` and `run_command` tools, an `edit_file` tool, a `search_findings` tool once the index gets long, and Ctrl+C to cancel a reply.
