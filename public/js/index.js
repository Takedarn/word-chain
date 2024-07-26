// =============================
// プレイヤー情報の保持
// =============================
let NowPlayerFlag = false; // ゲーム起動時はプレイヤー1からスタート
let player1HP = 100;
let player2HP = 100;
let startTime;
const player1Hand = [];
const player2Hand = [];
let player1Name = "";
let player2Name = "";

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
function startGame() {
    startTime = new Date();
    // その他の初期化処理があればここに追加
}

// =============================
// ゲーム状態の更新関数
// =============================
function updateHPDisplay() {
    document.getElementById('player1HP').innerText = `プレイヤー1のHP: ${player1HP}`;
    document.getElementById('player2HP').innerText = `プレイヤー2のHP: ${player2HP}`;
}

function updatePlayerHand() {
    const handList = NowPlayerFlag ? player2Hand : player1Hand;
    const handElements = document.querySelectorAll(`#player${NowPlayerFlag ? 2 : 1}-hand .list-group-item`);

    handElements.forEach((element, index) => {
        element.innerText = handList[index] || "ここに手札をセットできます。";
    });

    document.getElementById('player1-hand').classList.toggle('d-none', NowPlayerFlag);
    document.getElementById('player2-hand').classList.toggle('d-none', !NowPlayerFlag);
}

function updatePlayerTurnAlert() {
    const playerTurnAlert = document.getElementById('NowGamePlayer');
    const player1Name = localStorage.getItem('player1Name') || 'プレイヤー1';
    const player2Name = localStorage.getItem('player2Name') || 'プレイヤー2';
    playerTurnAlert.innerHTML = `今は<strong>${NowPlayerFlag ? player2Name : player1Name}</strong>のゲームターンです！<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>`;
}

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

document.querySelectorAll('.list-group-item').forEach(item => {
    item.addEventListener('click', function () {
        const tefudaText = this.innerText;
        if (!tefudaText.includes('ここに手札をセットできます')) {
            document.getElementById('nextWordInput').value = tefudaText;
        }
    });
});

document.querySelector("#nextWordSendButton").addEventListener('click', async () => {
    const nextWordInput = document.querySelector("#nextWordInput");
    const nextWordInputText = nextWordInput.value;

    const response = await fetch("/shiritori", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({nextWord: nextWordInputText})
    });

    if (response.status !== 200) {
        const errorJson = await response.text();
        const errorobj = JSON.parse(errorJson);
        alert(errorobj["errorMessage"]);
        nextWordInput.value = "";
        return;
    }

    const endTime = new Date();
    const elapsedTime = (endTime - startTime) / 1000;
    let damage = calculateDamage(elapsedTime);

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

    const previousWord = await response.text();
    document.querySelector("#previousWord").innerHTML = `前の単語: ${previousWord}`;
    document.getElementById('nextWordInput').placeholder = `次の先頭文字: ${previousWord.slice(-1)}`;
    nextWordInput.value = "";

    NowPlayerFlag = !NowPlayerFlag;
    updatePlayerTurnAlert();
    updatePlayerHand();

    startGame();
});

// =============================
// ゲームロジック関数
// =============================
function calculateDamage(elapsedTime) {　// 単語を入力する時間に応じたダメージを自らに加える
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
async function resetGame(resetFlag = false) {
    await fetch("/reset", {method: "POST"});
    document.getElementById('nextWordInput').value = "";
    player1Hand.length = 0;
    player2Hand.length = 0;
    updatePlayerHand();
    if (!resetFlag) {
        alert('リセットボタンが押されたのでゲームをリセットします！');
    }
    NowPlayerFlag = false;
    document.getElementById('previousWord').innerHTML = "前の単語: しりとり";
    document.getElementById('nextWordInput').placeholder = "次の先頭文字: り";
    updatePlayerTurnAlert();
    location.reload();
}
