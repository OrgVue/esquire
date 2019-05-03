;(() => {
  const listPacks = () => ui.post("packs", ["list"])
  const onPack = id => ui.transition("pack", { pack: id })
  const wordCase = s => `${s[0].toUpperCase()}${s.substr(1).toLowerCase()}`
  const Packs = async.Rendered(({}) => [], listPacks)(({ asyncData }) => (
    <>
      <div className="Toolbar">
        <div className="Logo">
          <b>Org</b>Vue
        </div>
      </div>
      <div className="Packs">
        {asyncData.map(pack => (
          <div className="Pack" key={pack.id} onClick={() => onPack(pack.id)}>
            {pack.dataset.metadata.name}
            <br />
            <span className="Type">{wordCase(pack.dataset.metadata.type)}</span>
          </div>
        ))}
      </div>
    </>
  ))

  const getPack = id => ui.post("packs", ["get", id])
  const Pack = async.Rendered(() => [ui.getStore().pack], getPack)(
    ({ asyncData: pack }) => {
      return (
        <>
          <h2>{pack.dataset.metadata.name}</h2>
          <div>{wordCase(pack.dataset.metadata.type)}</div>
        </>
      )
    }
  )

  const onHome = () => ui.transition("homescreen")
  const App = ({ state }) =>
    ({
      homescreen: <Packs />,
      pack: (
        <>
          <div className="Toolbar">
            <div className="Logo" onClick={onHome}>
              <b>Org</b>Vue
            </div>
          </div>
          <Pack />
        </>
      )
    }[state])

  window.components = {
    App
  }
})()
