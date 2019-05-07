const cmode = ReactDOM.unstable_createRoot(document.getElementById("app"))
const render = () => {
  cmode.render(
    <React.Suspense fallback={null}>
      <React.unstable_ConcurrentMode>
        <components.App state={ui.getState()} />
      </React.unstable_ConcurrentMode>
    </React.Suspense>
  )
}

const worker = new Worker("src/worker.js")
window.ui = sc.UIController(render, worker, async.setProgress)

fetch("/tenants/authenticator", {
  body: JSON.stringify({
    login: "rodinhart@gmail.com",
    password: "Wachtwoord123"
  }),
  method: "POST"
}).then(response => {
  // Go, now. Go!
  ui.transition("homescreen", {
    selected: { Area: true, Department: true }
  })
})
