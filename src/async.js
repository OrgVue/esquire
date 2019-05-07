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
  const once2 = f => {
    let cache

    return (...args) => {
      const hash = JSON.stringify(args)
      if (cache && cache[0] === hash) return cache[1]

      throw lang.Task.toPromise(f(...args)).then(r => {
        setProgress(null)
        cache = [hash, r]

        return r
      })
    }
  }

  const once = f => {
    let cache = {}

    return (...args) => {
      const hash = JSON.stringify(args)
      if (cache.hasOwnProperty(hash)) return cache[hash]

      throw lang.Task.toPromise(f(...args)).then(r => {
        setProgress(null)
        cache[hash] = r

        return r
      })
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
