# ascii minesweeper
minesweeper minigame made with a 2d grid of DOM elements .

unfinished
# TODO
- [x] implement flood-fill algorithm
- [x] add sanity check for whether the game started to prevent bricking the game by revealing the whole board
- [x] add colored numbers
- [x] add game restarting functionality ( cleaning the board )
- [x] add open area prediction using seeds ( prevents for clicking on a bomb or an index )
- [ ] make area prediction more precise and less buggy
- [ ] add win condition
- [ ] expose variables to front-end
- [ ] add autoreveal when pressing on index ?
- [ ] implement a replay & sharing system
- [ ] stop the PRNG from cycling through the seed (if any bombs are generated the seed will not work as intended)