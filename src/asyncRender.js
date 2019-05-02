;(() => {
  // Progress
  const setProgress = message => {
    document.body.style.opacity = !message ? 1 : 0.5
  }

  // Singleton cache for function returning Task
  const once = f => {
    let cache

    return x => {
      if (!cache || cache[0] !== x) {
        return f(x).map(r => {
          cache = [x, r]

          return r
        })
      }

      return cache[1]
    }
  }

  const ASYNC = Symbol("async-dat")
  const AsyncData = (selector, fn) => Component => {
    const gn = once(fn)
    const wrapped = props => (
      <Component {...props} asyncData={wrapped[ASYNC](props)} />
    )
    wrapped[ASYNC] = props => gn(...selector(props))

    return wrapped
  }

  // find Tasks and fork them
  const synchronise = el => {
    const visitor = (element, instance) => {
      if (typeof element.type === "function" && element.type[ASYNC]) {
        const asyncData = element.type[ASYNC](element.props)
        if (Task.is(asyncData)) {
          setProgress("Calculating")
          return Task.toPromise(asyncData).then(() => {
            setProgress(null)
          })
        }
      }
    }

    return reactTreeWalker(el, visitor)
  }

  Object.assign(window, {
    AsyncData,
    synchronise
  })
})()
