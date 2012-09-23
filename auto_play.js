var piano = {
        "c1":new Audio("piano/c1.ogg"),
        "d1":new Audio("piano/d1.ogg"),
        "e1":new Audio("piano/e1.ogg"),
        "f1":new Audio("piano/f1.ogg"),
        "g1":new Audio("piano/g1.ogg"),
        "a1":new Audio("piano/a1.ogg"),
        "b1":new Audio("piano/b1.ogg"),
        "c2":new Audio("piano/c2.ogg"), // オクターブ実装後に役立つ
        };

function clearLog() {
    $("#logs").val("");
}

function writeLog(message) {
    var logs = $("#logs");
    logs.val(logs.val() + message + "\n");
}

function getBeat(tempo) {
    return Math.round(2343.75 / tempo);
}

// そのうちオブジェクトごと渡した方が良くなるほど情報量が増える
function playMusic(beat, volume, code, beforeSound) {
    var result = code.match(/[A-Ga-grR]\d{0,2}\.?/);
    if (!result) {
        writeLog("演奏を終了します。");
        return;
    }
    result = result[0];

    var playCode = result.match(/[A-Ga-g]/);
    var sound = null;
    if (playCode) {
        playCode = playCode[0].toLowerCase();
        var octave = 1;
        sound = piano[playCode + octave];
        if (sound) {
            if (beforeSound) {
                beforeSound.pause();
                beforeSound.currentTime = 0;
            }
            sound.pause();
            sound.currentTime = 0;
            sound.volume = volume;
            sound.play();
        }
    }

    var playLength = result.match(/\d/);
    if (!playLength) { playLength = 4; }
    if (result.indexOf(".") != -1) {
        playLength = playLength + (playLength / 2);
    }

    setTimeout(
            function(b, v, c, s) {
                return function() { playMusic(b, v, c, s); };
            }(beat, volume, code.slice(result.length), sound),
            (64 / playLength) * beat);
}

// 起動時処理
$(function(){
    clearLog();
    for (var i in piano) {
        piano[i].autobuffer = true;
        piano[i].load();
    }

    // 開始ボタン
    $("#start").click(function(){
        writeLog($("#music").val() + "を演奏します。");
        $.getJSON($("#music").val(), {}, function(instances, status) {
            playMusic(
                    getBeat(instances.tempo),
                    instances.volume,
                    instances.code.replace(/\s/g, ""), // 非表示文字の削除
                    null);
        });
    });
});
