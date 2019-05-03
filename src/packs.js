packs = (() => {
  const list = lang.Task.memo(() =>
    lang.Task.do(function*() {
      const sets = yield network.request({
        path: `/GLOBAL/datasets`
      })

      const views = yield network.request({
        path: `/GLOBAL/documents`
      })

      const lookup = sets.reduce((r, set) => {
        r[set.id] = set

        return r
      }, {})

      return lang.Task.of(
        views
          .map(view => {
            view.dataset = lookup[view.metadata.dataSetId]

            return view
          })
          .filter(view => view.dataset && view.metadata.name === "_default")
          .sort((a, b) => {
            const aa = a.dataset.metadata.name.toLowerCase()
            const bb = b.dataset.metadata.name.toLowerCase()

            return aa.localeCompare(bb)
          })
      )
    })
  )

  const get = id =>
    lang.Task.do(function*() {
      const packs = yield list()

      return lang.Task.of(packs.filter(pack => pack.id === id)[0])
    })

  return {
    get,
    list
  }
})()
