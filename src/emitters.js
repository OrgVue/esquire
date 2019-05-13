emitters = (() => {
  const setLabel = (go, id, index, label) =>
    lang.Task.do(function*() {
      yield ui.post("packs", ["setLabel", go, id, index, label])

      return lang.Task.of()
    })

  return { setLabel }
})()
