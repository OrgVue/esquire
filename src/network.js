network = (() => {
  const request = (options, body) =>
    lang.Task((rej, res) => {
      fetch(options.path, {
        body,
        headers: { accept: "application/json" },
        ...options
      })
        .then(response => response.json())
        .then(result => {
          res(result)
        })
    })

  return { request }
})()
