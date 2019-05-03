network = (() => {
  const request = (options, body) =>
    lang.Task((rej, res) => {
      const headers = {
        accept: "application/json",
        ...(options && options.headers ? options.headers : {})
      }

      fetch(options.path, {
        body,
        ...options,
        headers
      })
        .then(response => response.json())
        .then(result => {
          res(result)
        })
    })

  const requestStream = (options, body) =>
    lang.Task((rej, res) => {
      const headers = {
        accept: "application/json",
        ...(options && options.headers ? options.headers : {})
      }

      fetch(options.path, {
        body,
        ...options,
        headers
      })
        .then(response => response.body.getReader())
        .then(result => {
          res(result)
        })
    })

  // text decoder sink
  const textDecoder = sink => chunk =>
    chunk !== undefined
      ? sink(new TextDecoder().decode(chunk))
      : sink(undefined)

  // json sink
  const MODE_AUTO = 0
  const MODE_ARRAY = 1
  const MODE_OBJECT = 2
  const NEW_LINE = "\n".charCodeAt(0)

  const json = sink => {
    let cache = ""
    let mode = MODE_AUTO
    let pos = 0
    let scan = 1

    return chunk => {
      if (chunk === undefined) {
        if (mode === MODE_ARRAY) {
          if (cache.length !== 0) {
            sink(JSON.parse(cache))
          }
        } else {
          sink(cache)
        }

        sink(undefined)
        return
      }

      cache += chunk

      if (mode === MODE_AUTO) {
        if (cache[0] === "[") {
          mode = MODE_ARRAY
        } else {
          mode = MODE_OBJECT
        }
      }

      if (mode === MODE_ARRAY) {
        while (scan + 1 < cache.length) {
          // whatever happens, we still need the closing ]
          const b = cache.charCodeAt(scan++)
          if (b === NEW_LINE) {
            // newline
            if (scan + 1 < cache.length && scan - pos > 1e6) {
              let data

              // block worth parsing
              if (cache[scan] === ",") {
                data = cache.substring(pos, scan) + "]"
                cache = "[" + cache.substring(scan + 1)
                pos = 0
                scan = 1
              } else {
                data = cache.substring(pos, scan)
                cache = ""
                pos = 0
                scan = 0
              }

              sink(JSON.parse(data))
            } else if (scan + 1 < cache.length && cache[scan] === ",") {
              scan++
            }
          }
        }
      }
    }
  }

  // rvdh decoder sink
  const rvdhDecode = sink => {
    // var access, counts, dict, keys, primer, size, user, zero
    let access
    let counts
    let dict
    let keys
    let primer
    let size
    let user
    let zero

    return _

    function bitmask(value) {
      if (!access[value]) {
        access[value] = []
        for (let i = 0; i < primer.access.length; i += 1) {
          if ((value & (2 ** i)) !== 0) {
            access[value].push(primer.access[i])
          }
        }
      }

      return access[value]
    }

    function _map(values) {
      const item = {
        properties: {}
      }
      for (let i = 0; i < values.length; i += 1) {
        let value = values[i]
        if (i < zero) {
          item[keys[i]] = value
        } else {
          let key
          if (value instanceof Array) {
            key = keys[zero + value[0]]
            if (key !== "deltas" && counts[value[0]] < size) {
              dict.push(value)
              counts[value[0]] += 1
            }
          } else {
            value = dict[value]
            key = keys[zero + value[0]]
          }

          if (value[0] < user) {
            if (key === "access") {
              item[key] = bitmask(value[1])
            } else if (key === "deltas" && value[1] instanceof Array) {
              item[key] = value[1].map(_map)
            } else {
              item[key] = value[1]
            }
          } else {
            item.properties[key] = value[1]
          }
        }
      }

      return item
    }

    function _(items) {
      if (!(items instanceof Array)) {
        sink(items)
        return
      }

      let start = 0
      if (!primer && items.length > 0) {
        primer = items[0]
        start = 1

        size = primer.maxSize || 1024
        access = {}

        user = -1
        zero = -1

        counts = []
        keys = []
        for (let i = 0; i < primer.keys.length; i += 1) {
          if (primer.keys[i] instanceof Array) {
            if (zero === -1) {
              zero = keys.length
            } else {
              user = keys.length - zero
            }

            keys.push(...primer.keys[i])
          } else {
            keys.push(primer.keys[i])
          }

          while (counts.length < keys.length) {
            counts.push(0)
          }
        }

        dict = []
      }

      const result = []
      for (let i = start; i < items.length; i += 1) {
        result.push(_map(items[i]))
      }

      sink(result)
    }
  }

  const readItems = (reader, progress) =>
    lang.Task((rej, res) => {
      const items = []
      const sink = textDecoder(
        json(
          rvdhDecode(chunk => {
            if (chunk !== undefined) {
              items.push(...chunk)
              progress(items.length)
            }
          })
        )
      )

      const _ = () => {
        reader.read().then(({ done, value }) => {
          if (done) {
            sink(undefined)
            res(items)
            return
          }

          sink(value)
          _()
        })
      }

      _()
    })

  return { readItems, request, requestStream }
})()
