import { mount } from "svelte";
import Popup from "../pages/Popup.svelte";

document.body.style.borderRadius = "15px";
document.body.style.overflow = "hidden";
mount(Popup, { target: document.body });
