;(() => {
  const onPack = id => ui.transition("pack", { pack: id })
  const wordCase = s => `${s[0].toUpperCase()}${s.substr(1).toLowerCase()}`
  const Packs = async.Rendered(({}) => [], selectors.listPacks)(
    ({ asyncData }) => (
      <>
        <div className="Toolbar">
          <div className="Logo">
            <b>Org</b>Vue
          </div>
          <div>&nbsp;</div>
          <div>Global (Admin)</div>
        </div>
        <div className="Packs">
          {asyncData.map(pack => (
            <div className="Pack" key={pack.id} onClick={() => onPack(pack.id)}>
              {pack.dataset.metadata.name}
              <br />
              <span className="Type">
                {wordCase(pack.dataset.metadata.type)}
              </span>
            </div>
          ))}
        </div>
      </>
    )
  )

  const Pack = async.Rendered(
    () => [ui.getStore().pack],
    selectors.getPackData
  )(({ asyncData }) => {
    const { items, pack } = asyncData
    return (
      <>
        <div className="Toolbar">
          <div className="Logo" onClick={onHome}>
            <b>Org</b>Vue
          </div>
          <div className="Title">
            <b>{pack.dataset.metadata.name}</b> |{" "}
            {wordCase(pack.dataset.metadata.type)}
          </div>
          <div>Global (Admin)</div>
        </div>

        <div>{items.length} items</div>

        {/* <ul>
          {items.map((item, i) => (
            <li key={`item_${i}`}>Item {i}</li>
          ))}
        </ul> */}
      </>
    )
  })

  const onHome = () => ui.transition("homescreen")
  const App = ({ state }) =>
    ({
      homescreen: <Packs />,
      pack: <Pack />
    }[state])

  window.components = {
    App
  }
})()
