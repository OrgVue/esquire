# TODO

- pinpoint singleton caches (items?)
- migration path
- get used memory from/for webworker?

# Rationale

## Async rendering

React doesn't support async rendering, i.e. ideally we'd write

```jsx
const Pack = async function(id) {
  const pack = await getPack(id) // getPack returns Promise

  return <h2>{pack.name}</h2>
}
```

We could use Suspense and Concurrent (although Concurrent is experimental)

```jsx
const Pack = id => {
  const pack = getPack(id) // could throw Promise

  return <h2>{pack.name}</h2>
}

const App = id => (
  <React.Suspense>
    <React.unstable_ConcurrentMode>
      <Pack id={id} />
    </React.unstable_ConcurrentMode>
  </React.Suspense>
)
```

The disadvantages are:

- the Promises are executed in parallel. Not OK because of our rotating token
- concurrent mode will commit the DOM after some timeout (500ms I think) which will cause flickering
- we don't know when rendering is done, when to handle actions encoding side effect

So we use a tree walker to handle the async data collection

## Relying on `throw` directly

For easy of reading

```jsx
const Pack = id => {
  const pack = getPack(id) // could throw Promise

  return <h2>{pack.name}</h2>
}
```

Note this requires `getPack` to be memoized and to throw on cache miss.

A more elegant but verbose structure would read

```jsx
const Pack = Async(
  props => [props.id], // select arguments
  getPack, // function returning Task
  ({ asyncData: pack, id }) => <h2>{pack.name}</h2>
)
```

Here `Async` does the memoization. The advantage is that the resulting wrapped component could be inspected for async data (i.e. `getPack` returning a `Task`) without calling the render function. On the other hand, the render function needs to be called anyway to discover async data of children.
