import type { JSX } from "solid-js/jsx-runtime";
import { isServer } from "solid-js/web";

export const renderPage = (Component: () => unknown): () => JSX.Element => 
    isServer ? Component : require('solid-js/web').hydrate(Component, document)