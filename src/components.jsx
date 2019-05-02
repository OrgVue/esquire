;(() => {
  const listPacks = () => ui.post("packs", ["list"])
  const onPack = name => ui.transition("pack", { pack: name })
  const Packs = async.Rendered(({}) => [], listPacks)(({ asyncData }) => (
    <ol>
      {asyncData.map(({ name }) => (
        <li key={name} onClick={() => onPack(name)}>
          {name}
        </li>
      ))}
    </ol>
  ))

  const getPack = name => ui.post("packs", ["get", name])
  const Pack = async.Rendered(() => [ui.getStore().pack], getPack)(
    ({ asyncData }) => (
      <>
        <button onClick={() => ui.transition("homescreen")}>Homescreen</button>
        <h2>{asyncData.name}</h2>
        <div>Last modified: {"" + asyncData.modified}</div>
      </>
    )
  )

  const App = ({ state }) =>
    ({
      homescreen: <Packs />,
      pack: <Pack />
    }[state])

  window.components = {
    App
  }
})()
