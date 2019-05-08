search = (() => {
  const start = (id, s) =>
    lang.Task.do(function*() {
      const pack = yield packs.get(id)
      const properties = yield packs.properties(id)
      const nodes = yield packs.items(id)
      const regex = new RegExp(s, "i")

      for (let p = 0; p < properties.length; p += 1) {
        const property = properties[p]

        const key = property.key
        const result = []

        nodes.forEach(node => {
          if (regex.exec(String(node.properties[key]))) result.push(node)
        })

        if (result.length > 0) {
          const sub = result
            .slice(0, 5)
            .map(node => node.properties[pack.metadata.titleField])
            .join(", ")
          const labels =
            result.length > 5 ? `${sub} and ${result.length - 5} more` : sub

          postMessage({
            id: "search",
            result: `${property.metadata.name}: ${result.length} (${labels})`
          })
        }
      }

      postMessage({
        id: "search",
        result: "DONE"
      })

      return lang.Task.of()
    })

  return { start }
})()
