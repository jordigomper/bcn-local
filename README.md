# BCN Local

Interactive Barcelona map with transport, services, and neighborhood data. The map includes districts and neighborhoods, GTFS-based metro/bus lines and stops, bicing, gas stations, and sports services. Selecting a district or neighborhood filters visible elements and highlights the selection in the legend, and the reset button restores the initial view.

## Run

- Open `index.html` in your browser.

## SEO

El proyecto incluye meta description, Open Graph, Twitter Cards, JSON-LD (WebApplication) y `robots.txt`/`sitemap.xml`. Sustituye `https://bcnlocal.example.com/` en `index.html`, `robots.txt` y `sitemap.xml` por tu URL pública cuando despliegues.

## Cloudflare (Pages)

El archivo `_headers` configura cabeceras HTTP para Cloudflare Pages:

- **Seguridad:** `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`.
- **Caché:** HTML (1 h), JS/CSS y `/js/*` (1 año), `/data/*` (24 h), `robots.txt`/`sitemap.xml` (24 h).

Si usas el subdominio `*.pages.dev` y no quieres que los previews se indexen, añade en `_headers` (sustituye `nombre-proyecto` por el nombre de tu proyecto en Pages):

```
https://nombre-proyecto.pages.dev/*
  X-Robots-Tag: noindex
https://:branch.nombre-proyecto.pages.dev/*
  X-Robots-Tag: noindex
```

En el dashboard de Cloudflare puedes además: activar **Always Use HTTPS**, **Auto Minify** (HTML/CSS/JS), **Brotli** y en **Speed** > **Optimization** las opciones que quieras. Para un dominio propio, configura el canonical en el proyecto y en **Rules** > **Redirect Rules** una regla de redirección HTTP → HTTPS si no está ya.

## Languages

Available in Spanish, Catalan, and English. You can switch languages from the header selector.

## Data

Data is loaded from the `data/` folder.

## License

See `LICENSE`.
