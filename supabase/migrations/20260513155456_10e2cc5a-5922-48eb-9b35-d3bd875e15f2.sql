
-- 1. App role enum + user_roles table
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "roles_select_own" ON public.user_roles FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "roles_admin_all" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2. Problems
CREATE TABLE public.problems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'easy', -- easy | medium | hard
  tags TEXT[] NOT NULL DEFAULT '{}',
  related_algo TEXT, -- e.g. 'sorting', 'searching', 'graph', 'tree', 'dp', 'string'
  time_limit_ms INT NOT NULL DEFAULT 2000,
  memory_limit_kb INT NOT NULL DEFAULT 128000,
  starter_code JSONB NOT NULL DEFAULT '{}'::jsonb, -- { "python": "...", "cpp": "...", "javascript": "..." }
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;
CREATE POLICY "problems_public_read" ON public.problems FOR SELECT USING (is_published OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "problems_admin_write" ON public.problems FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 3. Test cases
CREATE TABLE public.test_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id UUID NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
  input TEXT NOT NULL DEFAULT '',
  expected_output TEXT NOT NULL DEFAULT '',
  is_sample BOOLEAN NOT NULL DEFAULT false,
  points INT NOT NULL DEFAULT 10,
  ord INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.test_cases ENABLE ROW LEVEL SECURITY;
-- Public can only see sample cases; admin sees all
CREATE POLICY "test_sample_read" ON public.test_cases FOR SELECT USING (is_sample OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "test_admin_write" ON public.test_cases FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4. Submissions
CREATE TABLE public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_id UUID NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
  language TEXT NOT NULL,
  source_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending | accepted | wrong_answer | runtime_error | tle | mle | compile_error | judging
  score INT NOT NULL DEFAULT 0,
  total_score INT NOT NULL DEFAULT 0,
  passed_count INT NOT NULL DEFAULT 0,
  total_count INT NOT NULL DEFAULT 0,
  runtime_ms INT,
  memory_kb INT,
  results JSONB NOT NULL DEFAULT '[]'::jsonb, -- array of {case_id, status, time, memory, output, expected}
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subs_select_own" ON public.submissions FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "subs_insert_own" ON public.submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "subs_admin_update" ON public.submissions FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_subs_user ON public.submissions(user_id, created_at DESC);
CREATE INDEX idx_subs_problem ON public.submissions(problem_id, created_at DESC);
CREATE INDEX idx_problems_slug ON public.problems(slug);

-- 5. updated_at trigger for problems
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER trg_problems_updated BEFORE UPDATE ON public.problems
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 6. Seed problems
INSERT INTO public.problems (slug, title, description, difficulty, tags, related_algo, starter_code) VALUES
('two-sum', 'Two Sum', E'Cho mảng số nguyên `nums` và số `target`, trả về chỉ số của hai phần tử có tổng bằng `target`.\n\n**Input:** dòng 1 chứa n và target, dòng 2 chứa n số.\n**Output:** hai chỉ số (0-indexed) cách nhau bởi dấu cách.', 'easy', ARRAY['array','hash-table'], 'searching',
'{"python":"# Đọc input từ stdin\nimport sys\nn, target = map(int, input().split())\nnums = list(map(int, input().split()))\n# TODO: in ra hai chỉ số\n","cpp":"#include <bits/stdc++.h>\nusing namespace std;\nint main(){\n    int n, target; cin>>n>>target;\n    vector<int> a(n); for(auto&x:a)cin>>x;\n    // TODO\n    return 0;\n}\n","javascript":"const lines=require(''fs'').readFileSync(0,''utf8'').split(''\\n'');\nconst [n,target]=lines[0].split('' '').map(Number);\nconst nums=lines[1].split('' '').map(Number);\n// TODO\n"}'::jsonb),
('fizzbuzz', 'FizzBuzz', E'In các số từ 1 đến n. Chia hết 3 in "Fizz", chia hết 5 in "Buzz", chia hết cả hai in "FizzBuzz".\n\n**Input:** số nguyên n.\n**Output:** n dòng kết quả.', 'easy', ARRAY['math','simulation'], NULL,
'{"python":"n=int(input())\n# TODO\n","cpp":"#include <bits/stdc++.h>\nusing namespace std;\nint main(){int n;cin>>n; /* TODO */ return 0;}\n","javascript":"const n=Number(require(''fs'').readFileSync(0,''utf8''));\n// TODO\n"}'::jsonb),
('reverse-string', 'Reverse String', E'Đảo ngược chuỗi đầu vào.\n\n**Input:** một chuỗi.\n**Output:** chuỗi đã đảo.', 'easy', ARRAY['string','two-pointers'], 'string',
'{"python":"s=input()\nprint(s[::-1])\n","cpp":"#include<bits/stdc++.h>\nusing namespace std;\nint main(){string s;cin>>s;reverse(s.begin(),s.end());cout<<s;return 0;}\n","javascript":"const s=require(''fs'').readFileSync(0,''utf8'').trim();\nconsole.log(s.split('''').reverse().join(''''));\n"}'::jsonb),
('fibonacci', 'Số Fibonacci thứ n', E'Tính F(n) với F(0)=0, F(1)=1, F(n)=F(n-1)+F(n-2). Với n ≤ 50.', 'easy', ARRAY['dp','math'], 'dp',
'{"python":"n=int(input())\n# TODO\n","cpp":"#include<bits/stdc++.h>\nusing namespace std;\nint main(){long long n;cin>>n; /* TODO */ return 0;}\n","javascript":"const n=Number(require(''fs'').readFileSync(0,''utf8''));\n// TODO\n"}'::jsonb),
('binary-search', 'Binary Search', E'Cho mảng đã sắp xếp tăng dần và giá trị target. Trả về chỉ số (0-indexed) hoặc -1.\n\n**Input:** dòng 1 n và target. Dòng 2 n số.\n**Output:** chỉ số hoặc -1.', 'easy', ARRAY['binary-search','array'], 'searching',
'{"python":"n,t=map(int,input().split())\na=list(map(int,input().split()))\n# TODO\n","cpp":"#include<bits/stdc++.h>\nusing namespace std;\nint main(){int n,t;cin>>n>>t;vector<int>a(n);for(auto&x:a)cin>>x; /* TODO */ return 0;}\n","javascript":"const L=require(''fs'').readFileSync(0,''utf8'').split(''\\n'');\nconst [n,t]=L[0].split('' '').map(Number);\nconst a=L[1].split('' '').map(Number);\n// TODO\n"}'::jsonb),
('bubble-sort', 'Sắp xếp tăng dần', E'Sắp xếp mảng tăng dần và in ra (cách nhau bởi dấu cách).', 'easy', ARRAY['sorting'], 'sorting',
'{"python":"n=int(input())\na=list(map(int,input().split()))\nprint('' ''.join(map(str,sorted(a))))\n","cpp":"#include<bits/stdc++.h>\nusing namespace std;\nint main(){int n;cin>>n;vector<int>a(n);for(auto&x:a)cin>>x;sort(a.begin(),a.end());for(int i=0;i<n;i++)cout<<a[i]<<\" \\n\"[i==n-1];return 0;}\n","javascript":"const L=require(''fs'').readFileSync(0,''utf8'').split(''\\n'');\nconst a=L[1].split('' '').map(Number).sort((x,y)=>x-y);\nconsole.log(a.join('' ''));\n"}'::jsonb),
('palindrome', 'Kiểm tra Palindrome', E'In "YES" nếu chuỗi đối xứng, ngược lại "NO".', 'easy', ARRAY['string'], 'string',
'{"python":"s=input().strip()\nprint(\"YES\" if s==s[::-1] else \"NO\")\n","cpp":"#include<bits/stdc++.h>\nusing namespace std;\nint main(){string s;cin>>s;string r=s;reverse(r.begin(),r.end());cout<<(s==r?\"YES\":\"NO\");return 0;}\n","javascript":"const s=require(''fs'').readFileSync(0,''utf8'').trim();\nconsole.log(s===s.split('''').reverse().join('''')?\"YES\":\"NO\");\n"}'::jsonb),
('gcd', 'Ước chung lớn nhất', E'Tính GCD(a, b).', 'easy', ARRAY['math'], NULL,
'{"python":"import math\na,b=map(int,input().split())\nprint(math.gcd(a,b))\n","cpp":"#include<bits/stdc++.h>\nusing namespace std;\nint main(){long long a,b;cin>>a>>b;cout<<__gcd(a,b);return 0;}\n","javascript":"const [a,b]=require(''fs'').readFileSync(0,''utf8'').split('' '').map(Number);\nconst gcd=(x,y)=>y?gcd(y,x%y):x;\nconsole.log(gcd(a,b));\n"}'::jsonb),
('prime-check', 'Kiểm tra số nguyên tố', E'In "YES" nếu n là số nguyên tố, "NO" nếu không. n ≤ 10^9.', 'medium', ARRAY['math'], NULL, '{}'::jsonb),
('max-subarray', 'Tổng con liên tiếp lớn nhất (Kadane)', E'Cho mảng n số nguyên, tìm tổng con liên tiếp lớn nhất.', 'medium', ARRAY['dp','array'], 'dp', '{}'::jsonb),
('lcs', 'Dãy con chung dài nhất', E'Cho 2 chuỗi, in độ dài LCS.', 'medium', ARRAY['dp','string'], 'dp', '{}'::jsonb),
('knapsack', 'Cái túi 0/1', E'n đồ vật trọng lượng w[i] giá trị v[i], túi sức chứa W. Tìm giá trị max.', 'hard', ARRAY['dp'], 'dp', '{}'::jsonb),
('bfs-shortest', 'BFS đường đi ngắn nhất', E'Cho đồ thị không trọng số, tìm khoảng cách ngắn nhất từ đỉnh 1 đến n.', 'medium', ARRAY['graph','bfs'], 'graph', '{}'::jsonb),
('dijkstra-basic', 'Dijkstra cơ bản', E'Đồ thị có trọng số dương, tìm đường ngắn nhất từ 1 đến n.', 'hard', ARRAY['graph','shortest-path'], 'graph', '{}'::jsonb);

-- 7. Seed sample test cases for first few problems
INSERT INTO public.test_cases (problem_id, input, expected_output, is_sample, points, ord)
SELECT id, E'4 9\n2 7 11 15', '0 1', true, 25, 1 FROM public.problems WHERE slug='two-sum';
INSERT INTO public.test_cases (problem_id, input, expected_output, is_sample, points, ord)
SELECT id, E'3 6\n3 2 4', '1 2', false, 25, 2 FROM public.problems WHERE slug='two-sum';
INSERT INTO public.test_cases (problem_id, input, expected_output, is_sample, points, ord)
SELECT id, E'2 6\n3 3', '0 1', false, 25, 3 FROM public.problems WHERE slug='two-sum';
INSERT INTO public.test_cases (problem_id, input, expected_output, is_sample, points, ord)
SELECT id, E'5 8\n1 4 5 3 7', '3 1', false, 25, 4 FROM public.problems WHERE slug='two-sum';

INSERT INTO public.test_cases (problem_id, input, expected_output, is_sample, points, ord)
SELECT id, '5', E'1\n2\nFizz\n4\nBuzz', true, 50, 1 FROM public.problems WHERE slug='fizzbuzz';
INSERT INTO public.test_cases (problem_id, input, expected_output, is_sample, points, ord)
SELECT id, '15', E'1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz', false, 50, 2 FROM public.problems WHERE slug='fizzbuzz';

INSERT INTO public.test_cases (problem_id, input, expected_output, is_sample, points, ord)
SELECT id, 'hello', 'olleh', true, 50, 1 FROM public.problems WHERE slug='reverse-string';
INSERT INTO public.test_cases (problem_id, input, expected_output, is_sample, points, ord)
SELECT id, 'algorithmica', 'acimhtirogla', false, 50, 2 FROM public.problems WHERE slug='reverse-string';

INSERT INTO public.test_cases (problem_id, input, expected_output, is_sample, points, ord)
SELECT id, '10', '55', true, 25, 1 FROM public.problems WHERE slug='fibonacci';
INSERT INTO public.test_cases (problem_id, input, expected_output, is_sample, points, ord)
SELECT id, '0', '0', false, 25, 2 FROM public.problems WHERE slug='fibonacci';
INSERT INTO public.test_cases (problem_id, input, expected_output, is_sample, points, ord)
SELECT id, '1', '1', false, 25, 3 FROM public.problems WHERE slug='fibonacci';
INSERT INTO public.test_cases (problem_id, input, expected_output, is_sample, points, ord)
SELECT id, '20', '6765', false, 25, 4 FROM public.problems WHERE slug='fibonacci';

INSERT INTO public.test_cases (problem_id, input, expected_output, is_sample, points, ord)
SELECT id, E'5 7\n1 3 5 7 9', '3', true, 50, 1 FROM public.problems WHERE slug='binary-search';
INSERT INTO public.test_cases (problem_id, input, expected_output, is_sample, points, ord)
SELECT id, E'5 4\n1 3 5 7 9', '-1', false, 50, 2 FROM public.problems WHERE slug='binary-search';

INSERT INTO public.test_cases (problem_id, input, expected_output, is_sample, points, ord)
SELECT id, E'5\n3 1 4 1 5', '1 1 3 4 5', true, 50, 1 FROM public.problems WHERE slug='bubble-sort';
INSERT INTO public.test_cases (problem_id, input, expected_output, is_sample, points, ord)
SELECT id, E'6\n9 8 7 6 5 4', '4 5 6 7 8 9', false, 50, 2 FROM public.problems WHERE slug='bubble-sort';

INSERT INTO public.test_cases (problem_id, input, expected_output, is_sample, points, ord)
SELECT id, 'racecar', 'YES', true, 50, 1 FROM public.problems WHERE slug='palindrome';
INSERT INTO public.test_cases (problem_id, input, expected_output, is_sample, points, ord)
SELECT id, 'algorithm', 'NO', false, 50, 2 FROM public.problems WHERE slug='palindrome';

INSERT INTO public.test_cases (problem_id, input, expected_output, is_sample, points, ord)
SELECT id, '12 18', '6', true, 50, 1 FROM public.problems WHERE slug='gcd';
INSERT INTO public.test_cases (problem_id, input, expected_output, is_sample, points, ord)
SELECT id, '1071 462', '21', false, 50, 2 FROM public.problems WHERE slug='gcd';
