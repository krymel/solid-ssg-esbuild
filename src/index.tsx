import { createSignal } from "solid-js";
import { renderPage } from "../lib/runtime"

const Index = () => {
  const [clickCount, setClickCount] = createSignal(0);

  function handleMouseClick(event: MouseEvent) {
    console.log('clicked', event)
    setClickCount(clickCount() + 1)
  }

  return (
    <>
      <div>index page</div>
      <button onClick={handleMouseClick}>Click me</button>
      <div>Clicked: {clickCount()}</div>
      <script>
        console.log('test1 index')
      </script>
    </>
  )
}
export default renderPage(Index)