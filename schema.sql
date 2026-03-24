-- schema.sql

-- Hero Ads Table
CREATE TABLE IF NOT EXISTS hero_ads (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    imageUrl TEXT NOT NULL,
    linkUrl TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT 1,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    expiresAt DATETIME
);

-- Blog Posts Table
CREATE TABLE IF NOT EXISTS blog_posts (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    imageUrl TEXT,
    published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    authorName TEXT,
    authorImageUrl TEXT,
    authorId TEXT,
    category TEXT,
    tags TEXT, -- JSON array of strings
    views INTEGER DEFAULT 0,
    metaTitle TEXT,
    metaDescription TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Competitions Table
CREATE TABLE IF NOT EXISTS competitions (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    totalPrize REAL DEFAULT 0,
    deadline DATETIME,
    category TEXT,
    participantType TEXT, -- JSON array of strings
    imageUrl TEXT,
    views INTEGER DEFAULT 0,
    featured BOOLEAN DEFAULT 0,
    isApplicationEnabled BOOLEAN DEFAULT 0,
    formFields TEXT, -- JSON array of FormFieldConfig
    userId TEXT, -- Owner ID
    organizer TEXT,
    location TEXT,
    winnersAnnounced BOOLEAN DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Support Tickets Table
CREATE TABLE IF NOT EXISTS tickets (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    userEmail TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    status TEXT DEFAULT 'open',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Submissions Table
CREATE TABLE IF NOT EXISTS submissions (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    competitionId TEXT NOT NULL,
    submissionDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    submissionDetails TEXT,
    fileUrls TEXT, -- JSON array of strings
    status TEXT DEFAULT 'pending',
    customFields TEXT, -- JSON object
    userName TEXT,
    userEmail TEXT,
    userPhone TEXT,
    organizerId TEXT,
    paymentStatus TEXT DEFAULT 'unpaid', -- unpaid, pending, paid
    paymentAmount REAL DEFAULT 0,
    paymentSlipUrl TEXT,
    stripeSessionId TEXT,
    stripePaymentIntentId TEXT,
    winnerRank INTEGER, -- 1, 2, 3
    winnerAwardName TEXT, -- Winner, Popular Vote, etc.
    isTeamSubmission BOOLEAN DEFAULT 0,
    teamName TEXT,
    teamMembers TEXT, -- JSON array of strings
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Contact Messages Table (Email System)
CREATE TABLE IF NOT EXISTS contact_messages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'unread', -- unread, read, replied
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Site Settings Table (Key-Value)
CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Transactions Table (Finance)
CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL, -- 'income', 'expense'
    amount REAL NOT NULL,
    category TEXT NOT NULL, -- 'ticket_sale', 'sponsor', 'prize_payout', 'other'
    description TEXT,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    userId TEXT,
    competitionId TEXT,
    stripePaymentId TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Vouchers table
CREATE TABLE IF NOT EXISTS vouchers (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL, -- 'percentage', 'fixed'
  value REAL NOT NULL,
  expiryDate TEXT,
  usageLimit INTEGER,
  usageCount INTEGER DEFAULT 0,
  competitionId TEXT, -- Optional: tether to specific competition
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Landing Pages Table
CREATE TABLE IF NOT EXISTS landing_pages (
    id TEXT PRIMARY KEY,
    competitionId TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    sections TEXT NOT NULL, -- JSON
    theme TEXT NOT NULL, -- JSON
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (competitionId) REFERENCES competitions(id)
);
