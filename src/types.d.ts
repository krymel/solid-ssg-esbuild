export * from 'solid-js/web'
import type { JSX } from 'solid-js';
import type { Context } from "../lib/context"

type Component = () => JSX.Element
type RenderFn = (fn: JSX.Element) => any;

declare global {
  var context: Context
  var render: RenderFn
}
