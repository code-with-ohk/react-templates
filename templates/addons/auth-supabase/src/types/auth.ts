export type AuthUser = {
	id: string;
	email?: string;
	name?: string;
	role?: "admin" | "user";
};

export type AuthSession = {
	user: AuthUser | null;
	isLoading: boolean;
	isAuthenticated: boolean;
};

export type AuthApi = {
	session: AuthSession;
	signIn: () => Promise<void>;
	signOut: () => Promise<void>;
};
