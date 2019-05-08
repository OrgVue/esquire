selectors = (() => {
  const listPacks = sc.memo(() => ui.post("packs", ["list"]))

  const getBuckets = sc.memo(
    (id, key, filter) =>
      lang.Task.do(function*() {
        const buckets = yield ui.post("packs", ["buckets", id, key, filter])

        return lang.Task.of(buckets)
      }),
    { exclude: [1] }
  )

  const getFilterData = sc.memo(
    id =>
      lang.Task.do(function*() {
        const properties = yield ui.post("packs", ["properties", id])

        return lang.Task.of({ properties })
      }),
    { exclude: [1] }
  )

  const getPackData = sc.memo(
    (id, filter) =>
      lang.Task.do(function*() {
        const pack = yield ui.post("packs", ["get", id])
        const nodes = yield ui.post("packs", ["filteredNodes", id, filter])

        return lang.Task.of({
          nodes,
          pack
        })
      }),
    { exclude: [1] }
  )

  // Export
  return {
    getBuckets,
    getFilterData,
    getPackData,
    listPacks
  }
})()
