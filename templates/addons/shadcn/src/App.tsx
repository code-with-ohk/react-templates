import { Button } from "@/components/ui/button";

function App() {
	return (
		<div className="flex h-screen w-full flex-col items-center justify-center gap-4">
			<h1 className="text-4xl font-bold tracking-tight">Shadcn UI</h1>
			<p className="text-muted-foreground">Work Smart && Hard</p>
			<div className="flex gap-2">
				<Button>Default</Button>
				<Button variant="secondary">Secondary</Button>
				<Button variant="outline">Outline</Button>
				<Button variant="ghost">Ghost</Button>
				<Button variant="destructive">Destructive</Button>
			</div>
		</div>
	);
}

export default App;
