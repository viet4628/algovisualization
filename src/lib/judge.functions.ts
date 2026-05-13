import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// Judge0 language IDs (CE)
const LANG_IDS: Record<string, number> = {
  python: 71,      // Python 3.8.1
  cpp: 54,         // C++ (GCC 9.2.0)
  c: 50,           // C (GCC 9.2.0)
  java: 62,        // Java (OpenJDK 13.0.1)
  javascript: 63,  // JavaScript (Node.js 12.14.0)
};

const JUDGE0_HOST = "judge0-ce.p.rapidapi.com";

type Judge0Result = {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
  status: { id: number; description: string };
  time: string | null;
  memory: number | null;
};

async function runOnce(sourceCode: string, languageId: number, stdin: string, timeLimitSec: number, memoryKb: number): Promise<Judge0Result> {
  const apiKey = process.env.JUDGE0_RAPIDAPI_KEY;
  if (!apiKey) throw new Error("JUDGE0_RAPIDAPI_KEY is not configured");

  const res = await fetch(`https://${JUDGE0_HOST}/submissions?base64_encoded=false&wait=true`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-RapidAPI-Host": JUDGE0_HOST,
      "X-RapidAPI-Key": apiKey,
    },
    body: JSON.stringify({
      source_code: sourceCode,
      language_id: languageId,
      stdin,
      cpu_time_limit: timeLimitSec,
      memory_limit: memoryKb,
    }),
  });

  if (!res.ok) throw new Error(`Judge0 API error [${res.status}]: ${await res.text()}`);
  return (await res.json()) as Judge0Result;
}

function normalize(s: string): string {
  return s.replace(/\r\n/g, "\n").split("\n").map((l) => l.trimEnd()).join("\n").trimEnd();
}

function mapStatus(judgeStatusId: number): string {
  // Judge0 status IDs: https://ce.judge0.com/#statuses-and-languages-status-get
  if (judgeStatusId === 3) return "accepted";
  if (judgeStatusId === 4) return "wrong_answer";
  if (judgeStatusId === 5) return "tle";
  if (judgeStatusId === 6) return "compile_error";
  if (judgeStatusId >= 7 && judgeStatusId <= 12) return "runtime_error";
  return "wrong_answer";
}

const SubmitSchema = z.object({
  problemId: z.string().uuid(),
  language: z.enum(["python", "cpp", "c", "java", "javascript"]),
  sourceCode: z.string().min(1).max(64_000),
});

export const submitSolution = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => SubmitSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Fetch problem & test cases (admin client to read hidden cases server-side)
    const [{ data: problem, error: pErr }, { data: cases, error: cErr }] = await Promise.all([
      supabaseAdmin.from("problems").select("id,time_limit_ms,memory_limit_kb,is_published").eq("id", data.problemId).single(),
      supabaseAdmin.from("test_cases").select("id,input,expected_output,points").eq("problem_id", data.problemId).order("ord", { ascending: true }),
    ]);
    if (pErr || !problem) throw new Error("Bài tập không tồn tại");
    if (!problem.is_published) throw new Error("Bài tập chưa công bố");
    if (cErr) throw new Error(cErr.message);
    const testCases = cases ?? [];
    if (testCases.length === 0) throw new Error("Bài tập chưa có test case");

    const langId = LANG_IDS[data.language];
    const timeSec = Math.max(1, Math.round(problem.time_limit_ms / 1000));
    const memKb = problem.memory_limit_kb;

    // Create pending submission first
    const { data: subRow, error: sErr } = await supabase
      .from("submissions")
      .insert({
        user_id: userId,
        problem_id: data.problemId,
        language: data.language,
        source_code: data.sourceCode,
        status: "judging",
        total_count: testCases.length,
        total_score: testCases.reduce((s, t) => s + (t.points ?? 0), 0),
      })
      .select("id")
      .single();
    if (sErr || !subRow) throw new Error(sErr?.message ?? "Không tạo được submission");

    // Run sequentially for fairness; could parallelize
    let passed = 0;
    let totalScore = 0;
    let maxTime = 0;
    let maxMem = 0;
    let finalStatus: string = "accepted";
    let firstError: string | null = null;
    type CaseResult = { case_id: string; status: string; time_ms?: number; memory_kb?: number; output?: string; expected?: string; message?: string };
    const results: CaseResult[] = [];

    for (const tc of testCases) {
      let r: Judge0Result;
      try {
        r = await runOnce(data.sourceCode, langId, tc.input, timeSec, memKb);
      } catch (e: any) {
        finalStatus = "runtime_error";
        firstError = e?.message ?? "Lỗi gọi Judge0";
        results.push({ case_id: tc.id, status: "error", message: firstError ?? undefined });
        break;
      }

      const stdout = normalize(r.stdout ?? "");
      const expected = normalize(tc.expected_output ?? "");
      const t = r.time ? parseFloat(r.time) * 1000 : 0;
      const m = r.memory ?? 0;
      maxTime = Math.max(maxTime, t);
      maxMem = Math.max(maxMem, m);

      let caseStatus = mapStatus(r.status.id);
      if (caseStatus === "accepted" && stdout !== expected) caseStatus = "wrong_answer";

      if (caseStatus === "accepted") {
        passed += 1;
        totalScore += tc.points ?? 0;
      } else {
        if (finalStatus === "accepted") {
          finalStatus = caseStatus;
          firstError = r.stderr || r.compile_output || r.message || null;
        }
      }

      results.push({
        case_id: tc.id,
        status: caseStatus,
        time_ms: Math.round(t),
        memory_kb: m,
        // Truncate output for storage
        output: stdout.slice(0, 500),
        expected: expected.slice(0, 500),
      });
    }

    if (passed === 0 && finalStatus === "accepted") finalStatus = "wrong_answer";

    const { error: uErr } = await supabaseAdmin
      .from("submissions")
      .update({
        status: finalStatus,
        passed_count: passed,
        score: totalScore,
        runtime_ms: Math.round(maxTime),
        memory_kb: maxMem,
        results,
        error_message: firstError,
      })
      .eq("id", subRow.id);
    if (uErr) throw new Error(uErr.message);

    return {
      submissionId: subRow.id,
      status: finalStatus,
      passedCount: passed,
      totalCount: testCases.length,
      score: totalScore,
      runtimeMs: Math.round(maxTime),
      memoryKb: maxMem,
      results,
      errorMessage: firstError,
    };
  });
