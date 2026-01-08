import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: App,
});

function App() {
	return (
		<>
			<h1 className="text-3xl font-bold underline">Hello World</h1>
			<p>Work Smart && Hard, !(Hard || Smart)</p>
			go to{" "}
			<a href="/about" className="underline">
				About Page
			</a>
		</>
	);
}
