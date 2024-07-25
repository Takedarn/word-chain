import { serveDir } from "https://deno.land/std@0.223.0/http/file_server.ts";


// 直前の単語を保持しておくリスト
let previousWords = ["しりとり"]

// 入力の末尾が濁点or半濁音かチェックするためのベース
const dakutenCheckMap = ['が', 'ぎ', 'ぐ', 'げ', 'ご', 'ざ', 'じ', 'ず', 'ぜ', 'ぞ', 'だ', 'ぢ', 'づ', 'で', 'ど', 'ば', 'び', 'ぶ', 'べ', 'ぼ'];
const handakuonCheckMap = ['ぱ', 'ぴ', 'ぷ', 'ぺ', 'ぽ'];
const baseHiraganaMap = {
    'が': 'か',
    'ぎ': 'き',
    'ぐ': 'く',
    'げ': 'け',
    'ご': 'こ',
    'ざ': 'さ',
    'じ': 'し',
    'ず': 'す',
    'ぜ': 'せ',
    'ぞ': 'そ',
    'だ': 'た',
    'ぢ': 'ち',
    'づ': 'つ',
    'で': 'て',
    'ど': 'と',
    'ば': 'は',
    'び': 'ひ',
    'ぶ': 'ふ',
    'べ': 'へ',
    'ぼ': 'ほ',
    'ぱ': 'は',
    'ぴ': 'ひ',
    'ぷ': 'ふ',
    'ぺ': 'へ',
    'ぽ': 'ほ'
};


// サーバーの展開
Deno.serve(async (request) => {
    const pathname = new URL(request.url).pathname;
    console.log(`pathname: ${pathname}`);


    if (request.method === "GET" && pathname === "/shiritori") {
        return new Response(previousWords[previousWords.length - 1]);
    }


    if (request.method === "POST" && pathname === "/shiritori") {
        const requestJson = await request.json();
        let nextWord = requestJson["nextWord"];
        let previousWordLastChar = previousWords[previousWords.length - 1].slice(-1);
        let nextWordFirstChar = nextWord.slice(0, 1);


        // 　濁音および半濁音チェック
        let allowedChars = [previousWordLastChar];
        if (dakutenCheckMap.includes(previousWordLastChar) || handakuonCheckMap.includes(previousWordLastChar)) {
            previousWordLastChar = baseHiraganaMap[previousWordLastChar];
        }

        // 入力が空だった場合のエラーをアラートする
        if (nextWord.trim() === "") {
            return new Response(
                JSON.stringify({
                    "errorMessage": "入力が空です。単語を入力してください。",
                    "errorCode": "10003",
                }),
                {
                    status: 400,
                    headers: {"Content-Type": "application/json; charset=utf-8"}
                }
            );
        }

        // 入力が空ではない
        // previousWordの末尾とNextWordの先頭の一文字を比較する(一致した場合)
        if (previousWordLastChar === nextWordFirstChar || allowedChars.includes(nextWordFirstChar)) {
            // 末尾が「ん」: ゲームオーバー
            if (nextWord.slice(-1) === "ん") {
                return new Response(
                    JSON.stringify({
                        "errorMessage": "末尾が「ん」です。ゲームオーバー！",
                        "errorCode": "10001",
                    }),
                    {
                        status: 400,
                        headers: {"Content-Type": "application/json; charset=utf-8"}
                    }
                );
            }

            // 入力中にひらがな以外:　再度入力を促す
            if (!nextWord.match(/^[ぁ-んー]+$/)) {
                return new Response(
                    JSON.stringify({
                        "errorMessage": "入力はひらがなのみにしてください。",
                        "errorCode": "10001",
                    }),
                    {
                        status: 400,
                        headers: {"Content-Type": "application/json; charset=utf-8"}
                    }
                );
            }

            // 履歴リスト内に過去入力した単語が存在:　繰り返しの入力によるゲームオーバー
            if (previousWords.includes(nextWord)) {
                // ゲームオーバーなのでしりとりの履歴リストを初期化
                previousWords = ["しりとり"];
                // 入力フォームの値を初期化


                return new Response(
                    JSON.stringify({
                        "errorMessage": "この単語は既に使われています。ゲームオーバー！" +
                            "ゲームを最初にリセットします",
                        "errorCode": "10002",
                    }),
                    {
                        status: 400,
                        headers: {"Content-Type": "application/json; charset=utf-8"}
                    }
                );
            }

            // 上記の条件を全てパスした場合: 正しい入力としてリストに追加する
            previousWords.push(nextWord);
        } else {
            // previousWordの末尾とNextWordの先頭の一文字を比較する(一致しない場合)
            return new Response(
                JSON.stringify({
                    "errorMessage": `前の単語に続いていません！`,
                    "errorCode": "10001",
                }),
                {
                    status: 400,
                    headers: {"Content-Type": "application/json; charset=utf-8"}
                }
            );
        }

        return new Response(previousWords[previousWords.length - 1]);
    }

    // reset
    if (request.method === "POST" && pathname === "/reset") {
        // リセットリクエストが来たときにしりとりの履歴リストを初期化する
        previousWords = ["しりとり"];
        return new Response("リセットしました");
    }

    return serveDir(
        request,
        {
            fsRoot: "./public",
            urlRoot: "",
            enableCors: true,
        }
    );
});