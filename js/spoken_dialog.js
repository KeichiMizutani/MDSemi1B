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
    ".*帰り.*サザン.*": ["平日ダイヤの次の難波方面サザンは:発です。あと:分後に出発します。", ["6:10", "6:31", "7:02", "7:34", "7:54", "8:36", "9:06", "9:36", "10:06", "10:36", "11:06", "11:36", "12:06", "12:36", "13:06", "13:36", "14:06", "14:36", "15:06", "15:36", "16:06", "16:36", "17:06", "17:36", "18:06", "18:36", "19:06", "19:36", "20:06", "20:36", "21:06", "21:38", "21:56", "22:27"]],
    ".*行き.*サザン.*": ["平日ダイヤの次の難波方面サザンは:発です。あと:分後に出発します。", ["7:17", "7:44", "8:14", "8:43", "9:10", "9:45", "10:20", "10:50", "11:20", "11:50", "12:20", "12:50", "13:20", "13:50", "14:20", "14:50", "15:20", "15:50", "16:12", "16:45", "17:10", "17:40", "18:10", "18:40", "19:10", "19:40", "20:10", "20:40", "21:10", "21:45", "22:10", "22:40", "23:00", "23:35"]]
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

const URL = "https://jlp.yahooapis.jp/NLUService/V1/analyze?appid="; // APIのリクエストURL
const APIID = "dj00aiZpPVgwRzRYZEVMQ1JaUSZzPWNvbnN1bWVyc2VjcmV0Jng9OGY-"; // あなたのアプリケーションID


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
let hasSouthernResponse = true;


// 認識結果が出力されたときのイベントハンドラ
asr.onresult = function (event) {
    let transcript = event.results[event.resultIndex][0].transcript; // 結果文字列

    let output_not_final = '';
    if (event.results[event.resultIndex].isFinal) { // 結果が確定（Final）のとき
        asr.abort(); // 音声認識を停止

        let answer;
        let webpage;

        let queryURL = URL + APIID + "&intext=" + transcript;
        console.log(queryURL);

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
        } else {
            hasDefaultResponse = true;
        }

        if (!hasDefaultResponse) { // デフォルト返答に値するものがなかった時->天気返答
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
            } else {
                hasWeatherResponse = true;
            }
        }

        if (!hasDefaultResponse && !hasWeatherResponse) {// デフォルト返答も天気返答もない->サザン返答

            keys = Object.keys(southern_response);

            keys.forEach(function (key) {
                if (new RegExp(key).test(transcript)) {
                    let ans = southern_response[key][0].split(":");
                    let nowDate = new Date();
                    console.log(nowDate);

                    let nowTime = nowDate.getHours() * 60 + nowDate.getMinutes();
                    console.log(nowTime);
                    for (var i = 0; i < southern_response[key][1].length; i++) {
                        let t = southern_response[key][1][i].split(":");
                        let southernTime = Number(t[0]) * 60 + Number(t[1]);

                        let isLast = false;

                        if (southernTime > nowTime) {
                            // "平日ダイヤの次のサザンは : 発 特急サザン難波行きです。  あと : 分後に出発します。"
                            let m = southernTime - nowTime;
                            answer = ans[0] + t[0] + "時" + t[1] + "分" + ans[1] + m + ans[2];
                            break;
                        }

                        if (i == southern_response[key][1].length - 1) {
                            isLast = true;
                        }

                        if (isLast) {
                            answer = "終電を過ぎました。";
                        }
                    }


                }
            });

            if (typeof answer == 'undefined') {
                hasSouthernrResponse = false;
                //answer = "ごめんなさい。わかりません。";
            }
        }

        if (!hasDefaultResponse && !hasWeatherResponse && !hasSouthernResponse) {// どの返答にも当てはまらない->Yahoo

            // HTTPリクエストの準備
            const request = new XMLHttpRequest();
            request.open('GET', queryURL, true);
            request.responseType = 'json'; // レスポンスはJSON形式に変換

            // HTTPの状態が変化したときのイベントハンドラ
            request.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    // readyState == 4 操作完了
                    // status == 200 リクエスト成功（HTTPレスポンス）

                    let res = this.response; // 結果はJSON形式

                    Object.keys(res.result).forEach(function (key) {
                        console.log(key + ": " + res.result[key])
                    });

                    // method が SAY のときのみ
                    if (res.result.method == "SAY") {
                        answer = res.result.param_text_tts || res.result.param_text;
                    } else {
                        answer = "ごめんなさい。わかりません。";
                        //asr.start();  // 音声認識を再開
                    }
                }
            }

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
