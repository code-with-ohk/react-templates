import React from "react";
import { useAuth } from "./context";

export function RequireAuth({ children }: { children: React.ReactNode }) {
	const { session } = useAuth() as any;

	if (session.isLoading) return null;

	if (!session.isAuthenticated) {
		return (
			<div className="flex min-h-[50vh] w-full items-center justify-center px-4 py-10">
				<div className="w-full max-w-md rounded-2xl border border-border bg-background/80 p-6 text-center shadow-sm backdrop-blur">
					<p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
						Access restricted
					</p>
					<h2 className="mt-2 text-2xl font-semibold tracking-tight">
						Please sign in
					</h2>
					<p className="mt-2 text-sm text-muted-foreground">
						You need an active session to view this page.
					</p>
				</div>
			</div>
		);
	}

	return <>{children}</>;
}
