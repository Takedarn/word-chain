// プレヤー情報を保持するための変数定義
// true = プレイヤー1, false = プレイヤー
let NowPlayerFlag = true; 2


// プレイヤー表示を更新する関数
function updatePlayerTurnAlert() {
    const playerTurnAlert = document.getElementById('NowGamePlayer');
    // プレイヤー情報を変える
    playerTurnAlert.innerHTML = `今は<strong>プレイヤー${NowPlayerFlag ? 1 : 2}</strong>のゲームターンです！<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>`;
}

// 現在のプレイヤー情報の応じて手札の表示を切り替える関数
function updateHandList() {
    // プレイヤー1の手札
    const player1HandItems = document.querySelectorAll('.player1-hand');
    // プレイヤー2の手札
    const playe2HandItems = document.querySelectorAll('.player2-hand');

    if (NowPlayerFlag) {
        player1HandItems.forEach(item => item.classList.remove('hidden'));
        player2HandItems.forEach(item => item.classList.add('hidden'));
    } else {
        player1HandItems.forEach(item => item.classList.add('hidden'));
        player2HandItems.forEach(item => item.classList.remove('hidden'));
    }
}


window.onload = async (event) => {
    // GET /shiritoriを実行
    const response = await fetch("/shiritori", { method: "GET" });
    // responseの中からレスポンスのテキストデータを取得
    const previousWord = await response.text();
    // id: previousWordのタグを取得
    const paragraph = document.querySelector("#previousWord");
    // 取得したタグの中身を書き換える
    paragraph.innerHTML = `前の単語: ${previousWord}`;
}


// ゲームリセットボタン押下時にリセット実行
document.getElementById('gameResetbutton').addEventListener('click', async function() {
    // サーバーにリセットリクエストを送信
    await fetch("/reset", { method: "POST" });
    // 入力フォームの値をクリア
    document.getElementById('nextWordInput').value = "";
    // リセットを通知する
    alert('リセットボタンが押されたのでゲームをリセットします！')
    // 表示をリセット
    document.getElementById('previousWord').innerHTML = "前の単語: しりとり";
    document.getElementById('nextWordHead').innerHTML = "次の先頭文字: り";
    // 手札をリセット
});


// 手札に追加ボタン押下時に実行
document.getElementById('addtoKeepingButton').addEventListener('click', function() {
    const nextWord = document.getElementById('nextWordInput').value.trim();
    if (nextWord) {
        const tefudaItems = document.querySelectorAll('.list-group-item');
        for (let i = 0; i < tefudaItems.length; i++) {
            if (tefudaItems[i].innerText.includes('ここに手札をセットできます')) {
                tefudaItems[i].innerText = nextWord;
                break;
            }
        }
        // 手札に追加した場合、もう一度入力する必要がある
        // ので、入力フォームないの単語(リストに追加ずみ)を削除する
        document.getElementById('nextWordInput').value = '';
    }
});


// 手札リストの要素をクリックしたときに、そのテキストを入力フォームに挿入する
const tefudaItems = document.querySelectorAll('.list-group-item');
tefudaItems.forEach(function(item) {
    item.addEventListener('click', function() {
        const tefudaText = this.innerText;
        if (!tefudaText.includes('ここに手札をセットできます')) {
            document.getElementById('nextWordInput').value = tefudaText;
        }
    });
});


// 送信ボタン押下時に実行
document.querySelector("#nextWordSendButton").onclick = async(event) => {
    // inputタグを取得
    const nextWordInput = document.querySelector("#nextWordInput");
    // inputの中身を取得
    const nextWordInputText = nextWordInput.value;


    // POST /shiritoriを実行
    // 次の単語をresponseに格納
    const response = await fetch(
        "/shiritori",
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nextWord: nextWordInputText })
        }
    );

    // status: 200以外が帰ってきた場合にエラーを表示
    if (response.status !== 200) {
        const errorJson = await response.text();
        const errorobj = JSON.parse(errorJson);
        alert(errorobj["errorMessage"]);
    }

    const previousWord = await response.text();

    // id: previousWordのタグを取得
    const paragraph = document.querySelector("#previousWord");
    // 取得したタグの中身を書き換える
    paragraph.innerHTML = `前の単語: ${previousWord}`;


    // id: nextWordHeadのタグ取得
    const nextWord = document.querySelector("#nextWordHead");
    // 取得したタグの中身を表示
    nextWord.innerHTML = `次の先頭文字: ${previousWord.slice(-1)}`;
    // inputタグの中身を消去する
    nextWordInput.value = "";

    // プレイヤーをトグル
    NowPlayerFlag = !NowPlayerFlag;
    updatePlayerTurnAlert();
}