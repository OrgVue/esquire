const render = () => {
  // disallow re-entrant rendering

  const app = <components.App state={ui.getState()} />
  return reactTreeWalker(app, (element, instance) => {
    if (!instance && typeof element.type === "function") {
      try {
        element.type(element.props)
      } catch (e) {
        return e // check promise
      }
    }
  }).then(
    () => {
      ReactDOM.render(app, document.getElementById("app"))
    },
    err => {
      console.log("Error", err)
    }
  )
}

// Start web worker
const worker = new Worker("src/worker.js")
window.ui = sc.UIController(render, worker)

// Authenticate
fetch("/tenants/authenticator", {
  body: JSON.stringify({
    login: "rodinhart@gmail.com",
    password: "Wachtwoord123"
  }),
  method: "POST"
}).then(response => {
  // Go, now. Go!
  ui.transition("homescreen", {
    filter: {}
  })
})
