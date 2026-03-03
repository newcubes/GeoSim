# GeoSim — Sand Simulators

Physics sand simulators: upload an image to turn it into materials (gases, liquids, powders, solids), or run the various sand / element simulators.

**Main app:** [Element Simulator v2 – Image Upload](http://localhost:5173/demos/element-simulator-v1-image-v2) (after running locally).

Demos included: element-simulator (v1, clamp, image, image-v2), sand-simulator, sand-simulator-hybrid, sand-simulator-customizable, sandboxels-simulator, and shader demos (falling-sand, distance-field, radiance-cascade, cross-iframe-sand).

## Run locally

```bash
npm install
npm start
```

Then open: **http://localhost:5173/demos/element-simulator-v1-image-v2**

## Deploy on Vercel

1. Push this repo to GitHub (e.g. [newcubes/GeoSim](https://github.com/newcubes/GeoSim)).
2. Go to [vercel.com](https://vercel.com) → **Add New** → **Project** → **Import** your repo.
3. Leave **Root Directory** as `.` (repo root). Build and output are set in `vercel.json`.
4. Click **Deploy**. Your app will be at `https://your-project.vercel.app` and the demo at `https://your-project.vercel.app/demos/element-simulator-v1-image-v2`.

- Use **Resolution** (Low / High / Ultra-high) to change simulation grid density.
- Pick a material from the density-organized list to draw with.
- Use **Load Image** to convert an image into materials; you can pause and play the simulation.

## License

See [LICENSE](LICENSE).
