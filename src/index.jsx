const render = state =>
  lang.Task((rej, res) => {
    // disallow re-entrant rendering

    const app = <components.App state={state} />
    reactTreeWalker(app, (element, instance) => {
      if (!instance && typeof element.type === "function") {
        try {
          element.type(element.props)
        } catch (e) {
          return e // check promise
        }
      }
    }).then(() => {
      ReactDOM.render(app, document.getElementById("app"))
      res()
    }, rej)
  })

// Start web worker
let worker
if (!WORKER_DISABLED) {
  worker = new Worker("src/worker.js")
} else {
  window.postMessage = data => worker.onmessage({ data })
  worker = {
    postMessage: data => window.onmessage({ data })
  }
}

window.ui = sc.UIController(render, worker)

// Authenticate
fetch("/tenants/authenticator", {
  body: JSON.stringify({
    login: "rodinhart@gmail.com",
    password: localStorage.getItem("pwd")
  }),
  method: "POST"
}).then(response => {
  // Go, now. Go!
  ui.transition("homescreen", {
    filter: {},
    go: 1,
    search: "",
    searchResult: []
  })
})
