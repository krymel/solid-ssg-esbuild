import type { JSX } from "solid-js/jsx-runtime";
import { isServer } from "solid-js/web";

export const renderPage = (Component: () => JSX.Element): (() => JSX.Element) | Promise<() => void> => 
    isServer ? Component : import('solid-js/web').then((mod) => mod.hydrate(Component, document))