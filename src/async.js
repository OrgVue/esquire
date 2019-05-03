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

  // Singleton cache for function returning Task
  const once = f => {
    let cache

    return x => {
      if (!cache || cache[0] !== x) {
        // setProgress("Calculating")
        throw lang.Task.toPromise(f(x)).then(r => {
          setProgress(null)
          cache = [x, r]

          return r
        })
      }

      return cache[1]
    }
  }

  const ASYNC = Symbol("async-data")
  const Rendered = (selector, fn) => Component => {
    const gn = once(fn)
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
