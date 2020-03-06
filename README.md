# SlackNowPlaying
Spotifyで聞いてる曲をSlackのstatusに反映させるやつ

# つかいかた

- `main.gs` でgasを作成する
- `[公開]-[ウェブアプリケーションとして公開]` でgasを公開する
- ライブラリにOauth2を導入する
  - 以下のIDでOauth2が入るはず
  - `1B7FSrk5Zi6L1rSxxTDgDEUsPzlukDsi4KGuTMorsTQHhGBzBkMun4iDF`
- Spotifyアプリを作成する
  - [Spotify for Developers](https://developer.spotify.com/dashboard/login) で作成する
- SpotifyアプリにOauthのRedirect URIsを指定する
  - `https://script.google.com/macros/d/{script_id}/usercallback`
  - `scprit_id` は `[ファイル]-[プロジェクトのプロパティ]` のスクリプトID
- Spotifyアプリの `client id` と `client secret` をスクリプトのプロパティに登録する
  - `[ファイル]-[プロジェクトのプロパティ]` から登録できる
  - 登録するのは次の二つ
  - SPOTIFY_CLIENT_ID
  - SPOTIFY_CLIENT_SECRET
- Slackアプリを作成する
  - [Slack api](https://api.slack.com/apps) で作成する
- SlackアプリにOauthのRedirect URIsを指定する
  - `https://script.google.com/macros/d/{script_id}/usercallback`
  - `scprit_id` は `[ファイル]-[プロジェクトのプロパティ]` のスクリプトID
- SlackアプリにPermissionを設定する
  - `User Token Scopes` に `users.profile:write` を指定する
- Slackアプリの `client id` と `client secret` をスクリプトのプロパティに登録する
  - `[ファイル]-[プロジェクトのプロパティ]` から登録できる
  - 登録するのは次の二つ
  - SLACK_CLIENT_ID
  - SLACK_CLIENT_SECRET
- Slackアプリを使用したいワークスペースに登録する
- `[公開]-[ウェブアプリケーションとして公開]` でgasを更新する
  - `Project version` を `new` にしておくこと
