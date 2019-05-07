const sortFn = (a, b) =>
  a.metadata.name.toLowerCase().localeCompare(b.metadata.name.toLowerCase())

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
          .sort((a, b) => sortFn(a.dataset, b.dataset))
      )
    })
  )

  const get = id =>
    lang.Task.do(function*() {
      const packs = yield list()

      return lang.Task.of(packs.filter(pack => pack.id === id)[0])
    })

  const items = lang.Task.memo(id =>
    lang.Task.do(function*() {
      const pack = yield get(id)

      const reader = yield network.requestStream({
        headers: {
          accept: "application/rvdh",
          "x-accept-encoding": "none"
        },
        path: `/GLOBAL/dataset/${pack.dataset.id}/items`
      })

      const items = yield network.readItems(reader, cnt =>
        postMessage({ id: "progress", result: `${cnt} items` })
      )

      return lang.Task.of(items)
    })
  )

  const properties = lang.Task.memo(id =>
    lang.Task.do(function*() {
      const pack = yield get(id)

      return lang.Task.of(pack.dataset.properties.slice().sort(sortFn))
    })
  )

  const buckets = lang.Task.memo((id, key) =>
    lang.Task.do(function*() {
      return lang.Task.of([{ name: "0-10" }])
    })
  )

  return {
    buckets,
    items,
    get,
    list,
    properties
  }
})()
