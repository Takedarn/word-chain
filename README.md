# wordchain
ゲーム戦略を追加したしりとりゲーム
## 使用技術
### 言語等
- Javascript
- html/css
### ライブラリ・フレームワーク等
- Deno
- Bootstrap
### API等
単語 日英／英日辞書 (WordNet)

https://www.apibank.jp/ApiBank/api/detail?api_no=31&api_type=A

### フォント


## 実装した機能やデザインの説明
### 最低限満たすべき仕様
- ☑️直前の単語を、表示できるようにする
- ☑️任意の単語を、入力できるようにする
- ☑️直前の単語の末尾と入力した単語の先頭が同じ場合だけ単語を更新する。違う場合は、エラーを表示する
- ☑️末尾が「ん」で終わる単語が入力されたら、ゲームを終了する
- ☑️過去に使用した単語が入力されたら、ゲームを終了する
- ☑️ゲーム中や終了後に、最初からやり直せるリセット機能をつける
### 提出に際して追加した要素
- 魅力的な対戦要素の追加要素
  - 3つまでワードを保持できて好きなタイミングで利用できる
    - ゲーム終盤の単語が連想できなくなった場合の切り札
    - あえて削除・入れ替えをできない仕様にすることで慎重にしなければならない駆け引き的な戦略が必要になる面白さ
  - 入力に対する追加要素
    - 入力単語が日本語単語として存在しているかの判定
      - 同義語辞書 (WordNet)APIを利用して判定した
    - 入力の最後が小文字で終わった場合の大文字への変換機能
      - 小文字から始まる日本語単語は存在しないため
    - 濁点つき <-> 濁点なし入力の許容
### 追加した要素の詳細な説明
#### 3つまでワードを保持できるゲーム性
一般に、しりとりはゲームが終盤になる程、思いつく単語の幅が狭まってきて苦しい。また、「わ」から始める単語など、
そもそもの単語数が少ない。ここにゲーム性を見出すことにした。例えば、「わ」から始める単語を考える局面で「わんこ」「わに」という2つの単語を思いついたとした時、どちらか一方を入力として用いて、もう片方は手札にキープできる。キープしたワードはゲーム中の
任意のタイミングで使うことができる。そこで以下の3つのゲーム性が生まれる。
- どの文字から始める単語をキープするのか(自衛的選択：自分が思いつくのが難しそうな文字から始める単語をキープする)
- どの文字で終わる単語をキープするのか(攻撃的選択：相手が思いつくのが難しそうな文字で終わる単語をキープする)

手札はゲーム中の任意のタイミングで３つまで保持できるものとし、新しい単語を追加する時は古い単語から削除される

-どのタイミングで手札を増やすのか(相手の手札を見ながら自らの手札を考える戦略が必要)

#### 同義語辞書API
サンプルコードでは入力された単語が存在するかを判定しておらず、造語でも入力を許していた。
そこで、同義語辞書API
を利用することで入力単語が存在する単語かの判定を行った。このAPIでは入力された単語が存在している場合は、
その単語の類義語をリストで返す。リストで返ってきたと言うことはその単語が辞書に登録されているとみなして
入力フォームに入力された単語をしりとりゲームの入力として許すことを考えた。


## アプリの動作確認の方法（WebサイトのURLや、セットアップを含めたアプリケーションの実行手順等
### ローカル環境への動かし方
#### Denoのインストール
```
curl -fsSL https://deno.land/install.sh | sh
```
リポジトリをクローンした後、server.jsが存在するディレクトリ内で以下のコマンドを実行：
```
deno run --allow-net --watch server.js
```
localhostにサーバが立ち上がるのでterminal内に表示されたリンクから開いて下さい。

#### ローカル環境では日本語辞書の会員登録(無料)が必要です。
API Keyの取得が必要であり、そのためには会員登録をする必要があります。
https://www.apibank.jp/ApiBank/service/use-guide#ugJoinStart

## 参考にしたWebサイト
- BootStrap document

https://getbootstrap.jp/docs/4.2/getting-started/introduction/

- Mozilla document(Java Script)

https://developer.mozilla.org/ja/docs/Web/JavaScript





