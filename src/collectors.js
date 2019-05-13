collectors = (() => {
  const listPacks = sc.memo(go => ui.post("packs", ["list", go]))

  const getPack = sc.memo((go, id) => ui.post("packs", ["get", go, id]))

  const getBuckets = sc.memo(
    (go, id, revision, key, filter) =>
      lang.Task.do(function*() {
        const buckets = yield ui.post("packs", [
          "buckets",
          go,
          id,
          revision,
          key,
          filter
        ])

        return lang.Task.of(buckets)
      }),
    { exclude: [1] }
  )

  const getFilterData = sc.memo(
    (go, id) =>
      lang.Task.do(function*() {
        const properties = yield ui.post("packs", ["properties", go, id])

        return lang.Task.of({ properties })
      }),
    { exclude: [1] }
  )

  const getGridData = sc.memo(
    (go, id, revision, filter) =>
      lang.Task.do(function*() {
        const nodes = yield ui.post("packs", [
          "getPartialNodes",
          go,
          id,
          revision,
          filter
        ])

        return lang.Task.of({ nodes })
      }),
    { exclude: [1] }
  )

  const getPackData = sc.memo(
    (go, id, revision, filter) =>
      lang.Task.do(function*() {
        const pack = yield ui.post("packs", ["get", go, id])
        const nodes = yield ui.post("packs", [
          "filteredNodes",
          go,
          id,
          revision,
          filter
        ])

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
    getGridData,
    getPack,
    getPackData,
    listPacks
  }
})()
