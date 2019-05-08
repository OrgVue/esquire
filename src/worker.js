importScripts(
  "../lib/dexie.js",
  "lang.js",
  "indices.js",
  "network.js",
  "packs.js",
  "search.js"
)

const handlers = {}

onmessage = event => {
  const { recipient, id, message } = event.data
  handlers[recipient](message).fork(console.log, result => {
    postMessage({
      id,
      result
    })
  })
}

handlers["packs"] = ([op, ...args]) => packs[op](...args)
handlers["search"] = ([op, ...args]) => search[op](...args)
