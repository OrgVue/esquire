// some expensive, async operation
const fetchSquare = x =>
  lang.Task((rej, res) => {
    setTimeout(() => res(x * x), 500)
  })

// async component displaying expensive data based on current revision
const Data = async.Rendered(({ revision }) => [revision], fetchSquare)(
  ({ asyncData, message, revision }) => (
    <>
      <h2>
        revision {revision} data: {asyncData}
      </h2>
      <h3>message: {message}</h3>
    </>
  )
)

// sync component displaying current revision + 1
const onUpgrade = revision => {
  ui.transition("main", { revision })
}
const Upgrade = ({ revision }) => (
  <button onClick={() => onUpgrade(revision + 1)}>
    Upgrade to revision {revision + 1}
  </button>
)

// main app
// The "hi!" button should not trigger rerender of components using revision
const App = ({ message, revision }) => (
  <>
    <Upgrade revision={revision} />
    <Data message={message} revision={revision} />
    <button onClick={() => ui.transition("main", { message: "Hi!" })}>
      hi!
    </button>
  </>
)

const cmode = ReactDOM.unstable_createRoot(document.getElementById("app"))
const render = store => {
  cmode.render(
    <React.Suspense fallback={null}>
      <React.unstable_ConcurrentMode>
        <App {...store} />
      </React.unstable_ConcurrentMode>
    </React.Suspense>
  )
}

const ui = sc.UIController(render)
ui.transition("main", { message: "Welcome", revision: 1 })
