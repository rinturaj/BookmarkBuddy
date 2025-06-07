import Browser from "webextension-polyfill";
import { ACTION } from "./const";
import { mount } from "svelte";
import "tailwindcss/tailwind.css";
import Overlay from "./components/overlay/Overlay.svelte";

mount(Overlay, { target: document.body });
