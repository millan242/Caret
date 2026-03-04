#!/usr/bin/env node

import 'dotenv/config'
import { OpenRouter } from "@openrouter/sdk"
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import readline from 'node:readline'
import chalk from 'chalk'
import ora from 'ora'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY

const client = new OpenRouter({
   apiKey: OPENROUTER_API_KEY
});

// Get project context
function getProjectContext(dir = '.') {
   try {
      const files = fs.readdirSync(dir, { withFileTypes: true })
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

8. analyze_code: Analyzes code for bugs, security issues, and improvements
   Input: { "path": "src/App.jsx", "focus": "performance|security|bugs|style|all" }

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
→ create_folder src → create_file package.json → create_file src/App.jsx → install deps → done

User: "analyze my App.jsx for bugs"
→ analyze_code (focus: bugs) → report findings → suggest fixes → done

User: "add error handling to server.js"
→ read_file server.js → update_file with error handling → done

User: "review my code for security issues"
→ analyze_code (focus: security) → list vulnerabilities → provide solutions → done

User: "make a todo component"
→ create_file src/components/Todo.jsx → done`

const tools = {
   create_file: ({ path: filePath, content }) => {
      try {
         const dir = path.dirname(filePath)
         if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true })
         }
         fs.writeFileSync(filePath, content, 'utf8')
         return `✓ Created ${filePath}`
      } catch (error) {
         return `✗ Error: ${error.message}`
      }
   },

   create_folder: ({ path: folderPath }) => {
      try {
         fs.mkdirSync(folderPath, { recursive: true })
         return `✓ Created folder: ${folderPath}`
      } catch (error) {
         return `✗ Error: ${error.message}`
      }
   },

   read_file: ({ path: filePath }) => {
      try {
         const content = fs.readFileSync(filePath, 'utf8')
         return `Content of ${filePath}:\n${content}`
      } catch (error) {
         return `✗ File not found: ${filePath}`
      }
   },

   list_directory: ({ path: dirPath = '.' }) => {
      try {
         const files = fs.readdirSync(dirPath, { withFileTypes: true })
         const formatted = files
            .filter(f => !f.name.startsWith('.') && f.name !== 'node_modules')
            .map(f => f.isDirectory() ? `📁 ${f.name}/` : `📄 ${f.name}`)
            .join('\n')
         return `Contents:\n${formatted || 'Empty'}`
      } catch (error) {
         return `✗ Error: ${error.message}`
      }
   },

   execute_command: ({ command }) => {
      try {
         const output = execSync(command, {
            encoding: 'utf8',
            stdio: 'pipe',
            timeout: 120000
         })
         return `✓ ${command}\n${output.slice(0, 300)}`
      } catch (error) {
         return `✗ Command failed: ${error.message.slice(0, 200)}`
      }
   },

   update_file: ({ path: filePath, search, replace }) => {
      try {
         if (!fs.existsSync(filePath)) {
            return `✗ File not found: ${filePath}`
         }
         let content = fs.readFileSync(filePath, 'utf8')
         const original = content
         content = content.replace(new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replace)

         if (content === original) {
            return `✗ Pattern not found in ${filePath}`
         }

         fs.writeFileSync(filePath, content, 'utf8')
         return `✓ Updated ${filePath}`
      } catch (error) {
         return `✗ Error: ${error.message}`
      }
   },

   delete_file: ({ path: filePath }) => {
      try {
         fs.unlinkSync(filePath)
         return `✓ Deleted ${filePath}`
      } catch (error) {
         return `✗ Error: ${error.message}`
      }
   },

   analyze_code: async ({ path: filePath, focus = 'all' }) => {
      try {
         if (!fs.existsSync(filePath)) {
            return `✗ File not found: ${filePath}`
         }

         const code = fs.readFileSync(filePath, 'utf8')
         const lines = code.split('\n').length
         const ext = path.extname(filePath)

         const analysisPrompts = {
            bugs: 'Analyze this code for potential bugs, logic errors, and edge cases that could cause issues.',
            security: 'Review this code for security vulnerabilities like SQL injection, XSS, exposed secrets, unsafe dependencies, and insecure practices.',
            performance: 'Analyze this code for performance issues like unnecessary re-renders, memory leaks, inefficient algorithms, and optimization opportunities.',
            style: 'Review code style, readability, naming conventions, and suggest improvements for maintainability.',
            all: 'Perform a comprehensive code review covering bugs, security, performance, and code quality. Provide actionable suggestions.'
         }

         const prompt = analysisPrompts[focus] || analysisPrompts.all

         const response = await client.chat.send({
            model: "xiaomi/mimo-v2-flash:free",
            messages: [
               {
                  role: "user",
                  content: `${prompt}\n\nFile: ${filePath} (${lines} lines)\n\nCode:\n\`\`\`${ext.slice(1)}\n${code}\n\`\`\`\n\nProvide a brief analysis with specific issues and suggestions. Format as:\n\nISSUES:\n- Issue 1\n- Issue 2\n\nSUGGESTIONS:\n- Suggestion 1\n- Suggestion 2`
               }
            ]
         })

         const analysis = response.choices[0].message.content
         return `Code Analysis (${focus}):\n${'─'.repeat(50)}\n${analysis}`
      } catch (error) {
         return `✗ Analysis failed: ${error.message}`
      }
   }
}

