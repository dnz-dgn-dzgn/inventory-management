export default {
  // Navigation
  nav: {
    overview: '概要',
    inventory: '在庫',
    orders: '注文',
    finance: '財務',
    demandForecast: '需要予測',
    restocking: '補充発注',
    reports: 'レポート',
    game: 'ゲーム',
    menu: 'メニュー',
    menuClose: 'メニューを閉じる',
    companyName: '触媒コンポーネンツ',
    subtitle: '在庫管理システム'
  },

  // Dashboard
  dashboard: {
    loadError: 'ダッシュボードデータの読み込みに失敗しました',
    title: '概要',
    kpi: {
      title: '主要業績評価指標',
      inventoryTurnover: '在庫回転率',
      ordersFulfilled: '注文履行数',
      orderFillRate: '注文充足率',
      revenue: '収益（注文）',
      revenueYTD: '収益（注文）年初来',
      revenueMTD: '収益（注文）月初来',
      avgProcessingTime: '平均処理時間（日）',
      goal: '目標'
    },
    summary: {
      title: '概要'
    },
    orderHealth: {
      title: '注文状況',
      totalOrders: '総注文数',
      revenue: '収益',
      avgOrderValue: '平均注文額',
      onTimeRate: '定時配達率',
      avgFulfillmentDays: '平均履行日数',
      total: '合計'
    },
    ordersByMonth: {
      title: '月別注文数'
    },
    inventoryValue: {
      title: 'カテゴリ別在庫価値'
    },
    inventoryShortages: {
      title: '在庫不足',
      noShortages: '在庫不足なし - すべての注文を履行できます！',
      noData: '選択したフィルターのデータがありません',
      orderId: '注文ID',
      sku: 'SKU',
      itemName: '品目名',
      quantityNeeded: '必要数量',
      quantityAvailable: '在庫数量',
      shortage: '不足',
      daysDelayed: '遅延日数',
      priority: '優先度',
      unitsShort: '単位不足',
      days: '日',
      actions: '操作',
      createPO: '発注書作成',
      viewPO: '発注書を表示'
    },
    topProducts: {
      title: '収益別トップ製品',
      sku: 'SKU',
      product: '製品',
      category: 'カテゴリ',
      warehouse: '倉庫',
      stockStatus: '在庫状況',
      revenue: '収益',
      unitsOrdered: '注文数量',
      firstOrder: '初回注文',
      inStock: '在庫あり',
      lowStock: '在庫僅少'
    }
  },

  // Inventory
  inventory: {
    title: '在庫',
    description: 'すべての在庫品目の追跡と管理',
    stockLevels: '在庫レベル',
    skus: 'SKU',
    searchPlaceholder: '品目名で検索...',
    clearSearch: '検索をクリア',
    totalItems: '総品目数',
    totalValue: '総価値',
    lowStockItems: '在庫僅少品目',
    lowStockAlert: '{count}件の品目が再注文点以下です',
    lowStockAlertOne: '1件の品目が再注文点以下です',
    showLowStockOnly: '在庫僅少のみ表示',
    warehouses: '倉庫',
    table: {
      sku: 'SKU',
      itemName: '品目名',
      name: '名前',
      category: 'カテゴリ',
      warehouse: '倉庫',
      quantity: '数量',
      quantityOnHand: '手持在庫数',
      reorderPoint: '再注文点',
      unitCost: '単価',
      unitPrice: '単価',
      totalValue: '総価値',
      location: '場所',
      status: 'ステータス'
    }
  },

  // Orders
  orders: {
    title: '注文',
    description: '顧客注文の表示と管理',
    allOrders: 'すべての注文',
    totalOrders: '総注文数',
    totalRevenue: '総収益',
    avgOrderValue: '平均注文額',
    onTimeDelivery: '定時配達',
    itemsCount: '{count}件',
    quantity: '数量',
    submitted: {
      title: '発注済み注文',
      description: '補充発注タブから行った発注',
      empty: '発注済みの補充注文はまだありません。',
      orderId: '注文ID',
      submittedAt: '発注日',
      items: '品目',
      totalValue: '合計金額',
      status: 'ステータス',
      leadTime: '納品リードタイム',
      days: '{count}日',
      expectedOn: '予定 {date}',
      statusSubmitted: '発注済み'
    },
    table: {
      orderNumber: '注文番号',
      orderId: '注文ID',
      orderDate: '注文日',
      date: '日付',
      customer: '顧客',
      category: 'カテゴリ',
      warehouse: '倉庫',
      items: '品目',
      value: '価格',
      totalValue: '合計金額',
      status: 'ステータス',
      expectedDelivery: '予定配達日',
      actualDelivery: '実際の配達日'
    }
  },

  // Finance/Spending
  finance: {
    title: '財務ダッシュボード',
    description: '収益、コスト、財務パフォーマンスの追跡',
    totalRevenue: '総収益',
    totalCosts: '総コスト',
    netProfit: '純利益',
    avgOrderValue: '平均注文額',
    fromOrders: '{count}件の注文から',
    costBreakdown: '調達 + 運営 + 人件費 + 間接費',
    margin: 'マージン',
    perOrderRevenue: '注文あたりの収益',
    revenueVsCosts: {
      title: '月別収益対コスト',
      revenue: '収益',
      costs: '総コスト'
    },
    monthlyCostFlow: {
      title: '月別コストフロー',
      procurement: '調達',
      operational: '運営',
      labor: '人件費',
      overhead: '間接費'
    },
    categorySpending: {
      title: 'カテゴリ別支出',
      ofTotal: '全体の'
    },
    transactions: {
      title: '最近の取引',
      id: 'ID',
      description: '説明',
      vendor: 'ベンダー',
      date: '日付',
      amount: '金額'
    }
  },

  // Demand Forecast
  demand: {
    title: '需要予測',
    description: '需要動向の分析と将来のニーズの予測',
    increasingDemand: '需要増加',
    stableDemand: '需要安定',
    decreasingDemand: '需要減少',
    itemsCount: '{count}件',
    more: 'さらに...',
    demandForecasts: '需要予測',
    table: {
      sku: 'SKU',
      itemName: '品目名',
      currentDemand: '現在の需要',
      forecastedDemand: '予測需要',
      change: '変化',
      trend: 'トレンド',
      period: '期間'
    }
  },

  // Restocking
  restocking: {
    title: '補充発注',
    description: '予算に合わせた購入推奨を確認し、補充注文を行います',
    budget: '予算',
    budgetLabel: '補充予算',
    recommendations: '推奨品目',
    sampleNote: '価格とリードタイムはサンプル値です。需要データには価格が含まれていません。',
    table: {
      sku: 'SKU',
      name: '名称',
      trend: 'トレンド',
      quantity: '発注数量',
      needed: '必要数',
      unitCost: '単価',
      lineTotal: '小計',
      leadTime: 'リードタイム'
    },
    days: '{count}日',
    totalCost: '合計費用',
    remaining: '残り予算',
    placeOrder: '発注する',
    submitting: '送信中...',
    empty: '予算が不足しており、推奨品目がありません。予算を増やしてください。',
    loadError: '推奨の読み込みに失敗しました',
    orderError: '発注に失敗しました',
    orderSuccess: '注文 {id} を送信しました。合計: {total}。納品予定日: {date}。'
  },

  // Filters
  filters: {
    timePeriod: '期間',
    location: '場所',
    category: 'カテゴリ',
    orderStatus: '注文ステータス',
    all: 'すべて',
    allMonths: 'すべての月'
  },

  // Statuses
  status: {
    delivered: '配達済み',
    shipped: '出荷済み',
    processing: '処理中',
    backordered: 'バックオーダー',
    inStock: '在庫あり',
    lowStock: '在庫僅少',
    adequate: '適量'
  },

  // Trends
  trends: {
    increasing: '増加',
    stable: '安定',
    decreasing: '減少'
  },

  // Priority
  priority: {
    high: '高',
    medium: '中',
    low: '低'
  },

  // Categories
  categories: {
    circuitBoards: '回路基板',
    sensors: 'センサー',
    actuators: 'アクチュエータ',
    controllers: 'コントローラー',
    powerSupplies: '電源'
  },

  // Spending Categories
  spendingCategories: {
    rawMaterials: '原材料',
    components: '部品',
    equipment: '設備',
    consumables: '消耗品'
  },

  // Warehouses
  warehouses: {
    sanFrancisco: 'サンフランシスコ',
    london: 'ロンドン',
    tokyo: '東京'
  },

  // Months
  months: {
    jan: '1月',
    feb: '2月',
    mar: '3月',
    apr: '4月',
    may: '5月',
    jun: '6月',
    jul: '7月',
    aug: '8月',
    sep: '9月',
    oct: '10月',
    nov: '11月',
    dec: '12月',
    january: '1月',
    february: '2月',
    march: '3月',
    april: '4月',
    june: '6月',
    july: '7月',
    august: '8月',
    september: '9月',
    october: '10月',
    november: '11月',
    december: '12月'
  },

  // Profile Menu
  profile: {
    profileDetails: 'プロフィール詳細',
    myTasks: 'マイタスク',
    logout: 'ログアウト'
  },

  // Profile Details Modal
  profileDetails: {
    title: 'プロフィール詳細',
    email: 'メールアドレス',
    department: '部署',
    location: '勤務地',
    phone: '電話番号',
    joinDate: '入社日',
    employeeId: '社員ID',
    close: '閉じる'
  },

  // Tasks Modal
  tasks: {
    title: 'マイタスク',
    taskTitle: 'タスク名',
    taskTitlePlaceholder: 'タスク名を入力...',
    priority: '優先度',
    dueDate: '期限',
    addTask: 'タスクを追加',
    noTasks: 'タスクがありません。上記からタスクを追加してください！'
  },

  // Language
  theme: {
    label: 'デザイン',
    default: '標準',
    atelier: 'アトリエ',
    signal: 'シグナル'
  },
  language: {
    english: 'English',
    japanese: '日本語',
    selectLanguage: '言語を選択'
  },

  // Reports
  reports: {
    title: 'パフォーマンスレポート',
    description: '四半期の業績指標と月次トレンドを表示します',
    loading: 'レポートを読み込み中...',
    loadError: 'レポートの読み込みに失敗しました',
    empty: '選択したフィルターに該当するレポートデータがありません',
    notAvailable: '該当なし',
    quarterly: {
      title: '四半期パフォーマンス',
      quarter: '四半期',
      totalOrders: '総注文数',
      totalRevenue: '総売上',
      avgOrderValue: '平均注文額',
      fulfillmentRate: '充足率'
    },
    trend: {
      title: '月次売上トレンド'
    },
    mom: {
      title: '前月比分析',
      month: '月',
      orders: '注文数',
      revenue: '売上',
      change: '増減額',
      growthRate: '成長率'
    },
    stats: {
      totalRevenue: '総売上（年初来）',
      avgMonthlyRevenue: '月平均売上',
      totalOrders: '総注文数（年初来）',
      bestQuarter: '最も好調な四半期'
    }
  },

  // Backlog
  backlog: {
    title: 'バックログ管理',
    description: '在庫不足の追跡と解消',
    loading: 'バックログを読み込み中...',
    loadError: 'バックログの読み込みに失敗しました',
    empty: 'バックログ品目なし - すべての注文を履行できます！',
    itemsTitle: 'バックログ品目',
    stats: {
      highPriority: '優先度：高',
      mediumPriority: '優先度：中',
      lowPriority: '優先度：低',
      totalItems: 'バックログ品目の合計'
    },
    table: {
      orderId: '注文ID',
      sku: 'SKU',
      itemName: '品目名',
      quantityNeeded: '必要数量',
      quantityAvailable: '在庫数量',
      shortage: '不足',
      daysDelayed: '遅延日数',
      priority: '優先度'
    },
    unitsShort: '{count}単位不足',
    days: '{count}日'
  },

  // Backlog detail modal
  backlogDetail: {
    title: '在庫不足の詳細',
    shortageAmount: '不足数量',
    itemSku: '品目SKU',
    expectedDate: '納期予定日',
    status: 'ステータス',
    units: '{count}単位',
    priorityBadge: '優先度：{priority}',
    notAvailable: '該当なし'
  },

  // Common
  purchaseOrder: {
    createTitle: '発注書の作成',
    viewTitle: '発注書',
    sku: 'SKU',
    shortage: '不足数',
    units: '単位',
    supplierName: '仕入先名',
    supplierPlaceholder: '仕入先名を入力',
    quantity: '数量',
    unitCost: '単価 ($)',
    totalCost: '合計金額',
    expectedDelivery: '納品予定日',
    notes: '備考',
    notesPlaceholder: '備考（任意）',
    status: 'ステータス',
    createdAt: '作成日',
    submit: '発注書を作成',
    submitting: '作成中...',
    cancel: 'キャンセル',
    close: '閉じる',
    loadingOrder: '発注書を読み込み中...',
    errors: {
      supplierRequired: '仕入先名は必須です',
      quantityInvalid: '数量は1以上の整数を入力してください',
      unitCostInvalid: '単価は0より大きい値を入力してください',
      dateRequired: '納品予定日は必須です',
      datePast: '納品予定日に過去の日付は指定できません',
      alreadyExists: 'この不足品目にはすでに発注書があります',
      createFailed: '発注書の作成に失敗しました。もう一度お試しください。',
      loadFailed: '発注書の読み込みに失敗しました'
    },
    statuses: {
      pending: '保留中',
      ordered: '発注済み',
      shipped: '出荷済み',
      received: '受領済み',
      cancelled: 'キャンセル済み'
    }
  },
  common: {
    loading: '読み込み中...',
    error: 'エラー',
    noData: 'データがありません',
    viewDetails: '詳細を見る',
    close: '閉じる',
    save: '保存',
    cancel: 'キャンセル',
    search: '検索',
    filter: 'フィルター',
    export: 'エクスポート',
    items: '件'
  },

  // Product Names
  productNames: {
    'Single Layer PCB Assembly': '単層PCB組立',
    'Dual Layer PCB Assembly': '二層PCB組立',
    'Multi Layer PCB Assembly': '多層PCB組立',
    'Temperature Sensor Module': '温度センサーモジュール',
    'Humidity Sensor Module': '湿度センサーモジュール',
    'Pressure Sensor Module': '圧力センサーモジュール',
    'Proximity Sensor': '近接センサー',
    'Ultrasonic Distance Sensor': '超音波距離センサー',
    'Micro Servo Motor': 'マイクロサーボモータ',
    'Standard Servo Motor': '標準サーボモータ',
    'Stepper Motor NEMA 17': 'ステッピングモータNEMA 17',
    '8-bit Microcontroller': '8ビットマイコン',
    '32-bit ARM Microcontroller': '32ビットARMマイコン',
    'Digital Signal Processor': 'デジタル信号処理装置',
    '3-Axis Accelerometer': '3軸加速度センサー',
    'Gyroscope Module': 'ジャイロスコープモジュール',
    'Light Dependent Resistor': '光依存抵抗器',
    'Coil Spring Heavy Duty': 'コイルばね(重量用)',
    'Compression Spring': '圧縮ばね',
    'PWM Motor Controller': 'PWMモータコントローラ',
    'H-Bridge Motor Driver': 'Hブリッジモータドライバ',
    'Stepper Motor NEMA 23': 'ステッピングモータNEMA 23',
    'Drive Pulley': 'ドライブプーリー',
    'LED Driver IC': 'LEDドライバIC',
    '5V 10A Switching Power Supply': '5V 10Aスイッチング電源',
    '12V 5A Power Supply Module': '12V 5A電源モジュール',
    '24V 3A Industrial Power Supply': '24V 3A産業用電源',
    'Dual Output ±15V Power Supply': 'デュアル出力±15V電源',
    '48V DC Power Supply Unit': '48V DC電源ユニット',
    'USB-C PD 100W Power Supply': 'USB-C PD 100W電源',
    'Battery Backup Power Supply': 'バッテリバックアップ電源',
    'Adjustable Bench Power Supply': '可変ベンチ電源'
  },

  // Customer Names
  customerNames: {
    'MegaCorp Industries': 'メガコープ工業',
    'Elite Systems Corp': 'エリートシステムズ',
    'Horizon Technologies': 'ホライズン技術',
    'FastAssembly Ltd': 'ファストアセンブリー',
    'TechSolutions Group': 'テックソリューションズグループ',
    'Apex Engineering': 'アペックスエンジニアリング',
    'Superior Manufacturing': 'スーペリアマニュファクチャリング',
    'Cascade Manufacturing': 'カスケードマニュファクチャリング',
    'Acme Manufacturing Corp': 'アクメ製造',
    'TechBuild Industries': 'テックビルド工業',
    'Advanced Components Inc': 'アドバンストコンポーネンツ',
    'Premier Industries': 'プレミア工業',
    'Stellar Components Ltd': 'ステラコンポーネンツ',
    'Dynamic Systems Ltd': 'ダイナミックシステムズ'
  },

  // Game mode (Backlog Blaster)
  game: {
    title: 'バックログ・ブラスター',
    subtitle: '経営陣がまだ試していない方法で滞留在庫を一掃せよ。そう、パレットで。',
    canvasLabel: 'バックログ・ブラスターのゲーム画面。下にいるフォークリフトが、降りてくる在庫不足にパレットを撃ち込みます。',
    loadingRoster: '在庫不足を読み込み中',
    fallbackNote: '最新のバックログを取得できないため、サンプルの在庫不足を使用しています。',
    start: {
      heading: '朝礼',
      lead: '在庫不足が荷捌き場に降ってきます。手元にはフォークリフトと無限のパレット。パレットの出どころは聞かないでください。',
      button: '出勤する',
      roster: '本日の在庫不足',
      rosterHint: '実際のバックログから取得。不足が大きいほど頑丈、遅延が長いほど足が速い。',
      shortage: '{n}不足',
      delayed: '{n}日遅れ',
      priority: { high: '高', medium: '中', low: '低' }
    },
    controls: {
      title: '操作方法',
      move: '移動：左右の矢印キー、または A / D',
      fire: 'パレット発射：スペース、W、または上矢印（長押しで連射）',
      pause: '一時停止：P または Esc',
      touch: 'タッチ・マウス：画面下のボタンを使用',
      legend: '敵の図鑑',
      powers: 'パワーアップ'
    },
    enemies: {
      crate: { name: '在庫不足の箱', desc: '実際の品目名つき。ひび割れでダメージがわかります。' },
      email: { name: '至急メール', desc: '速い。一撃。毎回「至急」。' },
      invite: { name: '会議招集', desc: '当たると、小さな会議が2つに増えます。' },
      forecast: { name: '需要予測', desc: 'ジグザグに動く。理由は誰も知らない。' }
    },
    buttons: {
      start: '出勤する',
      pause: '一時停止',
      resume: '再開',
      mute: '音を消す',
      unmute: '音を出す',
      retry: 'もう一度',
      back: 'ダッシュボードへ戻る',
      playAgain: 'もう一回'
    },
    touch: { left: '左', right: '右', fire: '発射', group: '画面上の操作ボタン' },
    stats: {
      highScore: 'ハイスコア',
      revenue: '守った売上',
      lives: '安全資格',
      none: 'まだなし'
    },
    hud: {
      score: '守った額 {n}',
      wave: 'ウェーブ {n}/{total}',
      combo: 'コンボ x{n}'
    },
    banner: { wave: 'ウェーブ {n}' },
    combo: { label: 'コンボ x{n}' },
    popups: {
      po: '発注完了：{item}',
      split: '会議が2つに'
    },
    power: {
      coffee: { name: 'コーヒー', desc: '連射。フォークリフトが震えます。' },
      jack: { name: 'ハンドリフト', desc: '3方向ショット。' },
      intern: { name: 'インターン', desc: '助っ人ドローン。狙いは保証外。' },
      shield: { name: '積むな危険', desc: '箱が2回までかばってくれます。', block: '箱が受け止めた', decal: '積むな危険' }
    },
    waves: {
      monday: { title: '月曜の朝', sub: 'まだ誰もコーヒーを飲んでいない。箱も。' },
      monthEnd: { title: '月次決算', sub: '全部が期限切れで、全部が至急。' },
      quiet: { title: '仕入先が音信不通', sub: '最後の返信は3週間前。「確認中です」。' },
      blackFriday: { title: 'ブラックフライデー', sub: '需要予測は「はい」倍ずれていました。' },
      yearEnd: { title: '年度末の棚卸し', sub: '全部数える。そしてもう一度数える。' },
      auditor: { title: '監査人の登場', sub: '少々、確認したいことがあるだけだそうです。' }
    },
    boss: {
      name: '監査人',
      rage: '興味深いですね。それは書面でいただけますか。'
    },
    pause: { title: '一時停止', hint: 'P または Esc で再開' },
    over: {
      title: '人事部',
      subtitle: '事故報告書 27-B号',
      score: '守った売上',
      wave: 'ウェーブ {n} まで到達',
      newHigh: 'ハイスコア更新',
      rank: '最終ランク'
    },
    win: {
      title: 'バックログ完全消化',
      certTitle: '今月の優秀社員賞',
      certLine: 'あなたは単独で監査人を撃退したことを、ここに証します。',
      waves: '乗り越えたウェーブ',
      accuracy: 'パレット命中率',
      saved: '救出した品目',
      revenue: '守った売上',
      combo: '最大コンボ',
      rank: 'ランク',
      signed: '経営陣（スキャン済み・やや斜め）'
    },
    ranks: {
      intern: 'インターン',
      associate: '倉庫スタッフ',
      lead: 'シフトリーダー',
      manager: '荷捌き場長',
      legend: '伝説の倉庫番'
    },
    live: {
      started: '勤務開始。ウェーブ {n}。',
      wave: 'ウェーブ {n}：{title}',
      lives: '安全資格の残り {n}',
      score: '守った売上 {n}',
      over: 'ゲームオーバー。守った売上 {n}。',
      win: '監査人を撃退しました。守った売上 {n}。',
      paused: '一時停止中',
      resumed: '再開しました'
    },
    jokes: {
      hit: {
        1: '安全資格が失効しました。90分の再講習にご参加ください。',
        2: 'ヒヤリハットです。ただし直撃でした。',
        3: '先日のメールの通り、そこには立たないでください。',
        4: '事故報告書が提出されました。あなた自身の手で、今すぐ。',
        5: '労災担当に連絡済み。そして、後回しにされました。',
        6: 'フォークリフトは無事です。書類は無事ではありません。'
      },
      breach: {
        1: '在庫不足が荷捌き場に到達。金曜の定例で誰かが説明します。',
        2: 'すり抜けました。これからは「学びの機会」と呼びます。',
        3: '荷捌き場で欠品発生。写真は撮らないでください。',
        4: 'お客様窓口に、とても長いメールが届きました。'
      },
      po: {
        1: 'ジャストインタイム、ついに本当にジャストインタイム。',
        2: '欠品解消。誰も気づかないので、ポップアップで知らせます。',
        3: '調達部は大喜びで、少し困惑しています。',
        4: 'バックログ、残り1件減。バックログはため息をついた。',
        5: '会議を1回も開かずに発注が承認されました。'
      },
      bonusKill: {
        1: '受信トレイ、ゼロ。約4秒間だけ。',
        2: '既読にしました。解決です。',
        3: '全員に返信しました。虚空に向かって。',
        4: 'そのメール、パレットで済んだのでは。'
      },
      over: {
        1: '人事考課が前倒しになりました。かなり前倒しです。',
        2: '組織再編します。あなたが組織です。',
        3: 'ご苦労さまでした。フォークリフトの鍵をお返しください。',
        4: 'バックログの勝ち。バックログは質問を受け付けません。',
        5: '人事部は状況を把握し、それについてのアンケートを予定しています。',
        6: 'あなたの最終日は記憶されます。短く。表計算ソフトの中で。'
      },
      loading: {
        1: '別の表を突き合わせるための表を突き合わせています',
        2: '棚卸し中。またです。',
        3: '仕入先の全員返信を待っています',
        4: '行方不明のパレットを捜索中。別のパレットの裏にありました。'
      },
      taunt: {
        1: '先日のメールの通り、遅れていますよ。',
        2: '確認したいことが少しだけ。400件ほど。',
        3: 'そのパレットの根拠資料はどこですか。',
        4: 'それは最終版ですか。それとも「最終_本当の最終」ですか。',
        5: '在庫数が1個合いません。今、探しますので。',
        6: 'あなたの全フォルダへのアクセス権をください。',
        7: '決裁は取りましたか。誰の。青のインクで。'
      },
      bossDown: {
        1: 'いいでしょう。これは指摘事項です。良い方の。',
        2: '以上で質問はありません。史上初です。'
      },
      cert: {
        1: '自分の仕事でもない箱を動かし続けた、たゆまぬ献身を称えて。',
        2: '二度言われる前にバックログを片付けた功績を称えて。',
        3: '涙を最小限に抑えて監査を乗り切ったことを称えて。',
        4: '副賞：ピザパーティー（予算承認待ち）。'
      },
      pause: {
        1: '一時停止中。会議で一番いい時間です。',
        2: '5分休憩。バックログは待ってくれます。いつもそうです。',
        3: '休憩時間です。経理部には内緒で。'
      },
      clear: {
        1: 'ウェーブ突破。バックログはただ休んでいるだけです。',
        2: 'お見事。ご褒美は、さらなる仕事です。',
        3: '荷捌き場、クリア。つかの間の平穏をどうぞ。',
        4: '画面上の欠品はゼロ。現実はもうすぐ来ます。'
      }
    }
  }
}
