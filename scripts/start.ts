import { serve } from "esbuild"

const port = 3000

console.log(`http://localhost:${port}`)

serve({
  servedir: 'dist',
  port,
}, {})