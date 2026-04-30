# Minimal React Templates

A collection of minimal and easy-to-use templates to kickstart your next React project. Get up and running in seconds with a clean, lightweight starting point.

## Usage

To create a new project, simply run the following command. You will be asked for the project name and template interactively.

```bash
npx @ohk/react-template
```

### Direct Usage (Optional)

You can also specify the project name and template directly via arguments:

```bash
# Example: Create a project named "my-app"
npx @ohk/react-template my-app
```

## Architecture

This tool uses a **composition-based architecture** rather than shipping multiple static templates.

- **Base Templating:** A foundational setup featuring Vite + React 19 + TypeScript.
- **Add-on Ecosystem:** Selectable additions that inject the exact files and dependencies needed for:
    - Tailwind CSS
    - Shadcn UI
    - Routing (React Router or TanStack Router)
- **Dynamic EJS Processing:** All templates are EJS-based, allowing for dynamic file generation based on user choices.
