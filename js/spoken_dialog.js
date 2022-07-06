// 応答の定義（ハッシュ）    
var response = {
    ".*あなた.*誰.*": "わたしはアレクサではありません",
    ".*名前は.*": "内緒です",
    ".*何歳.*": "え、わたし、何歳にみえますか",
    ".*元気.*": "元気ですよー",
    ".*好きな.*色.*": "オレンジです",
    ".*夢は.*": "世界を冒険することです",
    ".*好きな.*スポーツ.*": "けん玉です",
    ".*好きな.*食べ物.*": "焼肉です",
    ".*和歌山.*天気.*": "和歌山の天気はたぶん晴れでしょう",
    ".*大阪.*天気.*": "大阪の天気は雨です。",
    ".*明日.*天気.*": "明日の天気は曇りだと思います",
    ".*明日.*和歌山.*天気.*": "明日の和歌山の天気はずばり雪です"
};

/* TODO: jQueryの残骸*/
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



const startButton = document.querySelector('#startButton'); // 開始ボタン
const stopButton = document.querySelector('#stopButton'); // 停止ボタン
const resultOutput = document.querySelector('#resultOutput'); // 結果出力エリア

if (!'SpeechSynthesisUtterance' in window) {
    alert("あなたのブラウザはSpeech Synthesis APIに未対応です。");
}
const tts = new SpeechSynthesisUtterance(); // TTSインスタンスを生成
//tts.text = textForm.value; // テキストを設定
tts.lang = "ja-JP"; // 言語(日本語)、英語の場合はen-US
tts.rate = 1.0; // 速度
tts.pitch = 1.0; // 声の高さ
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

// 認識結果が出力されたときのイベントハンドラ
asr.onresult = function (event) {
    let transcript = event.results[event.resultIndex][0].transcript; // 結果文字列

    let output_not_final = '';
    if (event.results[event.resultIndex].isFinal) { // 結果が確定（Final）のとき
        asr.abort(); // 音声認識を停止

        let answer;

        let keys = Object.keys(response);
        
        
        keys.forEach(function (key) {
            if (new RegExp(key).test(transcript)) { // 正規表現をtestしてtrue or false
                answer = response[key];
                console.log(key + " : " + answer);
            }
        });
        
       for(i = 0; i < obj.response_data.length; i++){
        if(obj.response_data[i]!= null){
            elem.innerHTML += "<div>" + obj.data[i].key + " : " + obj.data[i].answer + "</div>";
        }
       }

        if (typeof answer == 'undefined') {
            answer = "ごめんなさい。わかりません。";
        }

        output += transcript + ' => ' + answer + '<br>';

        tts.text = answer;
        // 再生が終了（end）ときのイベントハンドラ（終了したときに実行される）
        tts.onend = function (event) {
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