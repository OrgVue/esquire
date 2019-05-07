selectors = (() => {
  const listPacks = () => ui.post("packs", ["list"])

  const getBuckets = (id, key, filter) =>
    lang.Task.do(function*() {
      const buckets = yield ui.post("packs", ["buckets", id, key, filter])

      return lang.Task.of(buckets)
    })

  const getFilterData = id =>
    lang.Task.do(function*() {
      const properties = yield ui.post("packs", ["properties", id])

      return lang.Task.of({ properties })
    })

  const getPackData = (id, filter) =>
    lang.Task.do(function*() {
      const pack = yield ui.post("packs", ["get", id])
      const nodes = yield ui.post("packs", ["filteredNodes", id, filter])

      return lang.Task.of({
        nodes,
        pack
      })
    })

  // Export
  return {
    getBuckets,
    getFilterData,
    getPackData,
    listPacks
  }
})()
