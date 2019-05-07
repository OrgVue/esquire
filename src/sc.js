sc = (() => {
  const UIController = (render, worker, progress) => {
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
    UIController
  }
})()
