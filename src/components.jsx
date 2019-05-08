;(() => {
  // Display the packs
  const onPack = id => ui.transition("pack", { pack: id })
  const Packs = () => {
    const packs = selectors.listPacks()

    return (
      <>
        <div className="Toolbar">
          <div className="Logo">
            <b>Org</b>Vue
          </div>
          <div>&nbsp;</div>
          <div>Global (Admin)</div>
        </div>
        <div className="Packs">
          {packs.map(pack => (
            <div className="Pack" key={pack.id} onClick={() => onPack(pack.id)}>
              {pack.dataset.metadata.name}
              <br />
              <span className="Type">
                {lang.wordCase(pack.dataset.metadata.type)}
              </span>
            </div>
          ))}
        </div>
      </>
    )
  }

  // Handle click on property in filter
  const onProperty = property =>
    ui.transition("pack", store => {
      const filter = { ...store.filter }
      if (filter[property.key]) {
        delete filter[property.key]
      } else {
        filter[property.key] = {}
      }

      return {
        ...store,
        filter
      }
    })

  // Handle click on bucket in filter
  const onBucket = (property, bucket) =>
    ui.transition("pack", store => {
      const filter = { ...store.filter[property.key] }
      if (filter[bucket.name]) {
        delete filter[bucket.name]
      } else {
        filter[bucket.name] = true
      }

      return {
        ...store,
        filter: {
          ...store.filter,
          [property.key]: filter
        }
      }
    })

  // Display list of buckets in filter
  const FilterColumn = ({ filter, property }) => {
    const buckets = selectors.getBuckets(
      ui.getStore().pack,
      property.key,
      filter
    )

    return (
      <div className="Panel">
        {buckets.slice(0, 2000).map(bucket => (
          <div
            key={bucket.name}
            className={bucket.selected ? "Row Selected" : "Row"}
            onClick={() => onBucket(property, bucket)}
          >
            <div>{bucket.name.replace("zzz", "")}</div>
            <div>{indices.count(bucket.nodes)}</div>
          </div>
        ))}
      </div>
    )
  }

  // Display filter
  const Filter = ({ filter }) => {
    const { properties } = selectors.getFilterData(ui.getStore().pack)
    const sels = properties.filter(property => filter[property.key])

    return (
      <div className="Filter">
        <div className="Panel">
          {properties.map(property => (
            <div
              className={filter[property.key] ? "Row Selected" : "Row"}
              key={property.key}
              onClick={() => onProperty(property)}
            >
              {property.isCalc ? (
                <i>{property.metadata.name}</i>
              ) : (
                property.metadata.name
              )}
            </div>
          ))}
        </div>
        {sels.map(property => (
          <FilterColumn
            key={property.key}
            property={property}
            filter={filter}
          />
        ))}
      </div>
    )
  }

  // Display a pack
  const onSearch = search => {
    if (!ui.getStore().search) {
      ui.transition("pack", { search, searchResult: [] })
      ui.post("search", ["start", ui.getStore().pack, search]).fork(
        console.log,
        () => {
          ui.transition("pack", { search: "" })
        }
      )
    }
  }
  const Pack = () => {
    const { nodes, pack } = selectors.getPackData(
      ui.getStore().pack,
      ui.getStore().filter
    )

    setTimeout(() => document.getElementById("txtSearch").focus(), 10)

    return (
      <>
        <div className="Toolbar">
          <div className="Logo" onClick={onHome}>
            <b>Org</b>Vue
          </div>
          <div className="Title">
            <b>{pack.dataset.metadata.name}</b> |{" "}
            {lang.wordCase(pack.dataset.metadata.type)}
          </div>
          <div>Global (Admin)</div>
        </div>

        <Filter filter={ui.getStore().filter} />

        <div className="Search">
          <div>Search {indices.count(nodes)} items</div>
          <div>
            <input
              id="txtSearch"
              onKeyUp={e =>
                e.keyCode === 13 &&
                onSearch(document.getElementById("txtSearch").value)
              }
              type="text"
            />
            <button
              onClick={e =>
                onSearch(document.getElementById("txtSearch").value)
              }
              disabled={!!ui.getStore().search}
            >
              Go
            </button>
          </div>
          <div>
            {ui.getStore().searchResult.map(line => (
              <div key={Math.random()}>{line}</div>
            ))}
          </div>
        </div>
      </>
    )
  }

  // Handle click on homescreen
  const onHome = () => ui.transition("homescreen")

  // Display the app
  const App = ({ state }) =>
    ({
      homescreen: <Packs />,
      pack: <Pack />
    }[state])

  // Export
  window.components = {
    App
  }
})()
