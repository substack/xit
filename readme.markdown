# xit

configure an external display on linux

xrandr commands are really hard to memorize and graphical tools are frustrating,
especially when you're setting up a presentation in front of a room full of
people

# usage

```
usage:

  xit mirror

    Mirror the current primary resolution to the external display resolution,
    with changing the current primary resolution or geometry.

  xit right, xit left, xit top, xit bottom

    Set up the display to the right, left, top, or bottom of the primary
    display.

  xit toggle

    Toggle which of the two displays are active.

  xit off

    Turn off external display.

  xit reset

    Put everything back to normal.
```

# install

To get the `xit` command, with [npm](https://npmjs.org) do:

```
npm install -g xit
```

# license

MIT
