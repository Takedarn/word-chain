// プレイヤー情報を保持するための変数定義
// false = プレイヤー1, true = プレイヤー2
let NowPlayerFlag = false;

// debag:
const NowP = document.querySelector("#nowplayervalue");
NowP.innerHTML = `(デバッグ用)現在のプレイヤ変数の値：${NowPlayerFlag}`;


// プレイヤーごとの手札を保持する変数
const player1Hand = [];
const player2Hand = [];

// 手札の表示を更新する関数
function updatePlayerHand() {
    const handList = NowPlayerFlag ? player1Hand : player2Hand;
    const handElements = document.querySelectorAll(`#player${NowPlayerFlag ? 1 : 2}-hand .list-group-item`);

    handElements.forEach((element, index) => {
        element.innerText = handList[index] || "ここに手札をセットできます。";
    });

    // 手札の表示を切り替える
    document.getElementById('player1-hand').classList.toggle('d-none', !NowPlayerFlag);
    document.getElementById('player2-hand').classList.toggle('d-none', NowPlayerFlag);
}

// プレイヤー表示を更新する関数
function updatePlayerTurnAlert() {
    const playerTurnAlert = document.getElementById('NowGamePlayer');
    playerTurnAlert.innerHTML = `今は<strong>プレイヤー${NowPlayerFlag ? 1 : 2}</strong>のゲームターンです！<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>`;
    updatePlayerHand();
}


// サーバーから前の単語を取得し、表示を更新する関数
async function fetchPreviousWord() {
    const response = await fetch("/shiritori", { method: "GET" });
    const previousWord = await response.text();
    document.querySelector("#previousWord").innerText = `前の単語: ${previousWord}`;
    document.getElementById('nextWordInput').placeholder = `次の先頭文字: ${previousWord.slice(-1)}`;
}

window.onload = async () => {
    await fetchPreviousWord();
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
    // 次に入力すべき文字を設定
    const nextWordHead = document.querySelector("#nextWordHead");
    nextWordHead.innerHTML = `次の先頭文字: ${previousWord.slice(-1)}`;
    // 入力フォームのプレースホルダーに次の先頭文字を表示
    await fetchPreviousWord();
}

// ゲームリセットボタン押下時にリセット実行
document.getElementById('gameResetbutton').addEventListener('click', async function() {
    // サーバーにリセットリクエストを送信
    await fetch("/reset", { method: "POST" });
    // 入力フォームの値をクリア
    document.getElementById('nextWordInput').value = "";
    // 手札の初期化
    player1Hand.length = 0;
    player2Hand.length = 0;
    updatePlayerHand();
    // リセットを通知する
    alert('リセットボタンが押されたのでゲームをリセットします！');
    NowPlayerFlag = false;
    // 表示をリセット
    document.getElementById('previousWord').innerHTML = "前の単語: しりとり";
    document.getElementById('nextWordInput').placeholder = "次の先頭文字: り";
    updatePlayerTurnAlert();
});

// 手札に追加ボタン押下時に実行
document.getElementById('addtoKeepingButton').addEventListener('click', function() {
    const nextWord = document.getElementById('nextWordInput').value.trim();
    if (nextWord) {
        const handList = NowPlayerFlag ? player1Hand : player2Hand;
        // リストの先頭に新しい単語を追加
        handList.unshift(nextWord);
        // リストの長さが3つを超えた場合は、最も古い要素を削除する
        if (handList.length > 3) {
            handList.pop();
        }
        // 手札の表示を更新
        document.getElementById('nextWordInput').value = '';
        updatePlayerHand();
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

    // プレイヤーをトグル
    NowPlayerFlag = !NowPlayerFlag;
    updatePlayerTurnAlert();


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

    // status: 200以外が帰ってきた場合にエラーを表示し、プレイヤーを切り替えない
    if (response.status !== 200) {
        const errorJson = await response.text();
        const errorobj = JSON.parse(errorJson);
        alert(errorobj["errorMessage"]);
        return;  // ここで処理を終了し、プレイヤーの切り替えや手札の更新を行わない
    }

    const previousWord = await response.text();
    document.querySelector("#previousWord").innerHTML = `前の単語: ${previousWord}`;
    document.getElementById('nextWordInput').placeholder = `次の先頭文字: ${previousWord.slice(-1)}`;
    nextWordInput.value = "";


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
}

