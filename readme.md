# TODO

- implement search
- pinpoint singleton caches (items?)
- migration path
- react-tree-walker to get around concurrent timeout

# Rationale

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
