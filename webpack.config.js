const path = require("path")

const backendHost =
  "orgvue-qa.eu-west-1.concentra.io" || "orgvue-dev.concentra.co.uk"

module.exports = {
  // devtool: "nosources-source-map",
  devServer: {
    contentBase: __dirname, //path.join(__dirname, "public"),
    compress: true,
    //disableHostCheck: true,

    // Undocumented webpack-dev-server feature!
    // See https://github.com/webpack/webpack-dev-server/issues/1131
    features: [
      "before",
      "setup",
      "headers",
      "middleware",
      "contentBaseFiles",
      "proxy",
      "magicHtml",
      "contentBaseIndex"
    ],
    port: 8080,

    // proxy taken from ovjs
    proxy: {
      "/": {
        target: `https://${backendHost}`,
        secure: false,
        cookieDomainRewrite: "",
        headers: {
          host: backendHost,
          referer: `https://${backendHost}`
        },
        onProxyRes: proxyRes => {
          delete proxyRes.headers["strict-transport-security"] // remove header from response
          const setCookieHeaders = proxyRes.headers["set-cookie"]
          if (setCookieHeaders instanceof Array) {
            for (let i = 0; i < setCookieHeaders.length; i += 1) {
              setCookieHeaders[i] = setCookieHeaders[i].replace("Secure; ") // remove secure from set-cookie
            }
          }
        }
      }
    }
  },
  entry: "./dummy.js",
  mode: "production"
}
