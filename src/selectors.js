selectors = (() => {
  const listPacks = () => ui.post("packs", ["list"])

  const getPackData = id =>
    lang.Task.do(function*() {
      const pack = yield ui.post("packs", ["get", id])
      const items = yield ui.post("packs", ["items", id])

      return lang.Task.of({
        items,
        pack
      })
    })

  return { getPackData, listPacks }
})()
