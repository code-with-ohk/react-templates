import { createContext, useContext, type ReactNode } from "react";
import { useUser, useClerk } from "@clerk/react";
import type { AuthApi, AuthSession } from "../types/auth";

const noop = async () => {};

const defaultApi: AuthApi = {
	session: { user: null, isLoading: false, isAuthenticated: false },
	signIn: noop,
	signOut: noop,
};

const AuthContext = createContext<AuthApi>(defaultApi);

export function AuthProviderWrapper({ children }: { children: ReactNode }) {
	const userHook = useUser() as any;
	const { signOut: clerkSignOut } = useClerk();

	const isLoaded = userHook?.isLoaded ?? true;
	const isSignedIn = userHook?.isSignedIn ?? false;
	const user = userHook?.user ?? null;

	const session: AuthSession = {
		user: user
			? {
					id: user.id,
					email:
						user.primaryEmailAddress?.emailAddress ??
						user.emailAddresses?.[0]?.emailAddress,
					name: user.fullName,
				}
			: null,
		isLoading: !isLoaded,
		isAuthenticated: !!isSignedIn,
	};

	const api: AuthApi = {
		session,
		signIn: async () => {
			// Clerk handles sign-in via <SignIn/> component or redirect; keep noop
		},
		signOut: async () => {
			await clerkSignOut();
		},
	};

	return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	return useContext(AuthContext);
}
