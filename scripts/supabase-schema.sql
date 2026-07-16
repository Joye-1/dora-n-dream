-- 哆啦N梦 数据库表

-- 每日单词
CREATE TABLE IF NOT EXISTS daily_words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id TEXT NOT NULL,
  date DATE NOT NULL,
  word TEXT NOT NULL,
  phonetic TEXT DEFAULT '',
  pos TEXT DEFAULT '',
  translation TEXT DEFAULT '',
  collins INT DEFAULT 0,
  bnc INT DEFAULT 0,
  frq INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 短语
CREATE TABLE IF NOT EXISTS word_phrases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word TEXT NOT NULL,
  phrase TEXT NOT NULL,
  translation TEXT DEFAULT '',
  source TEXT DEFAULT 'manual',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 同义词
CREATE TABLE IF NOT EXISTS word_synonyms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word TEXT NOT NULL,
  synonym TEXT NOT NULL,
  source TEXT DEFAULT 'manual',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 错词集
CREATE TABLE IF NOT EXISTS error_book (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id TEXT NOT NULL,
  word TEXT NOT NULL,
  error_rate INT DEFAULT 0,
  error_types JSONB DEFAULT '{"cnToEn":0,"enToCn":0,"listening":0}',
  last_error_date DATE,
  week_start DATE,
  reviewed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 学习时长
CREATE TABLE IF NOT EXISTS learning_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id TEXT NOT NULL,
  date DATE NOT NULL,
  duration_seconds INT DEFAULT 0
);

-- RLS 策略：用户只能访问自己的数据
ALTER TABLE daily_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_book ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own words" ON daily_words FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own words" ON daily_words FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own words" ON daily_words FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own words" ON daily_words FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can read own errors" ON error_book FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own errors" ON error_book FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own errors" ON error_book FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own errors" ON error_book FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can read own sessions" ON learning_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON learning_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON learning_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sessions" ON learning_sessions FOR DELETE USING (auth.uid() = user_id);
