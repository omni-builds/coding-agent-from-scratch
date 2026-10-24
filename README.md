# Coding Agent from Scratch

A small AI coding agent for your terminal, written in TypeScript on top of the Claude API. No agent framework: just a chat loop, a few tools, and a permission check. The whole thing is about 250 lines.

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

`ANTHROPIC_MODEL` is optional and overrides the default model. `.env` is git-ignored, so don't commit it.

## Run

```bash
npm start
```

Type a message at the `you>` prompt, and `exit` to quit. Try:

- `what time is it?`
- `read package.json and tell me the project name`
- `create a file called hello.txt that says hi` (the agent asks for approval first)

To check the types, run `npm run typecheck`.

> **Warning:** the agent can write files in the folder you run it from. Use a throwaway folder, and read each approval prompt before you answer `y`.

## How it works

1. **Chat:** `src/index.ts` reads your input, keeps the `history` array (the API is stateless) and streams the reply.
2. **Tools:** the model never runs anything itself. We describe each tool, the model replies with a `tool_use` request, we run it and send back a `tool_result`. This repeats in a loop until the model stops asking.
3. **Permissions:** tools listed in `REQUIRES_APPROVAL` (currently `write_file`) ask `[y/N]` before they run. A denial is sent back to the model as an error result.
4. **Visibility:** every tool call is printed as a `[tool]` line, and the system prompt tells the model it is a coding agent.

## Project structure

| File | Purpose |
|---|---|
| `src/index.ts` | Terminal chat loop, tool loop and approval prompt |
| `src/llm.ts` | `chat()`: one streaming call to the Claude API |
| `src/types.ts` | Shared types |
| `src/constants.ts` | Model, token limit and system prompt |
| `src/tools/constants.ts` | Tool definitions the model sees |
| `src/tools/utils.ts` | Tool implementations, approval check and `runTools` |

Tools: `get_current_time`, `read_file`, `write_file` and `log_text`. File tools only accept paths inside the project folder.

## Following the course

Every step is a tag. Check one out to see the code at that point:

```bash
git checkout stage-2-step-4
git checkout master   # back to the finished version
```

| Stage | Tags |
|---|---|
| 1. Streaming chat | `stage-1` |
| 2. Tools | `stage-2-step-1` to `stage-2-step-6` |
| 3. Writing files, with permissions | `stage-3-step-1`, `stage-3-step-2` |
| 4. System prompt and visible tool calls | `stage-4` |

The model's wording will differ from the videos, and that's fine.

## Known limits

- Approval is per call, with no "always allow".
- `read_file` doesn't ask, so the agent can read any file in the folder, including `.env`.
- The history grows every turn and is never trimmed.

These are left as exercises. Ideas: a deny list for `.env`, `list_files` and `run_command` tools, an `edit_file` tool, a round limit for the tool loop, and Ctrl+C to cancel a reply.
