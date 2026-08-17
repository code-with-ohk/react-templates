import { useTranslation } from "react-i18next";

const LANGS = [
	{ code: "en", label: "EN" },
	{ code: "es", label: "ES" },
];

export function LanguageSwitcher() {
	const { i18n } = useTranslation();

	return (
		<div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
			{LANGS.map(({ code, label }) => (
				<button
					key={code}
					type="button"
					onClick={() => i18n.changeLanguage(code)}
					disabled={i18n.resolvedLanguage === code}
					style={{
						cursor: "pointer",
						padding: "4px 12px",
						border: "1px solid #ccc",
						borderRadius: 6,
						background: "transparent",
						opacity: i18n.resolvedLanguage === code ? 0.5 : 1,
					}}>
					{label}
				</button>
			))}
		</div>
	);
}
