const sortFn = (a, b) =>
  a.metadata.name.toLowerCase().localeCompare(b.metadata.name.toLowerCase())

packs = (() => {
  // List the packs
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

  // Get a pack by id
  const get = id =>
    lang.Task.do(function*() {
      const packs = yield list()

      return lang.Task.of(packs.filter(pack => pack.id === id)[0])
    })

  // Get the indexedDB db
  const getDb = () => {
    const db = new Dexie("esquire")

    db.version(1).stores({
      items: "id"
    })

    return db
  }

  const CACHE_ENABLED = true

  // Retrieve items by pack id
  const items = lang.Task.memo(id =>
    lang.Task.do(function*() {
      const pack = yield get(id)

      const db = getDb()

      const cache = yield lang.Task.fromPromise(
        db.items
          .where("id")
          .equals(id)
          .first()
      )

      if (CACHE_ENABLED && cache !== undefined) {
        return lang.Task.of(cache.data)
      }

      postMessage({ id: "progress", result: `Loading items` })
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

      if (CACHE_ENABLED) {
        yield lang.Task.fromPromise(
          db.items.add({
            id,
            data: items
          })
        )
      }

      return lang.Task.of(items)
    })
  )

  // Get tree by pack id
  const tree = lang.Task.memo(id =>
    lang.Task.do(function*() {
      postMessage({ id: "progress", result: `Building tree` })

      const pack = yield get(id)
      const keyId = pack.metadata.paths[0].id
      const keyParent = pack.metadata.paths[0].parentId
      const _nodes = yield items(id)

      const ref = {
        children: []
      }

      ref.lookup = {}

      // read data and index nodes
      const { data, nodes } = _nodes.reduce(
        (r, node) => {
          const item = {
            id: node.properties[keyId],
            node: {
              children: [],
              node
            },
            pid: node.properties[keyParent]
          }
          ref.lookup[node.id] = item.node

          r.data.push(item)
          if (!r.nodes[item.id]) {
            r.nodes[item.id] = item
          } // typed hash of id?

          return r
        },
        {
          data: [],
          nodes: {}
        }
      )

      // set parents
      return lang.Task.of(
        data.reduce((r, item) => {
          if (nodes[item.pid]) {
            // check parent for cycles
            let c = nodes[item.pid]
            while (c && c.id !== item.id) {
              c = c.parent
            }
            if (!c) {
              item.parent = nodes[item.pid]
              item.parent.node.children.push(item.node)
              item.node.parent = item.parent.node

              return r
            }
          }

          item.parent = {}
          ref.children.push(item.node)
          item.node.parent = ref

          return r
        }, ref)
      )
    })
  )

  // Calculate property for given pack id and property key
  const calcProperty = lang.Task.memo((id, key) =>
    lang.Task.do(function*() {
      const nodes = yield items(id)

      postMessage({ id: "progress", result: `Calculating ${key}` })
      const ref = yield tree(id)
      nodes.forEach(node => {
        let c = ref.lookup[node.id]

        node.properties[key] = (() => {
          switch (key) {
            case "_depth":
              let depth = 0
              while (c.parent) {
                depth += 1
                c = c.parent
              }

              return (" " + depth).substr(-2)

            case "_isleaf":
              return c.children.length === 0 ? "Yes" : "No"

            case "_isorphan":
              return c.children.length === 0 && c.parent === ref ? "Yes" : "No"

            case "_outgoing":
              return (" " + c.children.length).substr(-2)
          }
        })()
      })

      return lang.Task.of()
    })
  )

  // Group values for pack id and property key
  const groups = lang.Task.memo((id, key) =>
    lang.Task.do(function*() {
      postMessage({ id: "progress", result: `Grouping ${key}` })

      const props = yield properties(id)
      const property = props.filter(p => p.key === key)[0]
      if (property.isCalc) yield calcProperty(id, key)

      const nodes = yield items(id)

      return lang.Task.of(
        Object.entries(
          nodes.reduce((r, node, i) => {
            let val = node.properties[key]
            if (val === undefined) val = "zzz(Blank)"
            if (!r[val]) r[val] = indices.create()
            indices.set(r[val], i)

            return r
          }, {})
        ).sort((a, b) => a[0].toLowerCase().localeCompare(b[0].toLowerCase()))
      )
    })
  )

  // List properties by pack id
  const properties = lang.Task.memo(id =>
    lang.Task.do(function*() {
      const pack = yield get(id)

      return lang.Task.of(
        [
          {
            key: "_depth",
            isCalc: true,
            metadata: { name: "Depth" }
          },
          {
            key: "_isleaf",
            isCalc: true,
            metadata: { name: "Is leaf" }
          },
          {
            key: "_isorphan",
            isCalc: true,
            metadata: { name: "Is orphan" }
          },
          {
            key: "_outgoing",
            isCalc: true,
            metadata: { name: "Outgoing count" }
          }
        ]
          .concat(pack.dataset.properties)
          .sort(sortFn)
      )
    })
  )

  // Get the mask of filtered nodes
  const filteredNodes = lang.Task.memo((id, filter) =>
    lang.Task.do(function*() {
      const nodes = yield items(id)
      let mask = nodes.reduce((r, node, i) => {
        indices.set(r, i)
        return r
      }, indices.create())

      for (const key in filter) {
        if (Object.entries(filter[key]).length === 0) continue

        const grps = yield groups(id, key)
        const sum = grps.reduce((r, [name, nodes]) => {
          if (!filter[key][name]) return r

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

  // List bucket with filtered nodes for pack id, property key and filter state
  const buckets = lang.Task.memo((id, key, filter) =>
    lang.Task.do(function*() {
      const nodes = yield items(id)
      let mask = nodes.reduce((r, node, i) => {
        indices.set(r, i)
        return r
      }, indices.create())

      postMessage({ id: "progress", result: `Bucketing ${key}` })

      // filter except self
      for (const k in filter) {
        if (k === key || Object.entries(filter[k]).length === 0) continue

        const grps = yield groups(id, k)
        const sum = grps.reduce((r, [name, nodes]) => {
          if (!filter[k][name]) return r

          return indices.union(r, nodes)
        }, undefined)
        if (sum !== undefined) {
          // can this happen?
          mask = indices.intersect(mask, sum)
        }
      }

      const grps = yield groups(id, key)

      const result = grps.map(([val, nodes]) => ({
        name: String(val),
        nodes: indices.intersect(mask, nodes),
        selected: filter[key][val]
      }))

      return lang.Task.of(result)
    })
  )

  // Export
  return {
    buckets,
    filteredNodes,
    items,
    get,
    list,
    properties
  }
})()
