// importScripts("lang.js")

const handlers = {}

onmessage = event => {
  const { recipient, id, message } = event.data
  handlers[recipient](result => {
    postMessage({
      id,
      result
    })
  }, message)
}

// const t = lang.Task

handlers["math"] = (ret, message) => {
  const [op, ...args] = message

  setTimeout(() => {
    ret(args[0] * args[0])
  }, 500)
}
