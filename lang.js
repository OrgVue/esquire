;(() => {
  // Task e a
  const Task = fork => ({
    fork,
    map: f => Task((rej, res) => fork(rej, r => res(f(r))))
  })
  Task.is = x => x && typeof x.fork === "function"
  Task.toPromise = task =>
    new Promise((res, rej) => {
      task.fork(rej, res)
    })

  Object.assign(window, {
    Task
  })
})()
