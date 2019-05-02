// some expensive, async operation
const fetchSquare = x =>
  lang.Task((rej, res) => {
    setTimeout(() => res(x * x), 1000)
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
  transition({ revision })
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
    <button onClick={() => transition({ message: "Hi!" })}>hi!</button>
  </>
)

const render = store => {
  async.synchronise(<App {...store} />).then(() => {
    ReactDOM.render(<App {...store} />, document.getElementById("app"))
  })
}

let store = {}
const transition = diff => {
  store = {
    ...store,
    ...diff
  }

  render(store)
}

transition({ message: "Welcome", revision: 1 })
