// 変数定義
// プレイヤー情報を保持するための変数定義
// false = プレイヤー1, true = プレイヤー2
let NowPlayerFlag = false; //　ゲーム起動時はプレイヤー1からスタートする

// プレイヤー各人のHPを保持する変数
let player1HP = 100;
let player2HP = 100;

// 単語を送信するまでにかかった時間を測るタイマー
let startTime;

// プレイヤーごとの手札を保持する変数
const player1Hand = [];
const player2Hand = [];

// プレイヤーネームを保持する変数
let player1Name = "";
let player2Name = "";




// モーダルウィンドウ
document.addEventListener('DOMContentLoaded', function Show_modal() {
    // モーダルウィンドウの表示
    const myModal = new bootstrap.Modal(document.getElementById('myModal'));
    myModal.show();

    // モーダルウィンドウないの入力チェック
    document.getElementById('gameStartButton').addEventListener('click', function () {
        player1HP = 100;
        player2HP = 100;

        const player1Name = document.getElementById('player1Name').value.trim();
        const player2Name = document.getElementById('player2Name').value.trim();

        if (player1Name && player2Name) {
            // プレイヤー名を格納
            localStorage.setItem('player1Name', player1Name);
            localStorage.setItem('player2Name', player2Name);

            // モーダルウィンドウを閉じる
            myModal.hide();
            // 背景を消すための処理
            document.querySelector('.modal-backdrop').remove();

            // プレイヤー名を表示
            updatePlayerTurnAlert();
            updateHPDisplay();
            NowPlayerFlag = false;
            startGame();
        } else {
            alert('プレイヤー名を入力してください。');　// 入力を再度促す
        }
    });
});

// ゲーム開始時の処理
function startGame() {
    startTime = new Date();
    // その他の初期化処理があればここに追加
}


// HP表示を更新する関数
function updateHPDisplay() {
    document.getElementById('player1HP').innerText = `プレイヤー1のHP: ${player1HP}`;
    document.getElementById('player2HP').innerText = `プレイヤー2のHP: ${player2HP}`;
}

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
    const player1Name = localStorage.getItem('player1Name') || 'プレイヤー1';
    const player2Name = localStorage.getItem('player2Name') || 'プレイヤー2';
    playerTurnAlert.innerHTML = `今は<strong>${NowPlayerFlag ? player2Name : player1Name}</strong>のゲームターンです！<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>`;
}


// サーバーから前の単語を取得し、表示を更新する関数
async function fetchPreviousWord() {
    const response = await fetch("/shiritori", {method: "GET"});
    const previousWord = await response.text();
    document.querySelector("#previousWord").innerText = `前の単語: ${previousWord}`;
    document.getElementById('nextWordInput').placeholder = `次の先頭文字: ${previousWord.slice(-1)}`;
}

window.onload = async () => {
    await fetchPreviousWord();
}

