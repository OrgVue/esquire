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

  // Memoize async data selector
  const memo = (f, options) => {
    const o = {
      exclude: [],
      ...options
    }

    const cache = {}

    return (...args) => {
      const hash = JSON.stringify(args.filter((arg, i) => !o.exclude[i]))
      const checksum = JSON.stringify(args)

      if (cache.hasOwnProperty(hash) && cache[hash][0] === checksum) {
        return cache[hash][1]
      }

      throw lang.Task.toPromise(
        f(...args).map(r => {
          cache[hash] = [checksum, r]

          return r
        })
      )
    }
  }

  const UIController = (render, worker) => {
    let state = undefined
    let store = {}

    // Transition to new state and store
    const queue = []
    let lock = false
    const transition = (event, diff) => {
      // disallow re-entrant transitioning, except when there isn't a worker
      if (lock) {
        console.log("queued", event, diff)
        queue.push([event, diff])

        return
      }
      lock = true

      state = event
      if (typeof diff === "function") {
        store = diff(store)
      } else {
        store = {
          ...store,
          ...diff
        }
      }

      render(state)
        .map(() => {
          progress(null)

          lock = false
          if (queue.length) {
            transition(...queue.shift())
          }

          return [] // actions
        })
        .fork(console.log, () => {})
    }

    // Receive message from web worker and invoke relevant handler
    const handlers = {
      progress,
      search: result =>
        ui.transition("pack", store => ({
          ...store,
          searchResult: store.searchResult.concat([result])
        }))
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
