lang = (() => {
  const Cache = options => {
    const o = {
      exclude: [],
      ...options
    }

    const cache = {}

    return args => {
      const hash = JSON.stringify(args.filter((arg, i) => !o.exclude[i]))
      const checksum = JSON.stringify(args)

      return {
        has: () => cache.hasOwnProperty(hash) && cache[hash][0] === checksum,
        get: () => cache[hash][1],
        set: r => {
          cache[hash] = [checksum, r]

          return r
        }
      }
    }
  }

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

  Task.fromPromise = p => Task((rej, res) => p.then(res, rej))

  Task.of = x => Task((rej, res) => res(x))

  Task.is = x => x && typeof x.fork === "function"

  Task.memo = (fn, options) => {
    const cache = Cache(options)

    return (...args) =>
      Task((rej, res) => {
        const t = cache(args)
        if (t.has()) {
          return res(t.get())
        }

        fn(...args).fork(rej, r => {
          res(t.set(r))
        })
      })
  }

  Task.toPromise = task =>
    new Promise((res, rej) => {
      task.fork(rej, res)
    })

  const wordCase = s => `${s[0].toUpperCase()}${s.substr(1).toLowerCase()}`

  return {
    Cache,
    Task,
    wordCase
  }
})()
