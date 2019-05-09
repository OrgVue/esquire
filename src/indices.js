indices = (() => {
  const clone = raw => new Map(raw)

  const create = () => new Map()

  // https://graphics.stanford.edu/~seander/bithacks.html#CountBitsSetParallel
  // cross my fingers and hope it never fails
  const countBits = v => {
    v = v - ((v >>> 1) & 0x55555555)
    v = (v & 0x33333333) + ((v >>> 2) & 0x33333333)
    return (((v + (v >>> 4)) & 0xf0f0f0f) * 0x1010101) >>> 24
  }

  const count = raw => {
    let r = 0
    for (const [, value] of raw) {
      r += countBits(value)
    }
    return r
  }

  const intersectMany = iter => {
    let acc

    for (const raw of iter) {
      if (!acc) {
        acc = clone(raw)
        continue
      }

      if (acc.size === 0) {
        break
      }

      for (const [word, c] of acc) {
        const t = c || 0
        const n = raw.get(word) || 0

        const res = n & t
        if (res === 0) {
          acc.delete(word)
        } else {
          acc.set(word, res)
        }
      }
    }

    return acc
  }

  const intersect = (a, b) => {
    if (a === undefined) return b
    if (b === undefined) return a

    return intersectMany(a.size < b.size ? [a, b] : [b, a])
  }

  const set = (raw, index) => {
    const word = (index / 32) | 0
    const mask = 1 << index % 32
    raw.set(word, (raw.get(word) || 0) | mask)
  }

  const test = (raw, index) => {
    const word = (index / 32) | 0
    const mask = 1 << index % 32

    return (raw.get(word) & mask) === mask
  }

  const unionMany = iter => {
    const acc = create()

    for (const raw of iter) {
      for (const [word, c] of raw) {
        const t = c || 0
        if (t === 0) {
          continue
        }
        acc.set(word, acc.get(word) | t)
      }
    }

    return acc
  }

  const union = (a, b) => {
    if (a === undefined) return b
    if (b === undefined) return a

    return unionMany([a, b])
  }

  return {
    create,
    count,
    intersect,
    set,
    test,
    union
  }
})()
