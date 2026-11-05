export default {
  // Navigation
  nav: {
    overview: 'Overview',
    inventory: 'Inventory',
    orders: 'Orders',
    finance: 'Finance',
    demandForecast: 'Demand Forecast',
    restocking: 'Restocking',
    reports: 'Reports',
    game: 'Game',
    menu: 'Menu',
    menuClose: 'Close menu',
    companyName: 'Catalyst Components',
    subtitle: 'Inventory Management System'
  },

  // Dashboard
  dashboard: {
    loadError: 'Failed to load dashboard data',
    title: 'Overview',
    kpi: {
      title: 'Key Performance Indicators',
      inventoryTurnover: 'Inventory Turnover Rate',
      ordersFulfilled: 'Orders Fulfilled',
      orderFillRate: 'Order Fill Rate',
      revenue: 'Revenue (Orders)',
      revenueYTD: 'Revenue (Orders) YTD',
      revenueMTD: 'Revenue (Orders) MTD',
      avgProcessingTime: 'Avg Processing Time (Days)',
      goal: 'Goal'
    },
    summary: {
      title: 'Summary'
    },
    orderHealth: {
      title: 'Order Health',
      totalOrders: 'Total Orders',
      revenue: 'Revenue',
      avgOrderValue: 'Avg Order Value',
      onTimeRate: 'On-Time Rate',
      avgFulfillmentDays: 'Avg Fulfillment (Days)',
      total: 'Total'
    },
    ordersByMonth: {
      title: 'Orders by Month'
    },
    inventoryValue: {
      title: 'Inventory Value by Category'
    },
    inventoryShortages: {
      title: 'Inventory Shortages',
      noShortages: 'No inventory shortages - all orders can be fulfilled!',
      noData: 'No inventory data for selected filters',
      orderId: 'Order ID',
      sku: 'SKU',
      itemName: 'Item Name',
      quantityNeeded: 'Quantity Needed',
      quantityAvailable: 'Quantity Available',
      shortage: 'Shortage',
      daysDelayed: 'Days Delayed',
      priority: 'Priority',
      unitsShort: 'units short',
      days: 'days',
      actions: 'Actions',
      createPO: 'Create PO',
      viewPO: 'View PO'
    },
    topProducts: {
      title: 'Top Products by Revenue',
      sku: 'SKU',
      product: 'Product',
      category: 'Category',
      warehouse: 'Warehouse',
      stockStatus: 'Stock Status',
      revenue: 'Revenue',
      unitsOrdered: 'Units Ordered',
      firstOrder: 'First Order',
      inStock: 'In Stock',
      lowStock: 'Low Stock'
    }
  },

  // Inventory
  inventory: {
    title: 'Inventory',
    description: 'Track and manage all inventory items',
    stockLevels: 'Stock Levels',
    skus: 'SKUs',
    searchPlaceholder: 'Search by item name...',
    clearSearch: 'Clear search',
    totalItems: 'Total Items',
    totalValue: 'Total Value',
    lowStockItems: 'Low Stock Items',
    lowStockAlert: '{count} items are at or below their reorder point',
    lowStockAlertOne: '1 item is at or below its reorder point',
    showLowStockOnly: 'Show low stock only',
    warehouses: 'Warehouses',
    table: {
      sku: 'SKU',
      itemName: 'Item Name',
      name: 'Name',
      category: 'Category',
      warehouse: 'Warehouse',
      quantity: 'Quantity',
      quantityOnHand: 'Quantity on Hand',
      reorderPoint: 'Reorder Point',
      unitCost: 'Unit Cost',
      unitPrice: 'Unit Price',
      totalValue: 'Total Value',
      location: 'Location',
      status: 'Status'
    }
  },

  // Orders
  orders: {
    title: 'Orders',
    description: 'View and manage customer orders',
    allOrders: 'All Orders',
    totalOrders: 'Total Orders',
    totalRevenue: 'Total Revenue',
    avgOrderValue: 'Avg Order Value',
    onTimeDelivery: 'On-Time Delivery',
    itemsCount: '{count} items',
    quantity: 'Qty',
    submitted: {
      title: 'Submitted Orders',
      description: 'Restocking orders placed from the Restocking tab',
      empty: 'No restocking orders have been submitted yet.',
      orderId: 'Order ID',
      submittedAt: 'Submitted',
      items: 'Items',
      totalValue: 'Total Value',
      status: 'Status',
      leadTime: 'Delivery Lead Time',
      days: '{count} days',
      expectedOn: 'expected {date}',
      statusSubmitted: 'Submitted'
    },
    table: {
      orderNumber: 'Order Number',
      orderId: 'Order ID',
      orderDate: 'Order Date',
      date: 'Date',
      customer: 'Customer',
      category: 'Category',
      warehouse: 'Warehouse',
      items: 'Items',
      value: 'Value',
      totalValue: 'Total Value',
      status: 'Status',
      expectedDelivery: 'Expected Delivery',
      actualDelivery: 'Actual Delivery'
    }
  },

  // Finance/Spending
  finance: {
    title: 'Finance Dashboard',
    description: 'Track revenue, costs, and financial performance',
    totalRevenue: 'Total Revenue',
    totalCosts: 'Total Costs',
    netProfit: 'Net Profit',
    avgOrderValue: 'Avg Order Value',
    fromOrders: 'From {count} orders',
    costBreakdown: 'Procurement + Operational + Labor + Overhead',
    margin: 'margin',
    perOrderRevenue: 'Per order revenue',
    revenueVsCosts: {
      title: 'Monthly Revenue vs Costs',
      revenue: 'Revenue',
      costs: 'Total Costs'
    },
    monthlyCostFlow: {
      title: 'Monthly Cost Flow',
      procurement: 'Procurement',
      operational: 'Operational',
      labor: 'Labor',
      overhead: 'Overhead'
    },
    categorySpending: {
      title: 'Spending by Category',
      ofTotal: 'of total'
    },
    transactions: {
      title: 'Recent Transactions',
      id: 'ID',
      description: 'Description',
      vendor: 'Vendor',
      date: 'Date',
      amount: 'Amount'
    }
  },

  // Demand Forecast
  demand: {
    title: 'Demand Forecast',
    description: 'Analyze demand trends and forecasts',
    increasingDemand: 'Increasing Demand',
    stableDemand: 'Stable Demand',
    decreasingDemand: 'Decreasing Demand',
    itemsCount: '{count} items',
    more: 'more...',
    demandForecasts: 'Demand Forecasts',
    table: {
      sku: 'SKU',
      itemName: 'Item Name',
      currentDemand: 'Current Demand',
      forecastedDemand: 'Forecasted Demand',
      change: 'Change',
      trend: 'Trend',
      period: 'Period'
    }
  },

  // Restocking
  restocking: {
    title: 'Restocking',
    description: 'Get purchase recommendations that fit your budget and place a restocking order',
    budget: 'Budget',
    budgetLabel: 'Restocking budget',
    recommendations: 'Recommended Items',
    sampleNote: 'Prices and lead times are sample values; the demand data contains no prices.',
    table: {
      sku: 'SKU',
      name: 'Name',
      trend: 'Trend',
      quantity: 'Order Qty',
      needed: 'Needed',
      unitCost: 'Unit Cost',
      lineTotal: 'Line Total',
      leadTime: 'Lead Time'
    },
    days: '{count} days',
    totalCost: 'Total Cost',
    remaining: 'Remaining Budget',
    placeOrder: 'Place Order',
    submitting: 'Submitting...',
    empty: 'The budget is too low for any recommended item. Increase the budget to see recommendations.',
    loadError: 'Failed to load recommendations',
    orderError: 'Failed to place order',
    orderSuccess: 'Order {id} submitted. Total: {total}. Expected delivery: {date}.'
  },

  // Filters
  filters: {
    timePeriod: 'Time Period',
    location: 'Location',
    category: 'Category',
    orderStatus: 'Order Status',
    all: 'All',
    allMonths: 'All Months'
  },

  // Statuses
  status: {
    delivered: 'Delivered',
    shipped: 'Shipped',
    processing: 'Processing',
    backordered: 'Backordered',
    inStock: 'In Stock',
    lowStock: 'Low Stock',
    adequate: 'Adequate'
  },

  // Trends
  trends: {
    increasing: 'increasing',
    stable: 'stable',
    decreasing: 'decreasing'
  },

  // Priority
  priority: {
    high: 'High',
    medium: 'Medium',
    low: 'Low'
  },

  // Categories
  categories: {
    circuitBoards: 'Circuit Boards',
    sensors: 'Sensors',
    actuators: 'Actuators',
    controllers: 'Controllers',
    powerSupplies: 'Power Supplies'
  },

  // Spending Categories
  spendingCategories: {
    rawMaterials: 'Raw Materials',
    components: 'Components',
    equipment: 'Equipment',
    consumables: 'Consumables'
  },

  // Warehouses
  warehouses: {
    sanFrancisco: 'San Francisco',
    london: 'London',
    tokyo: 'Tokyo'
  },

  // Months
  months: {
    jan: 'Jan',
    feb: 'Feb',
    mar: 'Mar',
    apr: 'Apr',
    may: 'May',
    jun: 'Jun',
    jul: 'Jul',
    aug: 'Aug',
    sep: 'Sep',
    oct: 'Oct',
    nov: 'Nov',
    dec: 'Dec',
    january: 'January',
    february: 'February',
    march: 'March',
    april: 'April',
    june: 'June',
    july: 'July',
    august: 'August',
    september: 'September',
    october: 'October',
    november: 'November',
    december: 'December'
  },

  // Profile Menu
  profile: {
    profileDetails: 'Profile Details',
    myTasks: 'My Tasks',
    logout: 'Logout'
  },

  // Profile Details Modal
  profileDetails: {
    title: 'Profile Details',
    email: 'Email',
    department: 'Department',
    location: 'Location',
    phone: 'Phone',
    joinDate: 'Join Date',
    employeeId: 'Employee ID',
    close: 'Close'
  },

  // Tasks Modal
  tasks: {
    title: 'My Tasks',
    taskTitle: 'Task Title',
    taskTitlePlaceholder: 'Enter task title...',
    priority: 'Priority',
    dueDate: 'Due Date',
    addTask: 'Add Task',
    noTasks: 'No tasks yet. Add your first task above!'
  },

  // Language
  theme: {
    label: 'Design',
    default: 'Default',
    atelier: 'Atelier',
    signal: 'Signal'
  },
  language: {
    english: 'English',
    japanese: 'Japanese',
    selectLanguage: 'Select Language'
  },

  // Reports
  reports: {
    title: 'Performance Reports',
    description: 'View quarterly performance metrics and monthly trends',
    loading: 'Loading reports...',
    loadError: 'Failed to load reports',
    empty: 'No report data for the selected filters',
    notAvailable: 'N/A',
    quarterly: {
      title: 'Quarterly Performance',
      quarter: 'Quarter',
      totalOrders: 'Total Orders',
      totalRevenue: 'Total Revenue',
      avgOrderValue: 'Avg Order Value',
      fulfillmentRate: 'Fulfillment Rate'
    },
    trend: {
      title: 'Monthly Revenue Trend'
    },
    mom: {
      title: 'Month-over-Month Analysis',
      month: 'Month',
      orders: 'Orders',
      revenue: 'Revenue',
      change: 'Change',
      growthRate: 'Growth Rate'
    },
    stats: {
      totalRevenue: 'Total Revenue (YTD)',
      avgMonthlyRevenue: 'Avg Monthly Revenue',
      totalOrders: 'Total Orders (YTD)',
      bestQuarter: 'Best Performing Quarter'
    }
  },

  // Backlog
  backlog: {
    title: 'Backlog Management',
    description: 'Track and resolve inventory shortages',
    loading: 'Loading backlog...',
    loadError: 'Failed to load backlog',
    empty: 'No backlog items - all orders can be fulfilled!',
    itemsTitle: 'Backlog Items',
    stats: {
      highPriority: 'High Priority',
      mediumPriority: 'Medium Priority',
      lowPriority: 'Low Priority',
      totalItems: 'Total Backlog Items'
    },
    table: {
      orderId: 'Order ID',
      sku: 'SKU',
      itemName: 'Item Name',
      quantityNeeded: 'Quantity Needed',
      quantityAvailable: 'Quantity Available',
      shortage: 'Shortage',
      daysDelayed: 'Days Delayed',
      priority: 'Priority'
    },
    unitsShort: '{count} units short',
    days: '{count} days'
  },

  // Backlog detail modal
  backlogDetail: {
    title: 'Inventory Shortage Details',
    shortageAmount: 'Shortage Amount',
    itemSku: 'Item SKU',
    expectedDate: 'Expected Date',
    status: 'Status',
    units: '{count} units',
    priorityBadge: '{priority} Priority',
    notAvailable: 'N/A'
  },

  // Common
  purchaseOrder: {
    createTitle: 'Create Purchase Order',
    viewTitle: 'Purchase Order',
    sku: 'SKU',
    shortage: 'Shortage',
    units: 'units',
    supplierName: 'Supplier Name',
    supplierPlaceholder: 'Enter supplier name',
    quantity: 'Quantity',
    unitCost: 'Unit Cost ($)',
    totalCost: 'Total Cost',
    expectedDelivery: 'Expected Delivery Date',
    notes: 'Notes',
    notesPlaceholder: 'Optional notes',
    status: 'Status',
    createdAt: 'Created',
    submit: 'Create Purchase Order',
    submitting: 'Creating...',
    cancel: 'Cancel',
    close: 'Close',
    loadingOrder: 'Loading purchase order...',
    errors: {
      supplierRequired: 'Supplier name is required',
      quantityInvalid: 'Quantity must be a whole number of at least 1',
      unitCostInvalid: 'Unit cost must be greater than 0',
      dateRequired: 'Expected delivery date is required',
      datePast: 'Expected delivery date cannot be in the past',
      alreadyExists: 'This backlog item already has a purchase order',
      createFailed: 'Failed to create purchase order. Please try again.',
      loadFailed: 'Failed to load purchase order'
    },
    statuses: {
      pending: 'Pending',
      ordered: 'Ordered',
      shipped: 'Shipped',
      received: 'Received',
      cancelled: 'Cancelled'
    }
  },
  common: {
    loading: 'Loading...',
    error: 'Error',
    noData: 'No data available',
    viewDetails: 'View Details',
    close: 'Close',
    save: 'Save',
    cancel: 'Cancel',
    search: 'Search',
    filter: 'Filter',
    export: 'Export',
    items: 'items'
  },

  // Game mode (Backlog Blaster)
  game: {
    title: 'Backlog Blaster',
    subtitle: 'Clear the backlog the only way management has not tried yet: with pallets.',
    canvasLabel: 'Backlog Blaster game field. A forklift at the bottom shoots pallets at descending inventory shortages.',
    loadingRoster: 'Loading the shortages',
    fallbackNote: 'Live backlog unavailable, using sample shortages.',
    start: {
      heading: 'Shift briefing',
      lead: 'Shortages are descending on the dock. You have a forklift and an unlimited supply of pallets. Do not ask where the pallets come from.',
      button: 'Clock in',
      roster: "Today's shortages",
      rosterHint: 'Pulled live from the real backlog. Bigger gap, tougher crate. Longer delay, faster crate.',
      shortage: 'short {n}',
      delayed: '{n}d late',
      priority: { high: 'High', medium: 'Medium', low: 'Low' }
    },
    controls: {
      title: 'Controls',
      move: 'Move: Left / Right arrows or A / D',
      fire: 'Fire pallets: Space, W or Up arrow (hold to auto-fire)',
      pause: 'Pause: P or Escape',
      touch: 'Touch and mouse: use the on-screen buttons below the field',
      legend: 'Field guide',
      powers: 'Power-ups'
    },
    enemies: {
      crate: { name: 'Shortage crate', desc: 'Labelled with the real item. Cracks show damage.' },
      email: { name: 'Urgent Email', desc: 'Fast. One hit. Always marked urgent.' },
      invite: { name: 'Meeting Invite', desc: 'Splits into two smaller meetings when hit.' },
      forecast: { name: 'Sales Forecast', desc: 'Zig-zags. Nobody knows why.' }
    },
    buttons: {
      start: 'Clock in',
      pause: 'Pause',
      resume: 'Resume',
      mute: 'Sound off',
      unmute: 'Sound on',
      retry: 'Retry',
      back: 'Back to dashboard',
      playAgain: 'Play again'
    },
    touch: { left: 'Left', right: 'Right', fire: 'Fire', group: 'On-screen controls' },
    stats: {
      highScore: 'High score',
      revenue: 'Revenue saved',
      lives: 'Safety certificates',
      none: 'None yet'
    },
    hud: {
      score: 'Saved {n}',
      wave: 'Wave {n}/{total}',
      combo: 'Combo x{n}'
    },
    banner: { wave: 'WAVE {n}' },
    combo: { label: 'Combo x{n}' },
    popups: {
      po: 'PO created: {item}',
      split: 'Now two meetings'
    },
    power: {
      coffee: { name: 'Coffee', desc: 'Rapid fire. The forklift vibrates.' },
      jack: { name: 'Pallet Jack', desc: 'Triple shot.' },
      intern: { name: 'Intern', desc: 'A helper drone. Aim not included.' },
      shield: { name: 'Do Not Stack', desc: 'Boxes soak up two hits.', block: 'Boxes absorbed it', decal: 'DO NOT STACK' }
    },
    waves: {
      monday: { title: 'Monday Morning', sub: 'Nobody has had coffee. Including the crates.' },
      monthEnd: { title: 'Month-End Close', sub: 'Everything is due and everything is urgent.' },
      quiet: { title: 'Supplier Went Quiet', sub: 'Last reply: three weeks ago. "Looking into it."' },
      blackFriday: { title: 'Black Friday', sub: 'Demand forecast was off by a factor of yes.' },
      yearEnd: { title: 'Year-End Stocktake', sub: 'Count everything. Then count it again.' },
      auditor: { title: 'The Auditor', sub: 'He just has a few quick questions.' }
    },
    boss: {
      name: 'The Auditor',
      rage: 'Interesting. I am going to need that in writing.'
    },
    pause: { title: 'Paused', hint: 'Press P or Escape to resume' },
    over: {
      title: 'Human Resources',
      subtitle: 'Incident report, form 27-B',
      score: 'Revenue saved',
      wave: 'Reached wave {n}',
      newHigh: 'New high score',
      rank: 'Final rank'
    },
    win: {
      title: 'Backlog cleared',
      certTitle: 'Employee of the Month',
      certLine: 'This certifies that you personally defeated the Auditor.',
      waves: 'Waves survived',
      accuracy: 'Pallet accuracy',
      saved: 'Items saved',
      revenue: 'Revenue saved',
      combo: 'Best combo',
      rank: 'Rank',
      signed: 'Signed, Management (scanned, slightly crooked)'
    },
    ranks: {
      intern: 'Intern',
      associate: 'Warehouse Associate',
      lead: 'Shift Lead',
      manager: 'Dock Manager',
      legend: 'Warehouse Legend'
    },
    live: {
      started: 'Shift started. Wave {n}.',
      wave: 'Wave {n}: {title}',
      lives: '{n} safety certificates left',
      score: 'Revenue saved {n}',
      over: 'Game over. Revenue saved {n}.',
      win: 'The Auditor is defeated. Revenue saved {n}.',
      paused: 'Paused',
      resumed: 'Resumed'
    },
    jokes: {
      hit: {
        1: 'Safety Certificate revoked. Please attend the 90 minute refresher.',
        2: 'That was a near miss. It was also a direct hit.',
        3: 'Per my last email: do not stand there.',
        4: 'An incident report has been filed. By you. Right now.',
        5: 'Ouch. Workers comp has been notified, then ignored.',
        6: 'The forklift is fine. The paperwork is not.'
      },
      breach: {
        1: 'A shortage reached the dock. Somebody has to explain this on Friday.',
        2: 'It slipped through. Now it is a "learning opportunity".',
        3: 'Stock-out on the dock. Please do not photograph it.',
        4: 'Customer service just got a very long email.'
      },
      po: {
        1: 'Just-in-time, finally just in time.',
        2: 'Shortage resolved. Nobody will notice, so here is a popup.',
        3: 'Procurement is thrilled, and also confused.',
        4: 'Backlog down by one. Backlog sighs.',
        5: 'Purchase order approved without a single meeting.'
      },
      bonusKill: {
        1: 'Inbox zero, for about four seconds.',
        2: 'Marked as read. Problem solved.',
        3: 'Replied all. To the void.',
        4: 'That email could have been a pallet.'
      },
      over: {
        1: 'Your performance review has been moved up. Way up.',
        2: 'We are restructuring. You are the structure.',
        3: 'Thank you for your service. Please return the forklift keys.',
        4: 'Backlog 1, you 0. The backlog will not be taking questions.',
        5: 'HR is aware of the situation and has scheduled a survey about it.',
        6: 'Your last day will be remembered. Briefly. In a spreadsheet.'
      },
      loading: {
        1: 'Reconciling the spreadsheet that reconciles the other spreadsheet',
        2: 'Counting inventory. Again.',
        3: 'Waiting on the supplier to reply all',
        4: 'Locating the missing pallet. It was behind the other pallet.'
      },
      taunt: {
        1: 'Per my last email, you are behind.',
        2: 'I only have a few quick questions. Four hundred of them.',
        3: 'Where is the documentation for that pallet?',
        4: 'Is this the final version? Or final_v2_REAL?',
        5: 'Your inventory count is off by one. Hold on, I will find it.',
        6: 'I will need access to every folder you own.',
        7: 'Has this been signed off? By whom? In blue ink?'
      },
      bossDown: {
        1: 'Fine. This was a finding. A positive one.',
        2: 'No further questions. Which is a first.'
      },
      cert: {
        1: 'For outstanding commitment to moving boxes that were never your job.',
        2: 'In recognition of clearing the backlog without being asked twice.',
        3: 'Awarded for surviving an audit with minimal tears.',
        4: 'Prize: a pizza party, pending budget approval.'
      },
      pause: {
        1: 'Paused. This is the best part of any meeting.',
        2: 'Take five. The backlog will wait. It always does.',
        3: 'Break time. Please do not tell Finance.'
      },
      clear: {
        1: 'Wave cleared. The backlog is merely resting.',
        2: 'Nice work. Your reward is more work.',
        3: 'Dock clear. Please enjoy this brief moment of peace.',
        4: 'Zero shortages on screen. Reality will be along shortly.'
      }
    }
  }
}
