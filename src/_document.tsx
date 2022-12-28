import { HydrationScript } from "solid-js/web"

export interface DocumentProps {
  Page: Function;
}

// context.Page is provided via the `vm` context, see scripts/build.ts
const Document = () => (
  <html>
    <head>
      <title>Index title</title>
      <HydrationScript />
    </head>
    <body>
      <context.Page />
    </body>
    <script src={context.pageClientScriptPath}></script>
  </html>
)
export default Document
