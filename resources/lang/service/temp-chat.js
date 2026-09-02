const TEMP_CHAT_LANG = {
	title: {
		en: "Temporary Chat",
		kr: "임시 채팅방",
		jp: "一時チャット",
		cn: "临时聊天室",
		ru: "Временный чат"
	},
	kicker: {
		en: "Encrypted · 3-day limit",
		kr: "암호화 · 최대 3일",
		jp: "暗号化 · 最長3日",
		cn: "加密 · 最长3天",
		ru: "Шифрование · до 3 дней"
	},
	hint: {
		en: "No sign-in. Messages are encrypted on this device and always deleted within 3 days.",
		kr: "로그인 없이 이용합니다. 메시지는 이 기기에서 암호화되며 최대 3일 후 삭제됩니다.",
		jp: "ログイン不要。メッセージはこの端末で暗号化され、最長3日で削除されます。",
		cn: "无需登录。消息在本机加密，最多3天后删除。",
		ru: "Без входа. Сообщения шифруются на устройстве и удаляются не позже чем через 3 дня."
	},
	joinPublic: {
		en: "Join public room",
		kr: "공용 채팅방 참여",
		jp: "公開チャットに参加",
		cn: "加入公共聊天室",
		ru: "Войти в общий чат"
	},
	joinGroup: {
		en: "Join group room",
		kr: "그룹 채팅방 참여",
		jp: "グループチャットに参加",
		cn: "加入群聊",
		ru: "Войти в группу"
	},
	createGroup: {
		en: "Create group room",
		kr: "그룹 채팅방 개설",
		jp: "グループチャットを作成",
		cn: "创建群聊",
		ru: "Создать группу"
	},
	publicDesc: {
		en: "Anyone can enter. Same passphrase for every visitor.",
		kr: "누구나 바로 들어올 수 있습니다. 방 암호는 모두에게 같습니다.",
		jp: "誰でもすぐ入れます。合言葉は全員共通です。",
		cn: "任何人都能进入。所有访客使用同一口令。",
		ru: "Войти может любой. Одна фраза для всех."
	},
	joinDesc: {
		en: "Enter the exact title and password the host set.",
		kr: "개설자가 정한 제목과 비밀번호를 그대로 입력하세요.",
		jp: "作成者が決めたルーム名とパスワードを入力します。",
		cn: "请输入房主设定的标题和密码。",
		ru: "Введите точные название и пароль комнаты."
	},
	createDesc: {
		en: "Pick a title and password. Share both with people you trust.",
		kr: "제목과 비밀번호를 정한 뒤, 믿을 사람에게만 알려 주세요.",
		jp: "ルーム名とパスワードを決め、信頼できる相手にだけ共有します。",
		cn: "设定标题和密码，只告诉信任的人。",
		ru: "Задайте название и пароль. Делитесь только с теми, кому доверяете."
	},
	publicRoom: { en: "Public room", kr: "공용 채팅방", jp: "公開チャット", cn: "公共聊天室", ru: "Общий чат" },
	groupRoom: { en: "Group room", kr: "그룹 채팅방", jp: "グループチャット", cn: "群聊", ru: "Группа" },
	nick: { en: "Nickname", kr: "닉네임", jp: "ニックネーム", cn: "昵称", ru: "Ник" },
	message: { en: "Message", kr: "내용", jp: "メッセージ", cn: "内容", ru: "Сообщение" },
	send: { en: "Send", kr: "보내기", jp: "送信", cn: "发送", ru: "Отправить" },
	sending: { en: "Sending…", kr: "전송 중", jp: "送信中", cn: "发送中", ru: "Отправка…" },
	attach: { en: "Image", kr: "이미지", jp: "画像", cn: "图片", ru: "Фото" },
	imgHint: {
		en: "Compressed to 32×32 pixels before sending.",
		kr: "32×32 Pixel로 압축되어 전송됩니다.",
		jp: "送信時に 32×32 ピクセルへ圧縮されます。",
		cn: "发送前会压缩为 32×32 Pixel。",
		ru: "Перед отправкой сжимается до 32×32 пикселей."
	},
	removeImage: { en: "Remove image", kr: "이미지 제거", jp: "画像を削除", cn: "移除图片", ru: "Убрать фото" },
	needImage: {
		en: "That file is not a usable image.",
		kr: "사용할 수 있는 이미지 파일이 아닙니다.",
		jp: "このファイルは画像として使えません。",
		cn: "无法使用该图片文件。",
		ru: "Этот файл нельзя использовать как изображение."
	},
	newline: { en: "New line", kr: "개행", jp: "改行", cn: "换行", ru: "Новая строка" },
	expiry: { en: "Delete after", kr: "삭제 시기", jp: "削除時期", cn: "删除时间", ru: "Удалить через" },
	roomTitle: { en: "Room title", kr: "채팅방 제목", jp: "ルーム名", cn: "聊天室标题", ru: "Название комнаты" },
	password: { en: "Password", kr: "비밀번호", jp: "パスワード", cn: "密码", ru: "Пароль" },
	confirm: { en: "Confirm", kr: "확인", jp: "確認", cn: "确认", ru: "ОК" },
	cancel: { en: "Cancel", kr: "취소", jp: "キャンセル", cn: "取消", ru: "Отмена" },
	leave: { en: "Leave", kr: "나가기", jp: "退出", cn: "离开", ru: "Выйти" },
	empty: {
		en: "No messages yet. Be the first to write.",
		kr: "아직 메시지가 없습니다. 첫 글을 남겨 보세요.",
		jp: "まだメッセージがありません。",
		cn: "还没有消息。来写第一条吧。",
		ru: "Пока нет сообщений."
	},
	closed: {
		en: "This room was never created, or it closed after 3 days without messages.",
		kr: "채팅방이 개설되지 않았거나, 3일 이상 채팅이 없어 폐쇄되었습니다.",
		jp: "チャットは未作成か、3日間メッセージがなく閉鎖されました。",
		cn: "聊天室尚未创建，或因超过3天没有消息而关闭。",
		ru: "Комната не создана или закрыта после 3 дней без сообщений."
	},
	rateLimit: {
		en: "Too many posts. Please wait a minute.",
		kr: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
		jp: "投稿が多すぎます。少し待ってください。",
		cn: "发送过于频繁，请稍后再试。",
		ru: "Слишком часто. Подождите минуту."
	},
	needNick: {
		en: "Enter a nickname (max 16 characters).",
		kr: "닉네임을 입력하세요 (최대 16자).",
		jp: "ニックネームを入力してください（最大16文字）。",
		cn: "请输入昵称（最多16字）。",
		ru: "Введите ник (до 16 символов)."
	},
	needTitle: {
		en: "Enter a room title (max 16 characters).",
		kr: "채팅방 제목을 입력하세요 (최대 16자).",
		jp: "ルーム名を入力してください（最大16文字）。",
		cn: "请输入聊天室标题（最多16字）。",
		ru: "Введите название комнаты (до 16 символов)."
	},
	needPassword: {
		en: "Enter a password (max 16 characters).",
		kr: "비밀번호를 입력하세요 (최대 16자).",
		jp: "パスワードを入力してください（最大16文字）。",
		cn: "请输入密码（最多16字）。",
		ru: "Введите пароль (до 16 символов)."
	},
	needText: {
		en: "Enter a message or attach an image (max 1024 characters).",
		kr: "내용을 입력하거나 이미지를 첨부하세요 (최대 1024자).",
		jp: "メッセージを入力するか画像を添付してください（最大1024文字）。",
		cn: "请输入内容或附加图片（最多1024字）。",
		ru: "Введите сообщение или прикрепите изображение (до 1024 символов)."
	},
	error: {
		en: "Could not reach the chat server.",
		kr: "채팅 서버와 통신 중 오류가 발생했습니다.",
		jp: "チャットサーバーに接続できません。",
		cn: "无法连接聊天服务器。",
		ru: "Ошибка связи с сервером чата."
	},
	welcome: {
		en: "The group room is open.",
		kr: "그룹 채팅방이 개설되었습니다.",
		jp: "グループチャットが開設されました。",
		cn: "群聊已创建。",
		ru: "Групповой чат создан."
	},
	system: { en: "System", kr: "시스템", jp: "システム", cn: "系统", ru: "Система" },
	ttl1m: { en: "1 minute", kr: "1분", jp: "1分", cn: "1分钟", ru: "1 минута" },
	ttl10m: { en: "10 minutes", kr: "10분", jp: "10分", cn: "10分钟", ru: "10 минут" },
	ttl30m: { en: "30 minutes", kr: "30분", jp: "30分", cn: "30分钟", ru: "30 минут" },
	ttl1h: { en: "1 hour", kr: "1시간", jp: "1時間", cn: "1小时", ru: "1 час" },
	ttl6h: { en: "6 hours", kr: "6시간", jp: "6時間", cn: "6小时", ru: "6 часов" },
	ttl1d: { en: "1 day", kr: "1일", jp: "1日", cn: "1天", ru: "1 день" },
	ttl3d: { en: "3 days", kr: "3일", jp: "3日", cn: "3天", ru: "3 дня" }
};
LANGUAGE_OBJECT["TEMP_CHAT_LANG"] = TEMP_CHAT_LANG;
window.TEMP_CHAT_LANG = TEMP_CHAT_LANG;
