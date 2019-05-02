;(() => {
  /**
   *
   * @param {*} render
   * @param {Worker} worker
   */
  const UIController = (render, worker) => {
    let state = undefined
    let store = {}

    const transition = (event, diff) => {
      state = event
      store = {
        ...store,
        ...diff
      }

      render(store)

      return []
    }

    const handlers = {}
    worker.onmessage = event => {
      const { id, result } = event.data
      handlers[id](result)
    }

    const post = (recipient, message) =>
      lang.Task((rej, res) => {
        const id = Math.random()
        handlers[id] = result => res(result)
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

  window.sc = {
    UIController
  }
})()
