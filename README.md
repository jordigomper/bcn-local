# BCN Local

Interactive Barcelona map with transport, services, and neighborhood data. The map includes districts and neighborhoods, GTFS-based metro/bus lines and stops, bicing, gas stations, and sports services. Selecting a district or neighborhood filters visible elements and highlights the selection in the legend, and the reset button restores the initial view.

## Run

The app loads data with `fetch()`, so use a local web server (opening `index.html` with `file://` may block those requests). Options:

- **VS Code**: install the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension, then right‑click `index.html` → “Open with Live Server”.
- **Python**: from the project root run `python3 -m http.server 8000`, then open http://localhost:8000 in your browser.
- **Node**: run `npx serve` in the project root, then open the URL shown in the terminal.

## Languages

Available in Spanish, Catalan, and English. You can switch languages from the header selector.

## Data

Data is loaded from the `data/` folder.

## License

See `LICENSE`.
