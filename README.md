# Getting Started with Keva Blockchain Web Viewer

This project provides a static web page (serverless) to view the content of Keva blockchain by calling the official ElectrumX server through websocket.
Demo: [https://kevacoin-project.github.io/keva_ws/](https://kevacoin-project.github.io/keva_ws/)

## Development

In the project directory, run once:

```
npm install
```
To server the page in debug mode:

```
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Deployment

Production build:

```
npm run build
```

The output is generated at the `docs` folder and can be published as serverless static Github page.
