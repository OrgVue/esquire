selectors = (() => {
  const listPacks = () => ui.post("packs", ["list"])

  const getBuckets = (id, key, selected) =>
    lang.Task.do(function*() {
      const buckets = yield ui.post("packs", ["buckets", id, key, selected])

      return lang.Task.of(buckets)
    })

  const getFilterData = id =>
    lang.Task.do(function*() {
      const properties = yield ui.post("packs", ["properties", id])

      return lang.Task.of({ properties })
    })

  const getPackData = (id, selected) =>
    lang.Task.do(function*() {
      const pack = yield ui.post("packs", ["get", id])
      const nodes = yield ui.post("packs", ["filteredNodes", id, selected])

      return lang.Task.of({
        nodes,
        pack
      })
    })

  return {
    getBuckets,
    getFilterData,
    getPackData,
    listPacks
  }
})()
