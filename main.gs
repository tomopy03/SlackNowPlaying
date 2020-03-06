var SPOTIFY_CLIENT_ID = PropertiesService.getScriptProperties().getProperty("SPOTIFY_CLIENT_ID");
var SPOTIFY_CLIENT_SECRET = PropertiesService.getScriptProperties().getProperty("SPOTIFY_CLIENT_SECRET");
// OAuth2認証
// getSpotifyServiceの作成
function getSpotifyService() {
  return OAuth2.createService('spotify')
  // 認証用URL
  .setAuthorizationBaseUrl('https://accounts.spotify.com/authorize')
  // Token取得用URL
  .setTokenUrl('https://accounts.spotify.com/api/token')
  // SPOTIFY_CLIENT_ID
  .setClientId(SPOTIFY_CLIENT_ID)
  // SPOTIFY_CLIENT_SECRET
  .setClientSecret(SPOTIFY_CLIENT_SECRET)
  // 認証完了時用コールバック関数名
  .setCallbackFunction('spotifyAuthCallback')
  // 認証情報格納先
  // アクセストークンやリフレッシュトークンや、有効期限などが格納
  .setPropertyStore(PropertiesService.getUserProperties())
  // 現在試聴中のデータがとりたいので必要なscopeを定義
  // 複数必要な場合は半角スペース区切りで設定
  .setScope('user-read-currently-playing');
};
// 認証完了時用コールバック関数
// アクセストークンなどの情報をユーザー毎のキャッシュに格納
function spotifyAuthCallback(request) {
  var spotifyService = getSpotifyService();
  // handleCallback でアクセストークンなどを propertyStore に格納する
  var isAuthorized = spotifyService.handleCallback(request);
  
  if (isAuthorized) {
    return doGet();
  } else {
    return HtmlService.createHtmlOutput('認証に失敗しました。');
  }
};
// 認証情報リセット用関数
// 主にデバッグ目的等に利用
function resetSpotifyService() {
  var spotifyService = getSpotifyService();
  spotifyService.reset();
};

var SLACK_CLIENT_ID = PropertiesService.getScriptProperties().getProperty("SLACK_CLIENT_ID");
var SLACK_CLIENT_SECRET = PropertiesService.getScriptProperties().getProperty("SLACK_CLIENT_SECRET");
// OAuth2認証
// getSlackServiceの作成
function getSlackService() {
  return OAuth2.createService('slack')
  // 認証用URL
  .setAuthorizationBaseUrl('https://slack.com/oauth/authorize')
  // Token取得用URL
  .setTokenUrl('https://slack.com/api/oauth.access')
  // SLACK_CLIENT_ID
  .setClientId(SLACK_CLIENT_ID)
  // SLACK_CLIENT_SECRET
  .setClientSecret(SLACK_CLIENT_SECRET)
  // 認証完了時用コールバック関数名
  .setCallbackFunction('slackAuthCallback')
  // 認証情報格納先
  // アクセストークンやリフレッシュトークンや、有効期限などが格納
  .setPropertyStore(PropertiesService.getUserProperties())
  // Status変更に必要なscopeを定義
  // 複数必要な場合は半角スペース区切りで設定
  .setScope('users.profile:write');
};
// 認証完了時用コールバック関数
// アクセストークンなどの情報をユーザー毎のキャッシュに格納
function slackAuthCallback(request) {
  var slackService = getSlackService();
  // handleCallback でアクセストークンなどを propertyStore に格納する
  var isAuthorized = slackService.handleCallback(request);
  
  if (isAuthorized) {
    return doGet();
  } else {
    return HtmlService.createHtmlOutput('認証に失敗しました。');
  }
};
// 認証情報リセット用関数
// 主にデバッグ目的等に利用
function resetSlackService() {
  var slackService = getSlackService();
  slackService.reset();
};

