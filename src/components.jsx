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

  const onProperty = property =>
    ui.transition("pack", store => {
      const selected = { ...store.selected }
      if (selected[property.key]) {
        delete selected[property.key]
      } else {
        selected[property.key] = {}
      }

      return {
        ...store,
        selected
      }
    })

  const onBucket = (property, bucket) =>
    ui.transition("pack", store => {
      const selected = { ...store.selected[property.key] }
      if (selected[bucket.name]) {
        delete selected[bucket.name]
      } else {
        selected[bucket.name] = true
      }

      return {
        ...store,
        selected: {
          ...store.selected,
          [property.key]: selected
        }
      }
    })

  const FilterColumn = async.Rendered(
    ({ property, selected }) => [ui.getStore().pack, property.key, selected],
    selectors.getBuckets
  )(({ asyncData: buckets, property }) => (
    <div className="Panel">
      {buckets.slice(0, 100).map(bucket => (
        <div
          key={bucket.name}
          className={bucket.selected ? "Row Selected" : "Row"}
          onClick={() => onBucket(property, bucket)}
        >
          <div>{bucket.name}</div>
          <div>{indices.count(bucket.nodes)}</div>
        </div>
      ))}
    </div>
  ))

  const Filter = async.Rendered(
    () => [ui.getStore().pack],
    selectors.getFilterData
  )(({ asyncData, selected }) => {
    const { properties } = asyncData
    const sels = properties.filter(property => selected[property.key])

    return (
      <div className="Filter">
        <div className="Panel">
          {properties.map(property => (
            <div
              className={selected[property.key] ? "Row Selected" : "Row"}
              key={property.key}
              onClick={() => onProperty(property)}
            >
              {property.metadata.name}
            </div>
          ))}
        </div>
        {sels.map(property => (
          <FilterColumn
            key={property.key}
            property={property}
            selected={selected}
          />
        ))}
      </div>
    )
  })

  const Pack = async.Rendered(
    () => [ui.getStore().pack, ui.getStore().selected],
    selectors.getPackData
  )(({ asyncData }) => {
    const { nodes, pack } = asyncData

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

        <Filter selected={ui.getStore().selected} />

        <div>{indices.count(nodes)} items</div>

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
