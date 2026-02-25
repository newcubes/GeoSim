# GeoSim – Push to GitHub

This repo is set up to push to **https://github.com/newcubes/GeoSim**.

1. **Create the repo on GitHub** (if you haven’t):  
   Go to [Create a new repository](https://github.com/new?name=GeoSim) and create **GeoSim**. Do not add a README, .gitignore, or license (they’re already here).

2. **Add remote and push** (from this directory):
   ```bash
   git remote add origin https://github.com/newcubes/GeoSim.git
   git branch -M main
   git push -u origin main
   ```

`private/`, `sandboxels-main/`, `web-extension/`, and `node_modules/` are in `.gitignore` and are not pushed.
