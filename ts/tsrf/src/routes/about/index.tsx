import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about/")({
	component: RouteComponent,
});

function RouteComponent() {
	return <h1>About page</h1>;
}
