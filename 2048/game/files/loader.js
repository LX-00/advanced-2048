var cores = null;
var mainlines = null;
var threads = null;
var size = null;
var gop = null;

function notfound() {
  let t = window.location.href.split ('/');
  for (let i = 1; i <= 3; i++) t.pop ();
  let s = "";
  for (i of t) s += i + '/';
  s += '404.html';
  window.location.href = s;
}

function load () {
  let query = window.location.search;
  if (query.length != 11) notfound ();//404
  query = query.substr (6);
  let defaultdata = {// paddingwith + gridcellsize == unitsize
    'gridcellsize' : '106.25px',
    'unitsize' : 121,
    'lineheight' : '116.25px',
    'fontsize' : '55px',
    'paddingwidth' : '15px',
  }
  let data = {//css
    '14' : {
        'containerwidth' : '500px',
        'gamecontainersize' : '500px',
    },
    '15' : {
        'containerwidth' : '621.25px',
        'gamecontainersize' : '621.25px',
    },
    '16' : {
        'gridcellsize' : '90px',
        'unitsize' : 105,
        'lineheight' : '100px',
        'fontsize' : '45px',
        'containerwidth' : '645px',
        'gamecontainersize' : '645px',
    },
    '17' : {
        'gridcellsize' : '78px',
        'unitsize' : 93,
        'lineheight' : '80px',
        'fontsize' : '40px',
        'containerwidth' : '666px',
        'gamecontainersize' : '666px',
    },
    '24' : {
        'containerwidth' : '1030px',
        'gamecontainersize' : '500px',
    },
    '25' : {
        'containerwidth' : '1272.5px',
        'gamecontainersize' : '621.25px',
    },
    '26' : {
        'gridcellsize' : '90px',
        'unitsize' : 105,
        'lineheight' : '100px',
        'fontsize' : '45px',
        'containerwidth' : '1320px',
        'gamecontainersize' : '645px',
    },
    '27' : {
        'gridcellsize' : '78px',
        'unitsize' : 93,
        'lineheight' : '80px',
        'fontsize' : '40px',
        'containerwidth' : '1362px',
        'gamecontainersize' : '666px',
    },
    '34' : {
      'gridcellsize' : '85px',
      'unitsize' : 100,
      'lineheight' : '90px',
      'fontsize' : '45px',
      'containerwidth' : '1305px',
      'gamecontainersize' : '415px',
    },
    '35' : {
      'gridcellsize' : '70px',
      'unitsize' : 85,
      'lineheight' : '75px',
      'fontsize' : '35px',
      'containerwidth' : '1380px',
      'gamecontainersize' : '440px',
    },
    '36' : {
      'gridcellsize' : '63px',
      'paddingwidth' : '12px',
      'unitsize' : 75,
      'lineheight' : '70px',
      'fontsize' : '32px',
      'containerwidth' : '1446px',
      'gamecontainersize' : '462px',
    },
    '37' : {
      'gridcellsize' : '55px',
      'paddingwidth' : '10px',
      'unitsize' : 65,
      'lineheight' : '60px',
      'fontsize' : '27px',
      'containerwidth' : '1455px',
      'gamecontainersize' : '465px',
    },
  }
  let dat = data[[query[1]+query[3]]];
  if (dat == null) notfound ();//404
  // get parameters
  window.gameName = '2048-advanced-' + query;
  let id = parseInt (query);
  cores = parseInt (id / 10000);
  threads = parseInt (id / 1000) % 10;
  mainlines = parseInt (id / 100) % 10;
  size = parseInt (id / 10) % 10;
  op = id % 10;
  if (cores < 1 || cores > 5 || threads < 1 || threads > 3 || mainlines < 1 || mainlines > 5 || size < 4 || size > 7 || op < 1 || op > 4) notfound ();

  //build css
  function q (s) {return dat[s] || defaultdata[s];}
  let style = document.createElement ('style');
  style.innerHTML = '';

  style.innerHTML += '.container { width : ' + q ('containerwidth') + ';}';
  style.innerHTML += '.game-container { width : ' + q ('gamecontainersize') + '; height : ' + q ('gamecontainersize') + ';}';
  style.innerHTML += '.grid-cell { width : ' + q ('gridcellsize') + '; height : ' + q ('gridcellsize') + ';}';
  style.innerHTML += '.tile, .tile .tile-inner { width : ' + q ('gridcellsize') + '; height : ' + q ('gridcellsize') + ';' + 
    'line-height : ' + q ('lineheight') + ';' + 'font-size : ' + q ('fontsize') + ';}';
  style.innerHTML += '.game-container { padding: ' + q ('paddingwidth') + ';}';
  style.innerHTML += '.grid-row { margin-bottom: ' + q ('paddingwidth') + ';}';
  style.innerHTML += '.grid-cell { margin-right: ' + q ('paddingwidth') + ';}';
  for (let i = 1; i <= size; i++) for (let j = 1; j <= size; j++) {
      style.innerHTML += ".tile.tile-position-" + i + '-' + j + " {";
      let st = "translate(" + ((i - 1) * q ('unitsize')) + 'px, ' + ((j - 1) * q ('unitsize')) + 'px);';
      style.innerHTML += "-webkit-transform: " + st + "-moz-transform: " + st + "transform: " + st +'}'
  }
  document.head.appendChild (style);

  //build HTML
  let title = document.querySelector ('.title');
  let txtc = {
    1 : 'single',
    2 : 'dual',
    3 : 'three',
    4 : 'four',
    5 : 'five',
  };
  let OP = {
    1 : 'easy',
    2 : 'normal',
    3 : 'hard',
    4 : 'insane',
  }
  title.innerHTML = txtc[cores] + ' core ' + txtc[threads] + ' thread ' + txtc[mainlines] + ' mainline 2048 ' + size + 'x' + size + ' ' + OP[op];

  let SM = document.querySelector ('.scores-container');
  let scoreC = document.createElement ('div');
  scoreC.classList.add ('score-container');
  scoreC.classList.add ('result-container');
  let scoreA = document.createElement ('div');
  scoreA.classList.add ('score-addition');
  scoreC.appendChild (scoreA);
  SM.appendChild (scoreC);
  let bestC = document.createElement ('div');
  bestC.classList.add ('best-container');
  bestC.classList.add ('result-container');
  SM.appendChild (bestC);
  let worstC = document.createElement ('div');
  worstC.classList.add ('worst-container');
  worstC.classList.add ('result-container');
  if (op <= 2) worstC.style.display = 'none';
  SM.appendChild (worstC);
  let largestC = document.createElement ('div');
  largestC.classList.add ('largest-container');
  largestC.classList.add ('result-container');
  SM.appendChild (largestC);
  let smallestC = document.createElement ('div');
  smallestC.classList.add ('smallest-container');
  smallestC.classList.add ('result-container');
  if (op <= 2) smallestC.style.display = 'none';
  SM.appendChild (smallestC);

  let maing = document.querySelector ('.game-body');
  for (let i = 1; i <= threads; i++) {
    let gamecotainer = document.createElement ('div');
    gamecotainer.classList.add ('game-container');

    let gamemessage = document.createElement ('div');
    gamemessage.classList.add ('game-message');

    let gameover = document.createElement ('p');
    gameover.innerHTML = 'Game over!';
    gamemessage.appendChild (gameover);

    let lower = document.createElement ('div');
    lower.classList.add ('lower');

    let keepgoing = document.createElement ('a');
    keepgoing.classList.add ('keep-playing-button');
    keepgoing.innerHTML = 'Keep going';
    lower.appendChild (keepgoing);

    let retry = document.createElement ('a');
    retry.classList.add ('retry-button');
    retry.innerHTML = 'Try again';
    lower.appendChild (retry);
    gamemessage.appendChild (lower);
    gamecotainer.appendChild (gamemessage);

    let gridcotainer = document.createElement ('div');
    gridcotainer.classList.add ('grid-container');
    for (let x = 1; x <= size; x++) {
      let gridrow = document.createElement ('div');
      gridrow.classList.add ('grid-row');
      for (let y = 1; y <= size; y++) {
        let gridcell = document.createElement ('div');
        gridcell.classList.add ('grid-cell');
        gridrow.appendChild (gridcell);
      }
      gridcotainer.appendChild (gridrow);
    }
    gamecotainer.appendChild (gridcotainer);

    let tielcotainer = document.createElement ('div');
    tielcotainer.classList.add ('tile-container');
    gamecotainer.appendChild (tielcotainer);

    maing.appendChild (gamecotainer);
  }
}

load ();