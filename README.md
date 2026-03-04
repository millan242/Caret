# 🤖 Caret - Terminal-Based AI Coding Assistant

A powerful CLI tool that brings AI-powered coding assistance directly to your terminal. Build apps, fix bugs, analyze code, and get instant help - all through natural language conversation.

```
   ______                __
  / ____/___ _________  / /_
 / /   / __ `/ ___/ _ \/ __/
/ /___/ /_/ / /  /  __/ /_
\____/\__,_/_/   \___/\__/
```

**Like having Cursor AI, Claude Code, or GitHub Copilot in your terminal!**

---

## ✨ Features

- 🎨 **Natural Language Coding** - Just describe what you want to build
- 📝 **File Management** - Create, read, update, and delete files
- 🔍 **AI Code Review** - Analyze code for bugs, security, and performance
- ⚙️ **Command Execution** - Run npm, git, and other shell commands
- 💬 **Conversational Interface** - Chat-based interaction with context awareness
- 📊 **Session Tracking** - Monitor your productivity with `/stats`
- 🎯 **Project-Aware** - Understands your current directory and project structure

---

## 🚀 Installation

### 1. Clone or Download

```bash
git clone <your-repo-url>
cd caret
```

### 2. Install Dependencies

```bash
npm install dotenv @openrouter/sdk chalk ora
```

### 3. Setup API Key

Create a `.env` file in the project root:

```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

