const sortFn = (a, b) =>
  a.metadata.name.toLowerCase().localeCompare(b.metadata.name.toLowerCase())

packs = (() => {
  const list = lang.Task.memo(() =>
    lang.Task.do(function*() {
      postMessage({ id: "progress", result: `Loading datasets` })
      const sets = yield network.request({
        path: `/GLOBAL/datasets`
      })

      postMessage({ id: "progress", result: `Loading views` })
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

  const groups = lang.Task.memo((id, key) =>
    lang.Task.do(function*() {
      postMessage({ id: "progress", result: `Grouping ${key}` })

      const nodes = yield items(id)

      return lang.Task.of(
        Object.entries(
          nodes.reduce((r, node, i) => {
            const val = node.properties[key]
            if (!r[val]) r[val] = indices.create()
            indices.set(r[val], i)

            return r
          }, {})
        ).sort((a, b) => a[0].toLowerCase().localeCompare(b[0].toLowerCase()))
      )
    })
  )

  const properties = lang.Task.memo(id =>
    lang.Task.do(function*() {
      const pack = yield get(id)

      return lang.Task.of(pack.dataset.properties.slice().sort(sortFn))
    })
  )

  const filteredNodes = lang.Task.memo((id, selected) =>
    lang.Task.do(function*() {
      const nodes = yield items(id)
      let mask = nodes.reduce((r, node, i) => {
        indices.set(r, i)
        return r
      }, indices.create())

      for (const key in selected) {
        if (Object.entries(selected[key]).length === 0) continue

        const grps = yield groups(id, key)
        const sum = grps.reduce((r, [name, nodes]) => {
          if (!selected[key][name]) return r

          return indices.union(r, nodes)
        }, undefined)

        if (sum !== undefined) {
          // can this happen?
          mask = indices.intersect(mask, sum)
        }
      }

      return lang.Task.of(mask)
    })
  )

  const buckets = lang.Task.memo((id, key, selected) =>
    lang.Task.do(function*() {
      const grps = yield groups(id, key)
      const mask = yield filteredNodes(id, selected)

      postMessage({ id: "progress", result: `Bucketing ${key}` })
      const result = grps.map(([val, nodes]) => ({
        name: String(val),
        nodes: indices.intersect(mask, nodes),
        selected: selected[key][val]
      }))

      return lang.Task.of(result)
    })
  )

  return {
    buckets,
    filteredNodes,
    items,
    get,
    list,
    properties
  }
})()
