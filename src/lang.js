lang = (() => {
  // Task e a
  const Task = fork => ({
    fork,
    bind: f => Task((rej, res) => fork(rej, r => f(r).fork(rej, res))),
    map: f => Task((rej, res) => fork(rej, r => res(f(r))))
  })

  Task.do = steps =>
    Task((err, res) => {
      const gen = steps()
      const step = value => {
        const result = gen.next(value)
        if (result.done) {
          return result.value
        }

        return result.value.bind(step)
      }

      return step().fork(err, res)
    })

  Task.of = x => Task((rej, res) => res(x))

  Task.is = x => x && typeof x.fork === "function"

  Task.memo = fn => {
    let cache

    return (...args) =>
      Task((rej, res) => {
        const hash = JSON.stringify(args)
        if (cache && cache[0] === hash) return res(cache[1])

        fn(...args).fork(rej, r => {
          cache = [hash, r]
          res(r)
        })
      })
  }

  Task.toPromise = task =>
    new Promise((res, rej) => {
      task.fork(rej, res)
    })

  return {
    Task
  }
})()
