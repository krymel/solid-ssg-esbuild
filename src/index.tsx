import { createSignal } from "solid-js";
import { HydrationScript } from "solid-js/web";
import { renderPage, pageClientScriptPath } from "../lib/runtime"

const Index = () => {
  const [clickCount, setClickCount] = createSignal(0);

  function handleMouseClick(event: MouseEvent) {
    console.log('clicked', event)
    setClickCount(clickCount() + 1)
  }

  return (
    <html>
      <head>
        <title>Index title</title>
        <HydrationScript />
      </head>
      <body>
        <div>index page</div>
        <button onClick={handleMouseClick}>Click me</button>
        <div>Clicked: {clickCount()}</div>
        <script>
          console.log('test1 index')
        </script>
        <script src={pageClientScriptPath}></script>
      </body>
    </html>
  )
}
export default renderPage(Index)