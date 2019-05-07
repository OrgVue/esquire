async = (() => {
  // Progress
  let timer
  const setProgress = message => {
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

  // queue async render tasks to ensure sequential execution
  const queue = []
  const dequeue = (res, rej) => {
    if (queue.length === 0) {
      setProgress(null)
      rej()
      return
    }

    queue[0].fork(rej, () => {
      queue.shift()
      dequeue(res, rej)
    })
  }

  // queue and cache async selectors
  const memo = f => {
    let cache = {}

    return (...args) => {
      const hash = JSON.stringify(args)
      if (cache.hasOwnProperty(hash)) return cache[hash]

      queue.push(f(...args).map(r => (cache[hash] = r)))

      if (queue.length === 1) {
        throw new Promise(dequeue)
      } else {
        throw Promise.resolve()
      }
    }
  }

  // component with async data
  const ASYNC = Symbol("async-data")
  const Rendered = (selector, fn) => Component => {
    const gn = memo(fn)
    const wrapped = props =>
      React.createElement(Component, {
        ...props,
        asyncData: wrapped[ASYNC](props)
      })
    wrapped[ASYNC] = props => gn(...selector(props))

    return wrapped
  }

  return {
    Rendered,
    setProgress
  }
})()
