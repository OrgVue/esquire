async = (() => {
  // Display message of progress
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

  // Queue async render tasks to ensure sequential execution
  const queue = []
  const dequeue = (res, rej) => {
    if (queue.length === 0) {
      setProgress(null)
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

  // Export
  return {
    memo,
    setProgress
  }
})()
