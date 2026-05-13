import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Header } from "@/components/Header";
import { Reveal } from "@/components/Reveal";
import { supabase } from "@/integrations/supabase/client";
import { submitSolution } from "@/lib/judge.functions";
import { Play, CheckCircle2, XCircle, Clock, MemoryStick, Loader2, Eye } from "lucide-react";
import { toast } from "sonner";

type Problem = {
  id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: string;
  tags: string[];
  related_algo: string | null;
  time_limit_ms: number;
  memory_limit_kb: number;
  starter_code: Record<string, string>;
};

type Sample = { id: string; input: string; expected_output: string };

const LANGS = [
  { id: "python", label: "Python 3" },
  { id: "cpp", label: "C++17" },
  { id: "c", label: "C" },
  { id: "java", label: "Java" },
  { id: "javascript", label: "JavaScript" },
] as const;

type LangId = (typeof LANGS)[number]["id"];

const ALGO_LINKS: Record<string, string> = {
  sorting: "/sorting",
  searching: "/searching",
  graph: "/graph",
  tree: "/tree",
  string: "/string",
  dp: "/dp",
};

export const Route = createFileRoute("/problems/$slug")({
  component: ProblemPage,
});

function ProblemPage() {
  const { slug } = Route.useParams();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [lang, setLang] = useState<LangId>("python");
  const [code, setCode] = useState("");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [tab, setTab] = useState<"problem" | "viz">("problem");
  const submit = useServerFn(submitSolution);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("problems")
        .select("id,slug,title,description,difficulty,tags,related_algo,time_limit_ms,memory_limit_kb,starter_code")
        .eq("slug", slug)
        .single();
      if (error || !data) { throw notFound(); }
      setProblem(data as Problem);
      const { data: tc } = await supabase
        .from("test_cases")
        .select("id,input,expected_output")
        .eq("problem_id", data.id)
        .eq("is_sample", true)
        .order("ord", { ascending: true });
      setSamples(tc ?? []);
    })();
  }, [slug]);

  useEffect(() => {
    if (!problem) return;
    const starter = problem.starter_code?.[lang] ?? "";
    setCode(starter);
  }, [problem, lang]);

  async function onSubmit() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error("Hãy đăng nhập để nộp bài"); return; }
    if (!problem) return;
    if (!code.trim()) { toast.error("Code rỗng"); return; }
    setRunning(true);
    setResult(null);
    try {
      const r = await submit({ data: { problemId: problem.id, language: lang, sourceCode: code } });
      setResult(r);
      if (r.status === "accepted") toast.success(`Accepted · ${r.score}/${r.totalCount * 0 + r.passedCount}/${r.totalCount}`);
      else toast.error(`${statusLabel(r.status)} · ${r.passedCount}/${r.totalCount}`);
    } catch (e: any) {
      toast.error(e?.message ?? "Submit thất bại");
    } finally {
      setRunning(false);
    }
  }

  if (!problem) return <div className="min-h-screen bg-background"><Header /><div className="p-10 text-sm text-muted-foreground">Đang tải...</div></div>;

  const algoLink = problem.related_algo ? ALGO_LINKS[problem.related_algo] : null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-7xl px-6 py-8">
        <Link to="/problems" className="text-xs text-muted-foreground hover:text-foreground">← Bài tập</Link>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] mt-3">
          {/* LEFT: problem statement */}
          <Reveal>
            <div className="rounded-md border border-border bg-card overflow-hidden">
              <div className="border-b border-border flex">
                <button onClick={() => setTab("problem")} className={`px-4 py-2.5 text-sm ${tab === "problem" ? "border-b-2 border-accent text-foreground" : "text-muted-foreground"}`}>Đề bài</button>
                {algoLink && (
                  <button onClick={() => setTab("viz")} className={`px-4 py-2.5 text-sm flex items-center gap-1.5 ${tab === "viz" ? "border-b-2 border-accent text-foreground" : "text-muted-foreground"}`}>
                    <Eye className="h-3.5 w-3.5" /> Gợi ý trực quan
                  </button>
                )}
              </div>

              {tab === "problem" && (
                <div className="p-6">
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border border-border bg-muted">{problem.difficulty}</span>
                    {problem.tags.map((t) => (
                      <span key={t} className="text-[10px] uppercase tracking-wider text-muted-foreground">#{t}</span>
                    ))}
                  </div>
                  <h1 className="text-3xl font-bold mb-1">{problem.title}</h1>
                  <div className="flex gap-4 text-xs text-muted-foreground mb-6">
                    <span>⏱ {problem.time_limit_ms}ms</span>
                    <span>💾 {Math.round(problem.memory_limit_kb / 1024)}MB</span>
                  </div>
                  <article className="text-sm leading-relaxed whitespace-pre-wrap">{problem.description}</article>

                  {samples.length > 0 && (
                    <div className="mt-8 space-y-4">
                      <h3 className="text-sm font-bold uppercase tracking-wider">Test mẫu</h3>
                      {samples.map((s, i) => (
                        <div key={s.id} className="grid sm:grid-cols-2 gap-3 text-xs">
                          <div>
                            <div className="text-muted-foreground mb-1">Input #{i + 1}</div>
                            <pre className="rounded bg-muted p-3 overflow-x-auto">{s.input}</pre>
                          </div>
                          <div>
                            <div className="text-muted-foreground mb-1">Output</div>
                            <pre className="rounded bg-muted p-3 overflow-x-auto">{s.expected_output}</pre>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {tab === "viz" && algoLink && (
                <div className="p-6 text-sm">
                  <p className="mb-4 text-muted-foreground">Bài này thuộc chủ đề <strong className="text-foreground">{problem.related_algo}</strong>. Mở visualizer để xem từng bước thuật toán liên quan.</p>
                  <Link to={algoLink} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
                    Mở Visualizer →
                  </Link>
                </div>
              )}
            </div>
          </Reveal>

          {/* RIGHT: editor + result */}
          <Reveal delay={80}>
            <div className="rounded-md border border-border bg-card overflow-hidden">
              <div className="flex items-center justify-between border-b border-border px-3 py-2">
                <select value={lang} onChange={(e) => setLang(e.target.value as LangId)} className="rounded border border-input bg-background px-2 py-1 text-xs">
                  {LANGS.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
                </select>
                <button onClick={onSubmit} disabled={running}
                  className="inline-flex items-center gap-1.5 rounded bg-primary px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:opacity-90 disabled:opacity-60">
                  {running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                  {running ? "Đang chấm" : "Submit"}
                </button>
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                className="w-full h-[460px] resize-none bg-background p-4 text-[13px] leading-relaxed outline-none"
                placeholder={`Viết code ${lang}...`}
              />

              {result && (
                <div className="border-t border-border p-4 space-y-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <StatusBadge status={result.status} />
                    <span className="text-xs text-muted-foreground">{result.passedCount}/{result.totalCount} test</span>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3 w-3" />{result.runtimeMs}ms</span>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><MemoryStick className="h-3 w-3" />{result.memoryKb}KB</span>
                    <span className="ml-auto text-xs font-bold">Điểm: {result.score}</span>
                  </div>
                  {result.errorMessage && (
                    <pre className="text-xs bg-destructive/10 border border-destructive/30 text-destructive p-3 rounded overflow-auto max-h-40">{result.errorMessage}</pre>
                  )}
                  <div className="space-y-1.5">
                    {result.results?.map((r: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        {r.status === "accepted" ? <CheckCircle2 className="h-3.5 w-3.5 text-success" /> : <XCircle className="h-3.5 w-3.5 text-destructive" />}
                        <span>Test {i + 1}</span>
                        <span className="text-muted-foreground">{statusLabel(r.status)}</span>
                        {r.time_ms != null && <span className="ml-auto text-muted-foreground tabular-nums">{r.time_ms}ms</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cls = status === "accepted"
    ? "bg-success/15 text-success border-success/40"
    : status === "judging" || status === "pending"
    ? "bg-muted text-muted-foreground"
    : "bg-destructive/15 text-destructive border-destructive/40";
  return <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded border text-xs font-bold uppercase tracking-wider ${cls}`}>{statusLabel(status)}</span>;
}

function statusLabel(s: string) {
  return ({
    accepted: "Accepted",
    wrong_answer: "Wrong Answer",
    tle: "Time Limit",
    mle: "Memory Limit",
    runtime_error: "Runtime Error",
    compile_error: "Compile Error",
    judging: "Đang chấm",
    pending: "Chờ",
    error: "Lỗi",
  } as Record<string, string>)[s] ?? s;
}