Get your API key from [OpenRouter](https://openrouter.ai/)

### 4. Make Executable & Link Globally

```bash
chmod +x index.js
npm link
```

Now you can use `caret` from anywhere!

---

## 💡 Usage

### Start the Assistant

```bash
# Navigate to your project
mkdir my-app
cd my-app

# Launch Caret
caret
```

### Example Session

```
> create a react todo app with add, delete, and mark complete features

💭 I'll create a React app with Vite and build todo functionality
📁 create_folder
✓ Created folder: src/components
📝 create_file
✓ Created src/App.jsx
📝 create_file
✓ Created src/components/TodoList.jsx
⚙️ execute_command
✓ npm install

Done! Your React todo app is ready. Run: npm install && npm run dev

> add dark mode toggle

💭 Adding dark mode with state management
📝 create_file
✓ Created src/hooks/useDarkMode.js
✏️ update_file
✓ Updated src/App.jsx

Dark mode toggle added! Toggle button is in the header.

> exit
👋 Goodbye!
```

---

## 📋 Commands Reference

### Special Commands

| Command          | Description                                                |
| ---------------- | ---------------------------------------------------------- |
| `/help`          | Show all available commands and examples                   |
| `/stats`         | Display session statistics (files created, duration, etc.) |
| `exit` or `quit` | Close the application                                      |

### AI Capabilities

| Tool                   | What It Does                  | Example                        |
| ---------------------- | ----------------------------- | ------------------------------ |
| 📝 **create_file**     | Create new files with content | "create a user auth component" |
| 📁 **create_folder**   | Create directories            | "make a components folder"     |
| 👀 **read_file**       | Read file contents            | "show me the server.js file"   |
| ✏️ **update_file**     | Modify existing files         | "add error handling to app.js" |
| 🗑️ **delete_file**     | Delete files                  | "remove old-file.js"           |
| 📋 **list_directory**  | List directory contents       | "show me what's in src/"       |
| ⚙️ **execute_command** | Run shell commands            | "install axios and cors"       |
| 🔍 **analyze_code**    | AI code review & analysis     | "review App.jsx for bugs"      |

---

## 🎯 What You Can Do

### 🏗️ Build Complete Applications

```
> create a full-stack blog with React frontend and Express backend
```

Creates entire project structure with:

- React frontend with components
- Express API with routes and controllers
- Database models
- Authentication
- API integration

### 🐛 Fix Bugs & Issues

```
> fix the error in server.js where users can't login
```

AI will:

1. Read the file
2. Identify the issue
3. Apply the fix
4. Explain what was wrong

### 🔒 Security Analysis

```
> analyze my API for security vulnerabilities
```

Checks for:

- SQL injection risks
- XSS vulnerabilities
- Authentication issues
- Exposed secrets
- Insecure dependencies

### ⚡ Performance Optimization

```
> analyze App.jsx for performance issues
```

Identifies:

- Unnecessary re-renders
- Memory leaks
- Inefficient algorithms
- Missing memoization

### 📦 Package Management

```
> install react-router-dom and set up routing for home, about, and contact pages
```

### 🎨 UI/UX Development

```
> add animations and make the site responsive
```

### 📚 Learning & Explanations

```
> explain how React hooks work with examples
> what's the difference between useEffect and useLayoutEffect?
> show me best practices for error handling in Express
```

---

## 🔧 Configuration

### Customize the AI Model

Edit `index.js` and change the model:

```javascript
const response = await client.chat.send({
  model: "xiaomi/mimo-v2-flash:free", // Change this
  response_format: { type: "json_object" },
  messages: messages,
});
```

Available models:

- `xiaomi/mimo-v2-flash:free` (default, fast & free)
- `anthropic/claude-3.5-sonnet` (most capable)
- `openai/gpt-4-turbo` (very capable)
- Check [OpenRouter](https://openrouter.ai/models) for more

### Adjust Max Iterations

Control how many steps the AI can take:

```javascript
const maxIterations = 20; // Increase for complex tasks
```

---

## 📊 Code Analysis Focus Areas

When using `analyze_code`, you can specify focus:

```javascript
> analyze server.js for security issues
> review App.jsx for performance problems
> check index.js for bugs
> analyze all issues in Dashboard.jsx
```

Focus types:

- **bugs** - Logic errors, edge cases, null checks
- **security** - Vulnerabilities, injection risks, exposed secrets
- **performance** - Optimization opportunities, memory leaks
- **style** - Code quality, readability, best practices
- **all** - Comprehensive review (default)

---

## 💻 Example Projects You Can Build

### React Todo App

```
> create a react todo app with local storage persistence
```

### Express REST API

```
> build an express API for a bookstore with CRUD operations
```

### Landing Page

```
> make a modern landing page for a SaaS product with hero, features, and pricing sections
```

### Full-Stack Chat App

```
> create a real-time chat application with React and Socket.io
```

### Portfolio Website

```
> build a developer portfolio with project showcase and contact form
```

---

## 🛠️ Troubleshooting

### API Key Issues

```bash
# Check if .env file exists
ls -la | grep .env

# Verify API key is set
cat .env
```

### Permission Errors

```bash
# Make executable
chmod +x index.js

# If npm link fails, try with sudo
sudo npm link
```

### Module Not Found

```bash
# Reinstall dependencies
npm install

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 🎓 Tips for Best Results

1. **Be Specific** - "Add JWT authentication" is better than "add auth"
2. **Provide Context** - Mention existing files and structure
3. **Break Down Complex Tasks** - Split large features into steps
4. **Review Changes** - Use `/stats` to track what was created
5. **Iterate** - Build incrementally, test, then add more features

---

## 📝 Example Workflows

### Starting a New React Project

```
> create a react app with typescript
> add react-router for navigation
> create a home, about, and contact page
> add a responsive navbar component
> install tailwind and configure it
> make the site look modern with animations
```

### Fixing Production Bugs

```
> read server.js
> the login endpoint returns 500 errors, can you fix it?
> add better error logging
> analyze the code for other potential issues
```

### Code Review Before Deployment

```
> analyze all files in src/ for security issues
> check performance in App.jsx and Dashboard.jsx
> review API routes for error handling
```

---

## 🤝 Contributing

Contributions are welcome! Feel free to:

- Report bugs
- Suggest new features
- Improve documentation
- Add new AI tools

---

## 📄 License

MIT License - feel free to use this in your projects!

---

## 🌟 Credits

Built with:

- [OpenRouter](https://openrouter.ai/) - AI model access
- [Chalk](https://github.com/chalk/chalk) - Terminal styling
- [Ora](https://github.com/sindresorhus/ora) - Loading spinners
- [Commander](https://github.com/tj/commander.js) - CLI framework

---

## 📧 Support

Having issues? Need help?

1. Check `/help` for commands
2. Review this README
3. Open an issue on GitHub

---

**Happy Coding with Caret! 🚀**

Start building amazing things with Caret - your AI coding assistant in the terminal.
