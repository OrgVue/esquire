;(() => {
  const UIController = render => {
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

    return {
      getState: () => state,
      getStore: () => store,
      transition
    }
  }

  window.sc = {
    UIController
  }
})()