async function chat() {
   const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: chalk.cyan('> ')
   })

   const currentDir = process.cwd()
   const dirName = path.basename(currentDir)

   // Logo
   console.log(chalk.cyan.bold('\n'))
   console.log(chalk.cyan('   ______                __  '))
   console.log(chalk.cyan('  / ____/___ _________  / /_ '))
   console.log(chalk.cyan(' / /   / __ `/ ___/ _ \\/ __/ '))
   console.log(chalk.cyan('/ /___/ /_/ / /  /  __/ /_   '))
   console.log(chalk.cyan('\\____/\\__,_/_/   \\___/\\__/   '))
   console.log(chalk.gray('                              v1.0.0'))
   console.log()

   console.log(chalk.cyan.bold('╔════════════════════════════════════════════════════╗'))
   console.log(chalk.cyan.bold('║     AI-Powered Coding Assistant Terminal          ║'))
   console.log(chalk.cyan.bold('╚════════════════════════════════════════════════════╝'))

   console.log(chalk.gray(`\n📁 Working directory: ${chalk.white(currentDir)}`))
   console.log(chalk.gray(`📂 Project: ${chalk.white(dirName)}\n`))

   console.log(chalk.yellow.bold('💡 Quick Tips:'))
   console.log(chalk.white('   • Create projects:') + chalk.gray(' "create a react todo app"'))
   console.log(chalk.white('   • Analyze code:') + chalk.gray(' "review App.jsx for security issues"'))
   console.log(chalk.white('   • Add features:') + chalk.gray(' "add authentication to my app"'))
   console.log(chalk.white('   • Fix bugs:') + chalk.gray(' "fix the error in server.js"'))
   console.log(chalk.white('   • Get help:') + chalk.gray(' "explain how React hooks work"'))
   console.log(chalk.white('   • Optimize:') + chalk.gray(' "analyze performance issues in my code"\n'))

   console.log(chalk.gray('Commands: ') + chalk.cyan('/help') + chalk.gray(' • ') + chalk.cyan('/stats') + chalk.gray(' • ') + chalk.cyan('exit\n'))

   const conversationHistory = []
   let totalFiles = 0
   let totalCommands = 0
   let sessionStart = Date.now()

   // Helper function to show help
   function showHelp() {
      console.log(chalk.cyan.bold('\n╔════════════════════════════════════════════════════╗'))
      console.log(chalk.cyan.bold('║                  Available Commands                ║'))
      console.log(chalk.cyan.bold('╚════════════════════════════════════════════════════╝\n'))

      console.log(chalk.yellow('Special Commands:'))
      console.log(chalk.white('  /help') + chalk.gray('   - Show this help message'))
      console.log(chalk.white('  /stats') + chalk.gray('  - Show session statistics'))
      console.log(chalk.white('  exit') + chalk.gray('    - Quit the application\n'))

      console.log(chalk.yellow('AI Capabilities:'))
      console.log(chalk.white('  📝 create_file') + chalk.gray('     - Create new files'))
      console.log(chalk.white('  📁 create_folder') + chalk.gray('   - Create directories'))
      console.log(chalk.white('  👀 read_file') + chalk.gray('       - Read file contents'))
      console.log(chalk.white('  ✏️  update_file') + chalk.gray('     - Modify existing files'))
      console.log(chalk.white('  🗑️  delete_file') + chalk.gray('     - Delete files'))
      console.log(chalk.white('  📋 list_directory') + chalk.gray('  - List directory contents'))
      console.log(chalk.white('  ⚙️  execute_command') + chalk.gray(' - Run shell commands'))
      console.log(chalk.white('  🔍 analyze_code') + chalk.gray('    - AI code review & analysis\n'))

      console.log(chalk.yellow('Example Requests:'))
      console.log(chalk.gray('  • "Create a React component for user authentication"'))
      console.log(chalk.gray('  • "Add error handling to server.js"'))
      console.log(chalk.gray('  • "Review my code for security vulnerabilities"'))
      console.log(chalk.gray('  • "Install express and create a basic server"'))
      console.log(chalk.gray('  • "Explain how to use useState hook"\n'))
   }

   // Helper function to show stats
   function showStats() {
      const sessionDuration = Math.floor((Date.now() - sessionStart) / 1000)
      const minutes = Math.floor(sessionDuration / 60)
      const seconds = sessionDuration % 60

      console.log(chalk.cyan.bold('\n╔════════════════════════════════════════════════════╗'))
      console.log(chalk.cyan.bold('║                Session Statistics                  ║'))
      console.log(chalk.cyan.bold('╚════════════════════════════════════════════════════╝\n'))

      console.log(chalk.white('  📁 Working Directory:') + chalk.gray(` ${currentDir}`))
      console.log(chalk.white('  ⏱️  Session Duration:') + chalk.gray(` ${minutes}m ${seconds}s`))
      console.log(chalk.white('  💬 Conversations:') + chalk.gray(` ${conversationHistory.length / 2}`))
      console.log(chalk.white('  📝 Files Created:') + chalk.gray(` ${totalFiles}`))
      console.log(chalk.white('  ⚙️  Commands Executed:') + chalk.gray(` ${totalCommands}\n`))

      // Show project files count
      try {
         const files = fs.readdirSync(currentDir, { withFileTypes: true })
         const fileCount = files.filter(f => !f.name.startsWith('.') && !f.name.includes('node_modules')).length
         console.log(chalk.white('  📂 Project Files:') + chalk.gray(` ${fileCount} items\n`))
      } catch (error) {
         // Ignore error
      }
   }

   rl.prompt()

   rl.on('line', async (input) => {
      const trimmed = input.trim()

      if (!trimmed) {
         rl.prompt()
         return
      }

      // Handle special commands
      if (trimmed === '/help') {
         showHelp()
         rl.prompt()
         return
      }

      if (trimmed === '/stats') {
         showStats()
         rl.prompt()
         return
      }

      if (trimmed.toLowerCase() === 'exit' || trimmed.toLowerCase() === 'quit') {
         console.log(chalk.green('\n👋 Goodbye!\n'))
         rl.close()
         process.exit(0)
      }

      console.log() // blank line

      const projectContext = getProjectContext('.')

      const messages = [
         { role: "system", content: SYSTEM_PROMPT },
         ...conversationHistory,
         {
            role: "user",
            content: `Current directory: ${currentDir}\n\nProject structure:\n${projectContext}\n\nUser: ${trimmed}`
         }
      ]

      let iterations = 0
      const maxIterations = 20
      let spinner = null

      while (iterations < maxIterations) {
         iterations++

         try {
            spinner = ora({ text: 'Thinking...', color: 'cyan' }).start()

            const response = await client.chat.send({
               model: "xiaomi/mimo-v2-flash:free",
               response_format: { type: 'json_object' },
               messages: messages,
            })

            spinner.stop()

            const content = response.choices[0].message.content
            const agentResponse = JSON.parse(content)

            if (agentResponse.thought) {
               console.log(chalk.gray(`💭 ${agentResponse.thought}`))
            }

            if (agentResponse.action && agentResponse.input) {
               const emoji = {
                  create_file: '📝', create_folder: '📁', execute_command: '⚙️',
                  update_file: '✏️', read_file: '👀', analyze_code: '🔍',
                  list_directory: '📋', delete_file: '🗑️'
               }

               console.log(chalk.blue(`${emoji[agentResponse.action] || '⚡'} ${agentResponse.action}`))

               const toolFunction = tools[agentResponse.action]
               if (toolFunction) {
                  // Track stats
                  if (agentResponse.action === 'create_file') totalFiles++
                  if (agentResponse.action === 'execute_command') totalCommands++

                  // Handle async tools
                  const asyncTools = ['analyze_code']
                  let observation

                  if (asyncTools.includes(agentResponse.action)) {
                     observation = await toolFunction(agentResponse.input)
                  } else {
                     observation = toolFunction(agentResponse.input)
                  }

                  const displayObs = observation.length > 500
                     ? observation.slice(0, 500) + chalk.gray('\n... (truncated)')
                     : observation

                  console.log(chalk.green(displayObs))

                  messages.push({ role: "assistant", content: JSON.stringify(agentResponse) })
                  messages.push({ role: "user", content: `OBSERVE: ${observation}\n\nContinue or finish.` })
               } else {
                  console.log(chalk.red(`✗ Unknown tool: ${agentResponse.action}`))
                  break
               }
            }

            if (agentResponse.done && agentResponse.output) {
               console.log(chalk.white(`\n${agentResponse.output}\n`))

               // Save to conversation history
               conversationHistory.push(
                  { role: "user", content: trimmed },
                  { role: "assistant", content: agentResponse.output }
               )

               break
            }

            if (!agentResponse.action && !agentResponse.done) {
               console.log(chalk.yellow('⚠️  Completed\n'))
               break
            }

         } catch (error) {
            if (spinner) spinner.stop()
            console.error(chalk.red(`❌ Error: ${error.message}\n`))
            break
         }
      }

      rl.prompt()
   })

   rl.on('close', () => {
      console.log(chalk.green('\n👋 Goodbye!\n'))
      process.exit(0)
   })
}

// Start chat mode
chat()