selectors = (() => {
  const listPacks = async.memo(() => ui.post("packs", ["list"]))

  const getBuckets = async.memo((id, key, filter) =>
    lang.Task.do(function*() {
      const buckets = yield ui.post("packs", ["buckets", id, key, filter])

      return lang.Task.of(buckets)
    })
  )

  const getFilterData = async.memo(id =>
    lang.Task.do(function*() {
      const properties = yield ui.post("packs", ["properties", id])

      return lang.Task.of({ properties })
    })
  )

  const getPackData = async.memo((id, filter) =>
    lang.Task.do(function*() {
      const pack = yield ui.post("packs", ["get", id])
      const nodes = yield ui.post("packs", ["filteredNodes", id, filter])

      return lang.Task.of({
        nodes,
        pack
      })
    })
  )

  // Export
  return {
    getBuckets,
    getFilterData,
    getPackData,
    listPacks
  }
})()
