import 'dotenv/config'
import { OpenRouter } from "@openrouter/sdk"
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import readline from 'node:readline'
import chalk from 'chalk'
import ora from 'ora'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const client = new OpenRouter({
   apiKey: OPENROUTER_API_KEY
});

const getProjectContext = (dir = '.') => {
   try {
      const files = fs.readdirSync(dir, { withFileTypes: true }) // it returns fs.Dirent objects. This allows the code to check if an item is a file or a folder later using .isDirectory().
      const structure = files
         .filter(f => !f.name.startsWith('.') && f.name !== 'node_modules')
         .map(f => f.isDirectory() ? `📁 ${f.name}/` : `📄 ${f.name}`)
         .join('\n')
      let projectInfo = ''
      if (fs.existsSync(path.join(dir, 'package.json'))) {
         const pkg = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'))
         projectInfo = `\nProject: ${pkg.name || 'unknown'}\nType: ${pkg.type || 'commonjs'}\n`
      }

      return projectInfo + (structure || 'Empty directory')
   } catch (error) {
      return 'Unable to read directory'
   }
}

const SYSTEM_PROMPT = `You are an expert AI coding assistant CLI tool.

You work in the user's current directory and help them build applications, fix bugs, and write code.

AVAILABLE TOOLS:
1. create_file: Creates a file with content
   Input: { "path": "src/App.jsx", "content": "..." }

2. create_folder: Creates a directory
   Input: { "path": "src/components" }

3. read_file: Reads a file (ALWAYS do this before modifying existing files)
   Input: { "path": "package.json" }

4. list_directory: Lists directory contents
   Input: { "path": "src" }

5. execute_command: Runs shell commands (npm install, git init, etc.)
   Input: { "command": "npm install axios" }

6. update_file: Updates existing file content
   Input: { "path": "App.jsx", "search": "old code", "replace": "new code" }

7. delete_file: Deletes a file
   Input: { "path": "old-file.js" }

8. scaffold_project: Creates a complete project structure
   Input: { "type": "react|express|html", "name": "my-app" }

RESPONSE FORMAT (JSON):
{
  "thought": "Brief explanation of what you're doing",
  "action": "tool_name" | null,
  "input": {...} | null,
  "output": "Final message to user" | null,
  "done": true | false
}

GUIDELINES:
- For existing files: ALWAYS read them first, then update
- For new projects: Use scaffold_project, then add features
- For bug fixes: Read file → analyze → fix with update_file
- For new features: Create new files or update existing ones
- Install dependencies when needed
- Be conversational and helpful
- Explain what you're doing
- Ask for clarification if needed

EXAMPLES:

User: "create a react app"
→ scaffold_project → install deps → done

User: "add error handling to server.js"
→ read_file server.js → update_file with error handling → done

User: "make a todo component"
→ create_file src/components/Todo.jsx → done

User: "fix the bug in App.js"
→ read_file App.js → identify issue → update_file → done`

async function init() {
   const response = await client.chat.send({
      model: "xiaomi/mimo-v2-flash:free",
      response_format: { type: 'json_object' },
      messages: [
         {
            role: "user",
            content: "Can you add a file in my folder named main.js"
         }
      ],
   })
   console.log(response.choices[0].message.content)
}
init()