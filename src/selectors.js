selectors = (() => {
  const listPacks = () => ui.post("packs", ["list"])

  const getBuckets = (id, key) =>
    lang.Task.do(function*() {
      console.log("start", key)
      const buckets = yield ui.post("packs", ["buckets", id, key])
      console.log("end", key)

      return lang.Task.of(buckets)
    })

  const getFilterData = id =>
    lang.Task.do(function*() {
      const properties = yield ui.post("packs", ["properties", id])

      return lang.Task.of({ properties })
    })

  const getPackData = id =>
    lang.Task.do(function*() {
      const pack = yield ui.post("packs", ["get", id])
      const items = yield ui.post("packs", ["items", id])

      return lang.Task.of({
        items,
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
