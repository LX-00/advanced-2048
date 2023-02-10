// Wait till the browser is ready to render the game (avoids glitches)

var Game;
window.requestAnimationFrame(function () {
  Game = new MainManager(cores, threads, mainlines, size, gop);
});
