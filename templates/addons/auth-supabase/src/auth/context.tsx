import {
	createContext,
	useContext,
	useEffect,
	useState,
	ReactNode,
} from "react";
import type { SupabaseClient, Session, User } from "@supabase/supabase-js";
import type { AuthApi, AuthSession } from "../../auth-clerk/src/types/auth";

const noop = async () => {};

const defaultApi: AuthApi = {
	session: { user: null, isLoading: false, isAuthenticated: false },
	signIn: noop,
	signOut: noop,
};

const AuthContext = createContext<AuthApi>(defaultApi);

export function AuthProviderWrapper({
	supabase,
	children,
}: {
	supabase: SupabaseClient;
	children: ReactNode;
}) {
	const [isLoading, setIsLoading] = useState(true);
	const [user, setUser] = useState<User | null>(null);

	useEffect(() => {
		let mounted = true;
		async function load() {
			const { data } = await supabase.auth.getUser();
			if (!mounted) return;
			setUser(data.user ?? null);
			setIsLoading(false);
		}
		load();

		const { data: listener } = supabase.auth.onAuthStateChange(
			(_event, session) => {
				setUser(session?.user ?? null);
				setIsLoading(false);
			},
		);

		return () => {
			mounted = false;
			listener.subscription.unsubscribe();
		};
	}, [supabase]);

	const session: AuthSession = {
		user: user
			? {
					id: user.id,
					email: user.email ?? undefined,
					name:
						(user.user_metadata as any)?.full_name ??
						user.email ??
						undefined,
				}
			: null,
		isLoading,
		isAuthenticated: !!user,
	};

	const api: AuthApi = {
		session,
		signIn: async () => {
			// Intentionally noop; use provided UI (magic link / oauth)
		},
		signOut: async () => {
			await supabase.auth.signOut();
		},
	};

	return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	return useContext(AuthContext);
}
