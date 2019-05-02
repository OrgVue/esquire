packs = (() => {
  const list = () =>
    lang.Task((rej, res) => {
      setTimeout(() => {
        res([{ name: "1505 demo" }, { name: "users" }])
      }, 2000)
    })

  const get = name =>
    lang.Task((rej, res) => {
      setTimeout(() => {
        res({ name, modified: new Date() })
      }, 1000)
    })
  return {
    get,
    list
  }
})()
