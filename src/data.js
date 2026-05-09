/* hjjjsn artist page — content data */
const data = {
  channel: {
    nameJa: "hjjjsn",
    nameKana: "ひつじ",
    tagline: "music notebook",
    iconText: "hj",
    iconImage: "/assets/icon.jpg"
  },
  bio: {
    primary: "音楽、文章、制作のための道具などを作っています。",
    secondary: "生活、精神疾患、制度、孤立などについて考えることが多いです。",
    place: "JAPAN",
    since: "2026—"
  },
  activities: [
    { ja: "オリジナル楽曲の制作", en: "original songs", mark: "原" },
    { ja: "歌ってみた / カバー", en: "covers", mark: "唄" },
    { ja: "作詞・作曲", en: "writing & composing", mark: "詞" },
    { ja: "プログラミング", en: "programming & tools", mark: "具" },
    { ja: "文章 / メモ", en: "essays & notes", mark: "文" }
  ],
  songs: [
    { no: "07", title: "グッバイ、シーサイド", titleEn: "goodbye, seaside",
      year: "2026", tag: "original",
      youtube: "https://www.youtube.com/@hjjjsn", spotify: "https://open.spotify.com/intl-ja/artist/4Gpi6eJGAAPZkk9Rt9UPo4",
      tone: [392, 523, 659] /* G4 C5 E5 */ },
    { no: "06", title: "あさのにおい", titleEn: "morning scent",
      year: "2025", tag: "original",
      youtube: "https://www.youtube.com/@hjjjsn", spotify: "https://open.spotify.com/intl-ja/artist/4Gpi6eJGAAPZkk9Rt9UPo4",
      tone: [349, 440, 523] },
    { no: "05", title: "ゆきのひのバスていで", titleEn: "at the bus stop in snow",
      year: "2025", tag: "original",
      youtube: "https://www.youtube.com/@hjjjsn", spotify: "",
      tone: [330, 415, 494] },
    { no: "04", title: "うすあかり", titleEn: "faint light",
      year: "2024", tag: "歌ってみた",
      youtube: "https://www.youtube.com/@hjjjsn", spotify: "",
      tone: [294, 370, 440] },
    { no: "03", title: "ねむれないよる", titleEn: "sleepless night",
      year: "2024", tag: "original",
      youtube: "https://www.youtube.com/@hjjjsn", spotify: "https://open.spotify.com/intl-ja/artist/4Gpi6eJGAAPZkk9Rt9UPo4",
      tone: [262, 330, 392] },
    { no: "02", title: "じゆうけんきゅう", titleEn: "free study",
      year: "2023", tag: "歌ってみた",
      youtube: "https://www.youtube.com/@hjjjsn", spotify: "",
      tone: [247, 311, 370] },
    { no: "01", title: "はじまりのうた", titleEn: "first song",
      year: "2022", tag: "original",
      youtube: "https://www.youtube.com/@hjjjsn", spotify: "",
      tone: [220, 277, 330] }
  ],
  links: [
    { key: "youtube",  label: "YouTube",    handle: "@hjjjsn",       url: "https://www.youtube.com/@hjjjsn",                      mark: "▶" },
    { key: "tiktok",   label: "TikTok",     handle: "@hjjjsn3",      url: "https://www.tiktok.com/@hjjjsn3",                      mark: "♪" },
    { key: "twitter",  label: "X / Twitter", handle: "@hjjjsn3",     url: "https://x.com/hjjjsn3",                                mark: "✕" },
    { key: "niconico", label: "ニコニコ",    handle: "user/14285…",   url: "https://www.nicovideo.jp/user/142850614",              mark: "ニ" },
    { key: "spotify",  label: "Spotify",    handle: "hjjjsn",        url: "https://open.spotify.com/intl-ja/artist/4Gpi6eJGAAPZkk9Rt9UPo4?si=_ZHge-11T-243Yy5kuPo1A", mark: "♬" },
    { key: "note",     label: "note",       handle: "hjjjsn",        url: "https://note.com/hjjjsn",                              mark: "✎" },
    { key: "github",   label: "GitHub",     handle: "hjjjsn",        url: "https://github.com/hjjjsn",                            mark: "</>" }
  ],
  fanart: {
    tag: "#hjjjsn_art",
    note: "ファンアート、いつもありがとうございます。\nXで上のタグをつけて投稿してくれたら、見にいきます。",
    placeholders: 6
  },
  goods: [
    { name: "歌詞ノート（抜粋）", status: "BOOTH 準備中", price: "—" },
    { name: "ステッカー 3枚組", status: "BOOTH 準備中", price: "—" },
    { name: "缶バッジ 草", status: "イベント限定", price: "—" }
  ],
  contact: {
    email: "hjjjsn.contact[at]gmail.com",
    note: "お仕事のご相談、楽曲提供、コラボ等は\nメール、または X の DM にてお気軽にどうぞ。",
    response: "返信は気まぐれです。ゆっくり待っていてください。"
  }
};

export default data;
