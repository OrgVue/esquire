emitters = (() => {
  const setLabel = (go, id, index, label) =>
    lang.Task.do(function*() {
      const revision = yield ui.post("packs", [
        "setLabel",
        go,
        id,
        index,
        label
      ])

      return lang.Task.of(revision)
    })

  return { setLabel }
})()
