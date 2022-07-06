// 応答の定義（ハッシュ）    
var default_response = {
    ".*あなた.*誰.*": "わたしは和歌山大学登下校サービスです",
    ".*名前は.*": "わたしは和歌山大学登下校サービスです。まだ名前は決まってないです",
    ".*何歳.*": "え、わたし、何歳にみえますか",
    ".*元気.*": "元気です",
    ".*好きな.*色.*": "オレンジです",
    ".*夢は.*": "世界を冒険することです",
    ".*好きな.*スポーツ.*": "水泳かな、浮いているだけなんだけどね",
    ".*好きな.*食べ物.*": "焼肉です",
    //".*和歌山.*天気.*": "和歌山の天気はたぶん晴れでしょう",
    //".*大阪.*天気.*": "大阪の天気は雨です。",
    //".*明日.*天気.*": "明日の天気は曇りだと思います",
    //".*明日.*和歌山.*天気.*": "明日の和歌山の天気はずばり雪です"
};

var weather_response = {
    ".*和歌山.*天気.*": ["和歌山県の天気予報を表示します。ページを移動するのでここでお別れですね。さようなら。", "https://weather.yahoo.co.jp/weather/jp/30/"],
    ".*大阪.*天気.*": ["大阪府の天気予報を表示します。ページを移動するのでここでお別れですね。さようなら。", "https://weather.yahoo.co.jp/weather/jp/27/"],
    ".*京都.*天気.*": ["京都府の天気予報を表示します。ページを移動するのでここでお別れですね。さようなら。", "https://weather.yahoo.co.jp/weather/jp/26/"],
    ".*奈良.*天気.*": ["奈良県の天気予報を表示します。ページを移動するのでここでお別れですね。さようなら。", "https://weather.yahoo.co.jp/weather/jp/29/"],
    ".*兵庫.*天気.*": ["兵庫県の天気予報を表示します。ページを移動するのでここでお別れですね。さようなら。", "https://weather.yahoo.co.jp/weather/jp/28/"]
};

var southern_response = {
    ".*帰り.*サザン.*":["平日ダイヤの次のサザンは:発 特急サザン難波行きです。:あと:分後に出発します。",["6:02","6:31","7:02","7:34","7:54","8:36","9:06","9:36","10:06","10:36","11:06","11:36","12:06","12:36","13:06","13:36","14:06","14:36","15:06","15:36","16:06","16:36","17:06","17:36","18:06","18:36","19:06","19:36","20:06","20:36","21:06","21:38","21:56","22:27"]]
}

/* TODO: jQueryの残骸
$.ajax({
    type: "GET",
    url: "response_test.json",
    dataType: "json"
})
    // Ajaxリクエストが成功した場合
    .done(function (data) {
        alert('成功!');
        alert(data);
    })
    // Ajaxリクエストが失敗した場合
    .fail(function (XMLHttpRequest, textStatus, errorThrown) {
        alert(errorThrown);
    });
*/


const startButton = document.querySelector('#startButton'); // 開始ボタン
const stopButton = document.querySelector('#stopButton'); // 停止ボタン
const resultOutput = document.querySelector('#resultOutput'); // 結果出力エリア

if (!'SpeechSynthesisUtterance' in window) {
    alert("あなたのブラウザはSpeech Synthesis APIに未対応です。");
}
const tts = new SpeechSynthesisUtterance(); // TTSインスタンスを生成
//tts.text = textForm.value; // テキストを設定
tts.lang = "ja-JP"; // 言語(日本語)、英語の場合はen-US
tts.rate = 1.2; // 速度
tts.pitch = 1.2; // 声の高さ
tts.volume = 1.0; // 音量

SpeechRecognition = webkitSpeechRecognition || SpeechRecognition;
if (!'SpeechRecognition' in window) {
    alert("あなたのブラウザはSpeech Recognition APIに未対応です。");
}

const asr = new SpeechRecognition(); // ASRインスタンスを生成
asr.lang = "ja-JP"; // 言語（日本語）
asr.interimResults = true; // 途中結果出力をオン
asr.continuous = true; // 継続入力をオン

let output = ''; // 出力
let hasDefaultResponse = true;
let hasWeatherResponse = true;


// 認識結果が出力されたときのイベントハンドラ
asr.onresult = function (event) {
    let transcript = event.results[event.resultIndex][0].transcript; // 結果文字列

    let output_not_final = '';
    if (event.results[event.resultIndex].isFinal) { // 結果が確定（Final）のとき
        asr.abort(); // 音声認識を停止

        let answer;
        let webpage;
        
        //  デフォルト返答
        let keys = Object.keys(default_response);
        keys.forEach(function (key) {
            if (new RegExp(key).test(transcript)) { // 正規表現をtestしてtrue or false
                answer = default_response[key];
                console.log(key + " : " + answer);
            }
        });

        if (typeof answer == 'undefined') {
            hasDefaultResponse = false;
            //answer = "ごめんなさい。わかりません。";
        }else{
            hasDefaultResponse = true;
        }

        if(!hasDefaultResponse){ // デフォルト返答に値するものがなかった時->天気返答
            keys = Object.keys(weather_response);

            keys.forEach(function (key) {
                if (new RegExp(key).test(transcript)) { // 正規表現をtestしてtrue or false
                    answer = weather_response[key][0];
                    webpage = weather_response[key][1];
                    console.log(key + " : " + answer);
                }
            });

            if (typeof answer == 'undefined') {
                hasWeatherResponse = false;
                //answer = "ごめんなさい。わかりません。";
            }else{
               hasWeatherResponse = true;
            }
        }

        if(!hasDefaultResponse && !hasWeatherResponse){// デフォルト返答も天気返答もない->サザン返答
            var newDate = new Date();
            let difference = ;
        }

        output += transcript + ' => ' + answer + '<br>';

        tts.text = answer;
        // 再生が終了（end）ときのイベントハンドラ（終了したときに実行される）
        tts.onend = function (event) {

            if (typeof webpage != 'undefined') {
                location.href = webpage; // ページを移動
            }

            asr.start(); // 音声認識を再開
        }

        speechSynthesis.speak(tts); // 再生
    } else { // 結果がまだ未確定のとき
        output_not_final = '<span style="color:#ddd;">' + transcript + '</span>';
    }
    resultOutput.innerHTML = output + output_not_final;
}

// 開始ボタンのイベントハンドラ
startButton.addEventListener('click', function () {
    asr.start();
})

// 停止ボタンのイベントハンドラ
stopButton.addEventListener('click', function () {
    asr.abort();
    asr.stop();
})
