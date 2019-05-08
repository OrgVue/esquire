sc = (() => {
  // Display message of progress
  let timer
  const progress = message => {
    if (timer !== undefined) clearTimeout(timer)

    timer = setTimeout(
      () => {
        document.getElementById("progress").style.display = !message
          ? "none"
          : "flex"
        document.getElementById("progress-message").innerText = message || ""
        document.getElementById("app").style.opacity = !message ? 1 : 0.5
      },
      !message ? 42 : 250
    )
  }

  // Queue async render tasks to ensure sequential execution
  const queue = []
  const dequeue = (res, rej) => {
    if (queue.length === 0) {
      progress(null)
      rej()
      return
    }

    const { hash, f, args, cache } = queue[0]
    f(...args).fork(rej, r => {
      cache[hash] = r
      queue.shift()
      dequeue(res, rej)
    })
  }

  // Queue and cache async selectors
  const memo = f => {
    let cache = {}

    return (...args) => {
      const hash = JSON.stringify(args)
      if (cache.hasOwnProperty(hash)) return cache[hash]

      if (queue.every(item => item.hash !== hash || item.f !== f)) {
        queue.push({ hash, f, args, cache })
      }

      if (queue.length === 1) {
        throw new Promise(dequeue)
      } else {
        throw Promise.resolve()
      }
    }
  }

  const UIController = (render, worker) => {
    let state = undefined
    let store = {}

    // Transition to new state and store
    const transition = (event, diff) => {
      state = event
      if (typeof diff === "function") {
        store = diff(store)
      } else {
        store = {
          ...store,
          ...diff
        }
      }

      render()

      return []
    }

    // Receive message from web worker and invoke relevant handler
    const handlers = {
      progress
    }
    worker.onmessage = event => {
      const { id, result } = event.data
      handlers[id](result)
    }

    // Post message to web worker and wait for response.
    const post = (recipient, message) =>
      lang.Task((rej, res) => {
        const id = Math.random()
        handlers[id] = result => {
          delete handlers[id]
          res(result)
        }
        worker.postMessage({
          recipient,
          id,
          message
        })
      })

    return {
      getState: () => state,
      getStore: () => store,
      post,
      transition
    }
  }

  // Export
  return {
    memo,
    UIController
  }
})()
