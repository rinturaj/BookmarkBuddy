import { mount } from "svelte";
import Overlay from "./components/overlay/Overlay.svelte";
import appCss from "./app.css?inline";

const root = document.createElement("div");
root.id = "bookmark-buddy";

document.body.append(root);

const rootIntoShadow = document.createElement("div");
rootIntoShadow.id = `shadow-root-bookmark-buddy`;

const shadowRoot = root.attachShadow({ mode: "open" });

if (navigator.userAgent.includes("Firefox")) {
  const styleElement = document.createElement("style");
  styleElement.textContent = appCss;
  shadowRoot.appendChild(styleElement);
} else {
  const styleSheet = new CSSStyleSheet();
  styleSheet.replaceSync(appCss);
  shadowRoot.adoptedStyleSheets = [styleSheet];
}

shadowRoot.appendChild(rootIntoShadow);

mount(Overlay, { target: rootIntoShadow });
