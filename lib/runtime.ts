import type { JSX } from "solid-js/jsx-runtime";
import { isServer } from "solid-js/web";

export const renderPage = (Component: () => JSX.Element): () => JSX.Element => 
    isServer ? Component : require('solid-js/web').hydrate(Component as any, document.body)