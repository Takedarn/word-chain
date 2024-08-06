// =============================
// プレイヤー情報の保持
// =============================
let NowPlayerFlag = false; // ゲーム起動時はプレイヤー1からスタート
let player1HP = 100;       // プレイヤー1のHP
let player2HP = 100;       // プレイヤー1のHP
let startTime;             // 入力が完了するまでの時間を図るタイマー 
const player1Hand = [];    //　プレイヤー2の手札
const player2Hand = [];    //　プレイヤー2の手札
let player1Name = "";      //　プレイヤー1の名前
let player2Name = "";      // プレイヤー2の手札


// =============================
// DOMの読み込み完了時の処理
// =============================
document.addEventListener('DOMContentLoaded', function () {
    // モーダルウィンドウの表示
    const myModal = new bootstrap.Modal(document.getElementById('myModal'));
    myModal.show();

    // ゲーム開始ボタンのイベントリスナー
    document.getElementById('gameStartButton').addEventListener('click', function () {
        player1HP = 100;
        player2HP = 100;

        player1Name = document.getElementById('player1Name').value.trim();
        player2Name = document.getElementById('player2Name').value.trim();

        if (player1Name && player2Name) {
            localStorage.setItem('player1Name', player1Name);
            localStorage.setItem('player2Name', player2Name);

            myModal.hide();
            document.querySelector('.modal-backdrop').remove();

            updatePlayerTurnAlert();
            updateHPDisplay();
            NowPlayerFlag = false;
            startGame();
        } else {
            alert('プレイヤー名を入力してください。');
        }
    });

    // ゲームリセットボタンのイベントリスナー
    document.getElementById('gameResetbutton').addEventListener('click', () => {
        resetGame();
    });
});


// =============================
// ゲーム開始時の処理
// =============================
//　ゲームをスタートさせる
function startGame() {
    startTime = new Date();
}

// =============================
// ゲーム状態の更新関数
// =============================
// HPを更新する
function updateHPDisplay() {
    document.getElementById('player1HP').innerText = `プレイヤー1のHP: ${player1HP}`;
    document.getElementById('player2HP').innerText = `プレイヤー2のHP: ${player2HP}`;
}

// プレイヤーの手札を更新する
function updatePlayerHand() {
    const handList = NowPlayerFlag ? player2Hand : player1Hand;
    const handElements = document.querySelectorAll(`#player${NowPlayerFlag ? 2 : 1}-hand .list-group-item`);

    handElements.forEach((element, index) => {
        element.innerText = handList[index] || "ここに手札をセットできます。";
    });

    document.getElementById('player1-hand').classList.toggle('d-none', NowPlayerFlag);
    document.getElementById('player2-hand').classList.toggle('d-none', !NowPlayerFlag);
}

// プレイヤーの手札を切り替える
function updatePlayerTurnAlert() {
    const playerTurnAlert = document.getElementById('NowGamePlayer');
    const player1Name = localStorage.getItem('player1Name') || 'プレイヤー1';
    const player2Name = localStorage.getItem('player2Name') || 'プレイヤー2';
    playerTurnAlert.innerHTML = `今は<strong>${NowPlayerFlag ? player2Name : player1Name}</strong>のゲームターンです！<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>`;
}

// 前の単語を引き出す
async function fetchPreviousWord() {
    const response = await fetch("/shiritori", {method: "GET"});
    const previousWord = await response.text();
    document.querySelector("#previousWord").innerText = `前の単語: ${previousWord}`;
    document.getElementById('nextWordInput').placeholder = `次の先頭文字: ${previousWord.slice(-1)}`;
}

window.onload = async () => {
    await fetchPreviousWord();
}

// =============================
// イベントリスナー
// =============================
//　手札に追加ボタン押下時に実行
document.getElementById('addtoKeepingButton').addEventListener('click', () => {
    const nextWord = document.getElementById('nextWordInput').value.trim();
    if (nextWord) {
        const handList = NowPlayerFlag ? player2Hand : player1Hand;
        if (handList.length < 3) {
            handList.unshift(nextWord);
        } else {
            alert("手札は3つまでしか追加できません");
        }
        document.getElementById('nextWordInput').value = '';
        updatePlayerHand();
    }
});

