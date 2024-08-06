# wordchain
ゲーム戦略を追加したしりとりゲーム
## 使用技術
### 言語等
- Javascript
- html/css
### ライブラリ・フレームワーク等
- Deno 1.45.5
- Bootstrap 5
### その他
- Google Font

## 実装した機能やデザインの説明
### 最低限満たすべき仕様
✅直前の単語を、表示できるようにする

✅任意の単語を、入力できるようにする

✅直前の単語の末尾と入力した単語の先頭が同じ場合だけ単語を更新する。違う場合は、エラーを表示する

✅末尾が「ん」で終わる単語が入力されたら、ゲームを終了する

✅過去に使用した単語が入力されたら、ゲームを終了する

✅ゲーム中や終了後に、最初からやり直せるリセット機能をつける
### 提出に際して追加した要素
- 魅力的な対戦要素の追加要素
  - 体力ケージの追加
    - 単語入力して送信するまでの時間によってダメージを与える 
  - 3つまでワードを保持できて好きなタイミングで利用できる
    - ゲーム終盤の単語が連想できなくなった場合の切り札
    - あえて削除・入れ替えをできない仕様にすることで慎重にしなければならない駆け引き的な戦略が必要になる面白さ
  - 入力に対する追加要素
    - 入力中にひらがな以外が入っていた場合の再入力指示
    - 入力の最後が小文字で終わった場合の大文字への変換機能
      - 小文字から始まる日本語単語は存在しないため
    - 濁点つき <-> 濁点なし入力の許容
  - ゲームロード時にプレイヤー名を入力させる
    - ゲームターン性を導入しているのでどちらのターンなのかわかるようにした
    
### 追加した要素の詳細な説明
#### 🎯3つまでワードを保持できるゲーム性
一般に、しりとりはゲームが終盤になる程、思いつく単語の幅が狭まってきて苦しい。また、「わ」から始める単語など、
そもそもの単語数が少ない。ここにゲーム性を見出すことにした。例えば、「わ」から始める単語を考える局面で「わんこ」「わに」という2つの単語を思いついたとした時、どちらか一方を入力として用いて、もう片方は手札にキープできる。キープしたワードはゲーム中の
任意のタイミングで使うことができる。そこで以下の3つのゲーム性が生まれる。
- どの文字から始める単語をキープするのか(自衛的選択：自分が思いつくのが難しそうな文字から始める単語をキープする)

- どの文字で終わる単語をキープするのか(攻撃的選択：相手が思いつくのが難しそうな文字で終わる単語をキープする)

手札はゲーム中の任意のタイミングで３つまで保持できるものとし、それ以上の追加・既に追加されいてる手札の削除はできないものとしている。一度追加してしまえば後戻りはできないので慎重に追加するタイミング・単語を選定しなければならない。
どのタイミングで手札を増やすのか(相手の手札を見ながら自らの手札を考える戦略が必要)というゲーム戦略性が追加される。

というゲーム性が追加される。
#### 🎯HPの設定
- 各プレイヤーはゲームスタート時に体力を100ずつ持っています。自分のターンになった時にタイマーが作動し、単語を送信するまでの時間によって以下の設定でのダメージが加えられます。
  - 5秒以内 
    - 0ダメージ
  - 5-10秒
    - 1ダメージ
  - 11-20秒以内
    - 10ダメージ
  - 21秒以上
    - 20ダメージ
- しりとりのルールに加えてHPが0になった時点でゲームオーバーとなります。


## Usage
### デプロイ先
基本的には以下のリンクで利用できます

https://harukitaked-word-chain.deno.dev/

### ローカル環境への動かし方
#### 1. Denoのインストール
```
curl -fsSL https://deno.land/install.sh | sh
```
#### 2. インストール完了時の表示にしたがって.bashrcなどに設定をする必要があります
```
export DENO_INSTALL="/c/Users/<User name>/.deno"
export PATH="$DENO_INSTALL/bin:$PATH"
```
#### 3. リポジトリをクローンした後、server.jsが存在するディレクトリ内で以下のコマンドを実行：
```
deno run --allow-net --watch server.js
```
localhostにサーバが立ち上がるのでterminal内に表示されたリンクから開いて下さい。


## 参考にしたWebサイト
### 公式ドキュメント
- BootStrap document: 
https://getbootstrap.jp/docs/4.2/getting-started/introduction/

- Mozilla document(Java Script): 
https://developer.mozilla.org/ja/docs/Web/JavaScript

- Deno Doc: https://doc.deno.land/ 