/*
Main
*/
// WEB アプリケーションとしての認証用コールバック関数
// Spotify → Slackの順に認証
function doGet() {
  var spotifyService = getSpotifyService();
  var outputHtml = '<h1>Spotify and Slack API Test</h1>';
  
  // Spotifyの認証
  if (!spotifyService.hasAccess()) { // 未認証時
    // ログイン用URL取得
    var authorizationUrl = spotifyService.getAuthorizationUrl();
    // HTML組み立て、表示
    outputHtml += '<p>Spotifyにログインしていません。ログインしてください。</p><p><a href="' + authorizationUrl + '" target="_blank">Spotify Login</a></p>';
  } else { // 認証時    
    // アクセストークンの有効期限が1時間となっているのでアクセストークンを都度リフレッシュ
    spotifyService.refresh();
    var accessToken = spotifyService.getAccessToken();
    
    outputHtml += (function () {
      var fetchResult = UrlFetchApp.fetch('https://api.spotify.com/v1/me/player/currently-playing?market=JP', {
        headers: {
          Authorization: 'Bearer ' + accessToken,
          // 下記を定義しておかないとトラックやアーティスト情報が英語になる。
          'Accept-Language': 'ja,en'
        }
      });
      var statusCode = fetchResult.getResponseCode();
      var content = JSON.parse(fetchResult.getContentText() || '{}');
      var track, artist, displayStr;
      if (statusCode === 200) {
        track = content.item.name;
        artist = content.item.artists[0].name;
        displayStr = track + ' / ' + artist;
      } else {
        displayStr = '再生中の曲はありません';
      }
      return '<h2>Now Playing</h2><ul><li>' + displayStr + '</li></ul>';
    })();
  }
  
  var slackService = getSlackService();
  
  // Slackの認証
  if (!slackService.hasAccess()) { // 未認証時
    // ログイン用URL取得
    var authorizationUrl = slackService.getAuthorizationUrl();
    // HTML組み立て、表示
    outputHtml += '<p>Slackにログインしていません。ログインしてください。</p><p><a href="' + authorizationUrl + '" target="_blank">Slack Login</a></p>';
  } else { // 認証時    
    // アクセストークンの有効期限が1時間となっているのでアクセストークンを都度リフレッシュ
    // slackはリフレッシュいらない？
    // slackService.refresh();
    var accessToken = slackService.getAccessToken();
    
    outputHtml += '<h2>Slackにログインしました</h2>'
  }
  
  return HtmlService.createHtmlOutput(outputHtml);
};
// 定期実行用サンプル
function timeTriggerSampleFunction() {
  var spotifyService = getSpotifyService();
  // アクセストークンの有効期限が1時間となっているのでアクセストークンを都度リフレッシュ
  spotifyService.refresh();
  var accessToken = spotifyService.getAccessToken();
  var fetchResult = UrlFetchApp.fetch('https://api.spotify.com/v1/me/player/currently-playing?market=JP', {
    headers: {
      Authorization: 'Bearer ' + accessToken,
      // 下記を定義しておかないとトラックやアーティスト情報が英語になってしまう
      'Accept-Language': 'ja,en'
    }
  });
  var statusCode = fetchResult.getResponseCode();
  var content = JSON.parse(fetchResult.getContentText() || '{}');
  var track, artist, displayStr;
  if (statusCode === 200) {
    track = content.item.name;
    artist = content.item.artists[0].name;
    displayStr = 'NowPlaying：' + track + ' / ' + artist;
  } else {
    displayStr = '再生中の曲はありません';
  }
  return displayStr;
};
// Slackの設定
function changeSlackStatus(){
  var slackService = getSlackService();
  // slackはリフレッシュいらない？
  // slackService.refresh();
  var accessToken = slackService.getAccessToken();

  var data = timeTriggerSampleFunction();
  console.log(data)
  // 再生中の場合は、こっちを表示させる。
  var profile = {
    'status_text': data,
    'status_emoji': ":spotify:", //Spotifyの絵文字を予め作成
  };
  
  // 表示情報の切り替え。  
  var slacktoprofile;
  if (data == '再生中の曲はありません') {
    // 停止中の場合は変更しない
    return;
  } else {
    slacktoprofile = profile;
  }
  
  var fetchResult = UrlFetchApp.fetch("https://slack.com/api/users.profile.set?token=" + accessToken + "&profile=" + encodeURIComponent(JSON.stringify(slacktoprofile)));
}