//　手札から単語を入力フォームに移動する
document.querySelectorAll('.list-group-item').forEach(item => {
    item.addEventListener('click', function () {
        const tefudaText = this.innerText;
        if (!tefudaText.includes('ここに手札をセットできます')) {
            document.getElementById('nextWordInput').value = tefudaText;
        }
    });
});

//　送信ボタン押下時に実行する
document.querySelector("#nextWordSendButton").addEventListener('click', async () => {
    const nextWordInput = document.querySelector("#nextWordInput");
    const nextWordInputText = nextWordInput.value;

    const response = await fetch("/shiritori", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({nextWord: nextWordInputText})
    });

    // レスポンスがエラーの時
    // エラーコードによって処理を変える
    if (response.status !== 200) {
        const errorJson = await response.text();
        const errorobj = JSON.parse(errorJson);
        const errorCode = errorobj["errorCode"];
        
        switch(errorCode) {
            case "10001":
                // 入力が空なので再度入力を促す。
                alert("入力が空です。単語を入力してください。");
                break;
            case "10002":
                // 末尾が「ん」で終わるのでゲームオーバーにする
                alert("末尾が「ん」です。ゲームオーバー！");
                resetGame(true);
                break;
            case "10003":
                // 入力はひらがなのみ受け付けるので再度入力を促す
                alert("入力はひらがなのみにしてください。");
                break;
            case "10004":
                // この単語は既に使われているのでゲームオーバーにする
                alert("使用済みの単語です。ゲームオーバー！");
                resetGame(true);
                break;
            case "10005":
                // 前の単語に続いていないので再度入力を促す
                alert("前の単語に続いていません！");
                break;
            default:
                alert(errorobj["errorMessage"]);
        }
        
        nextWordInput.value = "";
        return;
    }

    // レスポンスが成功時の処理
    // プレイヤーが単語送信までにかかった時間を図ってダメージ計算する
    const endTime = new Date();
    const elapsedTime = (endTime - startTime) / 1000;
    let damage = calculateDamage(elapsedTime);
    // ダメージを与えて0になったらゲーム終了
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

    // HPの表示を更新する
    updateHPDisplay();
    // 入力フォームに入力された単語を取得する
    const previousWord = await response.text();
    document.querySelector("#previousWord").innerHTML = `前の単語: ${previousWord}`;
    document.getElementById('nextWordInput').placeholder = `次の先頭文字: ${previousWord.slice(-1)}`;
    // 入力フォームの値を空にする
    nextWordInput.value = "";
    // プレイヤーに関する状態をリセットする
    NowPlayerFlag = !NowPlayerFlag;
    updatePlayerTurnAlert();
    updatePlayerHand();

    // ゲームスタート画面に遷移する
    startGame();
});

// =============================
// ゲームロジック関数
// =============================
// // 単語を入力する時間に応じたダメージを自らに加えるための関数
function calculateDamage(elapsedTime) { 
    if (elapsedTime <= 5) {
        return 0; // 5秒以内の送信で0ダメージ
    } else if (elapsedTime <= 10) {
        return 1; // 10秒以内の送信で1ダメージ
    } else if (elapsedTime <= 20) {
        return 10; // 20秒以内の送信で10ダメージ
    } else {
        return 20; // それ以上の時間で20ダメージ
    }
}

// =============================
// ゲームリセット関数
// =============================
//　ゲームをリセットするための関数
async function resetGame(resetFlag = false) {
    await fetch("/reset", {method: "POST"});
    document.getElementById('nextWordInput').value = "";
    player1Hand.length = 0;
    player2Hand.length = 0;
    document.getElementById('previousWord').innerHTML = "前の単語: しりとり";
    document.getElementById('nextWordInput').placeholder = "次の先頭文字: り";
    updatePlayerHand();
    if (!resetFlag) {
        alert('リセットボタンが押されたのでリセットします');
    }
    NowPlayerFlag = false;
    updatePlayerTurnAlert();
    location.reload();
}