window.onload = async (event) => {
    // GET /shiritoriを実行
    const response = await fetch("/shiritori", {method: "GET"});

    // debag:
    const NowP = document.querySelector("#nowplayervalue");
    NowP.innerHTML = `(デバッグ用)現在のプレイヤ変数の値：${NowPlayerFlag}`;

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
document.getElementById('gameResetbutton').addEventListener('click', async function () {

});

// 手札に追加ボタン押下時に実行
document.getElementById('addtoKeepingButton').addEventListener('click', function () {
    const nextWord = document.getElementById('nextWordInput').value.trim();
    if (nextWord) {
        const handList = NowPlayerFlag ? player1Hand : player2Hand;
        // リストの長さが3ついないの場合はリストの先頭に追加する
        if (handList.length < 3) {
            // リストの先頭に新しい単語を追加
            handList.unshift(nextWord);
        }　else {
            alert("手札は3つまでしか追加できません")
        }
        // リストに追加したので入力フォームに入っている単語を消す
        document.getElementById('nextWordInput').value = '';
        // 手札の表示を更新
        updatePlayerHand();
    }
});

// 手札リストの要素をクリックしたときに、そのテキストを入力フォームに挿入する
const tefudaItems = document.querySelectorAll('.list-group-item');
tefudaItems.forEach(function (item) {
    item.addEventListener('click', function () {
        const tefudaText = this.innerText;
        if (!tefudaText.includes('ここに手札をセットできます')) {
            document.getElementById('nextWordInput').value = tefudaText;
        }
    });
});


document.querySelector("#nextWordSendButton").addEventListener('click', async (event) => {
    // 単語送信前のタイマーとダメージ計算
    const endTime = new Date();
    const elapsedTime = (endTime - startTime) / 1000; // 経過時間を秒単位で計算
    let damage = calculateDamage(elapsedTime);

    // プレイヤーのHPを更新
    if (NowPlayerFlag) {
        player2HP -= damage;
        if (player2HP <= 0) {
            alert('プレイヤー2のHPが0になりました。プレイヤー1の勝利です！');
            resetGame(true);
            return;
        }
    } else {
        player1HP -= damage;
        if (player1HP <= 0) {
            alert('プレイヤー1のHPが0になりました。プレイヤー2の勝利です！');
            resetGame(true);
            return;
        }
    }

    updateHPDisplay();

    // サーバーへの単語送信
    const nextWordInput = document.querySelector("#nextWordInput");
    const nextWordInputText = nextWordInput.value;
    const response = await fetch(
        "/shiritori",
        {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({nextWord: nextWordInputText})
        }
    );

    if (response.status !== 200) {
        const errorJson = await response.text();
        const errorobj = JSON.parse(errorJson);
        alert(errorobj["errorMessage"]);
        nextWordInput.value = "";
        return;  // エラーが発生した場合の処理
    }

    const previousWord = await response.text();
    document.querySelector("#previousWord").innerHTML = `前の単語: ${previousWord}`;
    document.getElementById('nextWordInput').placeholder = `次の先頭文字: ${previousWord.slice(-1)}`;
    nextWordInput.value = "";

    // プレイヤーをトグル
    NowPlayerFlag = !NowPlayerFlag;
    updatePlayerTurnAlert();
    updatePlayerHand();

    // 次のターンのためにタイマーをリセット
    startGame();

    // デバッグ用の情報表示
    const NowP = document.querySelector("#nowplayervalue");
    NowP.innerHTML = `(デバッグ用)現在のプレイヤ変数の値：${NowPlayerFlag}`;
});

// ダメージを計算する関数
function calculateDamage(elapsedTime) {
    if (elapsedTime <= 5) {
        return 0; // 5秒以内の送信で0ダメージ
    } else if (elapsedTime <= 10) {
        return 1;　//10秒以内の送信で1ダメージ
    } else if (elapsedTime <= 20) {
        return 10; // 20秒以内の送信で10ダメージ
    } else {
        return 20;　// それ以上の時間で20ダメージ
    }
}



// ゲームをリセットする関数
async function resetGame(resetFlag = false) {
    // サーバーにリセットリクエストを送信
    await fetch("/reset", {method: "POST"});
    // 入力フォームの値をクリア
    document.getElementById('nextWordInput').value = "";
    // 手札の初期化
    player1Hand.length = 0;
    player2Hand.length = 0;
    updatePlayerHand();
    if (!resetFlag) {
        // リセットを通知する
        alert('リセットボタンが押されたのでゲームをリセットします！');
    }
    // ゲームプレイヤーのリセット
    NowPlayerFlag = false;
    // 表示をリセット
    document.getElementById('previousWord').innerHTML = "前の単語: しりとり";
    document.getElementById('nextWordInput').placeholder = "次の先頭文字: り";
    updatePlayerTurnAlert();
    // ページのリロード
    location.reload();
}

// ゲームリセットボタンのイベントリスナー
document.getElementById('gameResetbutton').addEventListener('click', () => {
    resetGame();
});