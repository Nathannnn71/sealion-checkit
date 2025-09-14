import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { I18nProvider } from "@/lib/i18n";
import "./index.css";

createRoot(document.getElementById("root")!).render(
	<I18nProvider>
		<App />
	</I18nProvider>
);
