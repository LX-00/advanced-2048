var score = 0n;
var ScoreManager = new LocalDataManager;

function MainManager (cores, threads, mainlines, size, gop) {
    this.gamelist = [];
    var metadata = ScoreManager.get ('save');
    if (metadata == '') for (var i = 0; i < threads; i++) {
        console.log (i);
        var it = new GameManager (size, KeyboardInputManager, HTMLActuator, ScoreManager, i, mainlines, cores, gop, '', this.save.bind (this))
        this.gamelist.push (it);
        console.log (it);
        console.log (i);
    }
    else {
        var metajson = atob (metadata);
        var json = JSON.parse (metajson);
        score = BigInt (json.score);
        for (var i = 0; i < threads; i++) console.log(i,'has pushed'), this.gamelist.push (new GameManager (size, KeyboardInputManager, HTMLActuator, ScoreManager, i, mainlines, cores, gop, json.game[i], this.save.bind (this)));
    }
}

MainManager.prototype.save = function () {
    console.log ('saved');
    var metadata = {
        score: score.toString (10),
        game: [],
    };
    for (var i = 0; i < threads; i++) metadata.game[i] = this.gamelist[i].save ();
    var metajson = JSON.stringify (metadata);
    var data = btoa (metajson);
    ScoreManager.set ('save', data);
    console.log ('saved');
}