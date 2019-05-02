importScripts("lang.js", "packs.js")

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

handlers["math"] = message =>
  lang.Task((rej, res) => {
    const [op, ...args] = message

    setTimeout(() => {
      res(args[0] * args[0])
    }, 500)
  })
