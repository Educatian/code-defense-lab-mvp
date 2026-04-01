const STORAGE_KEY = "code-defense-lab-workspace-state-v1";

const MODULE_PATHS = {
  hotspot: "./hotspot-questions.html",
  trace: "./trace-mode-task.html",
  mutation: "./mutation-task.html",
  repair: "./repair-mode-task.html",
};

const STEP_CONFIG = [
  { key: "submission", path: "./student-submission.html", label: "Submission" },
  { key: "hotspot", path: MODULE_PATHS.hotspot, label: "Hotspot Review", module: "hotspot" },
  { key: "trace", path: MODULE_PATHS.trace, label: "Trace Mode", module: "trace" },
  { key: "mutation", path: MODULE_PATHS.mutation, label: "Mutation Task", module: "mutation" },
  { key: "repair", path: MODULE_PATHS.repair, label: "Repair Mode", module: "repair" },
  { key: "result", path: "./student-result.html", label: "Results" },
];

const DEMO_STUDENT_NAMES = [
  "Alex Chen",
  "Morgan Lee",
  "Priya Nair",
  "Jordan Park",
  "Sam Rivera",
  "Taylor Kim",
  "Noah Patel",
];

const DEMO_PROVENANCE = [
  "Written mostly by myself",
  "Used AI assistance",
  "Used external example(s)",
  "Used both AI and external examples",
];

const REVIEW_QUEUE_SAMPLE_SIZE = 3;

const longestSubstringSource = [
  "def length_of_longest_substring(s: str) -> int:",
  "    char_map = {}",
  "    left = 0",
  "    max_length = 0",
  "",
  "    for right in range(len(s)):",
  "        if s[right] in char_map:",
  "            left = max(left, char_map[s[right]] + 1)",
  "",
  "        char_map[s[right]] = right",
  "        max_length = max(max_length, right - left + 1)",
  "",
  "    return max_length",
].join("\n");

const longestSubstringMutation = [
  "def length_of_longest_substring(s: str | None) -> int:",
  "    char_map = {}",
  "    left = 0",
  "    max_length = 0",
  "",
  "    for right in range(len(s)):",
  "        if s[right] in char_map:",
  "            left = max(left, char_map[s[right]] + 1)",
  "",
  "        char_map[s[right]] = right",
  "        max_length = max(max_length, right - left + 1)",
  "",
  "    return max_length",
].join("\n");

const longestSubstringRepair = [
  "def length_of_longest_substring(s: str) -> int:",
  "    char_map = {}",
  "    left = 0",
  "    max_length = 0",
  "",
  "    for right in range(len(s)):",
  "        if s[right] in char_map:",
  "            left = left",
  "",
  "        char_map[s[right]] = right",
  "        max_length = max(max_length, right - left + 1)",
  "",
  "    return max_length",
].join("\n");

const binarySearchSource = [
  "def search(nums: list[int], target: int) -> int:",
  "    left, right = 0, len(nums) - 1",
  "",
  "    while left <= right:",
  "        mid = (left + right) // 2",
  "        if nums[mid] == target:",
  "            return mid",
  "        if nums[mid] < target:",
  "            left = mid + 1",
  "        else:",
  "            right = mid - 1",
  "",
  "    return -1",
].join("\n");

const binarySearchMutation = [
  "def search(nums: list[int], target: int) -> int:",
  "    left, right = 0, len(nums) - 1",
  "",
  "    while left <= right:",
  "        mid = (left + right) // 2",
  "        if nums[mid] == target:",
  "            return mid",
  "        if nums[mid] < target:",
  "            left = mid + 1",
  "        else:",
  "            right = mid - 1",
  "",
  "    return -1",
].join("\n");

const binarySearchRepair = [
  "def search(nums: list[int], target: int) -> int:",
  "    left, right = 0, len(nums) - 1",
  "",
  "    while left <= right:",
  "        mid = (left + right) // 2",
  "        if nums[mid] == target:",
  "            return mid",
  "        elif nums[mid] < target:",
  "            left = left",
  "        else:",
  "            right = mid - 1",
  "",
  "    return -1",
].join("\n");

const safeHandlerSource = [
  "def safe_handler(s: str | None) -> int:",
  "    if s is None:",
  "        return 0",
  "",
  "    char_map = {}",
  "    left = 0",
  "    max_length = 0",
  "",
  "    for right in range(len(s)):",
  "        if s[right] in char_map:",
  "            left = max(left, char_map[s[right]] + 1)",
  "        char_map[s[right]] = right",
  "        max_length = max(max_length, right - left + 1)",
  "",
  "    return max_length",
].join("\n");

const safeHandlerMutation = [
  "def safe_handler(s: str | None) -> int:",
  "    char_map = {}",
  "    left = 0",
  "    max_length = 0",
  "",
  "    for right in range(len(s)):",
  "        if s[right] in char_map:",
  "            left = max(left, char_map[s[right]] + 1)",
  "        char_map[s[right]] = right",
  "        max_length = max(max_length, right - left + 1)",
  "",
  "    return max_length",
].join("\n");

const safeHandlerRepair = [
  "def safe_handler(s: str | None) -> int:",
  "    if s is None:",
  "        return 1",
  "",
  "    char_map = {}",
  "    left = 0",
  "    max_length = 0",
  "",
  "    for right in range(len(s)):",
  "        if s[right] in char_map:",
  "            left = max(left, char_map[s[right]] + 1)",
  "        char_map[s[right]] = right",
  "        max_length = max(max_length, right - left + 1)",
  "",
  "    return max_length",
].join("\n");

const defaultDraft = longestSubstringSource;

function createDefaultModules(overrides = {}) {
  return {
    hotspot: overrides.hotspot ?? true,
    trace: overrides.trace ?? true,
    mutation: overrides.mutation ?? true,
    repair: overrides.repair ?? true,
  };
}

function createDefaultResponses(overrides = {}) {
  return {
    provenance: overrides.provenance || "Written mostly by myself",
    hotspot: {
      q1: overrides.hotspot?.q1 || "",
      q2: overrides.hotspot?.q2 || "",
      q3: overrides.hotspot?.q3 || "",
    },
    trace: {
      q1: overrides.trace?.q1 || "",
      q2: overrides.trace?.q2 || "",
      q3: overrides.trace?.q3 || "",
    },
    mutation: {
      plan: overrides.mutation?.plan || "",
    },
    repair: {
      plan: overrides.repair?.plan || "",
    },
  };
}

function createDefaultAssignment(overrides = {}) {
  const starterCode = overrides.starterCode || overrides.sourceCode || defaultDraft;

  return {
    id: overrides.id || "",
    title: overrides.title || "Untitled Assignment",
    due: overrides.due || "Due date TBD",
    summary: overrides.summary || "Understanding checks will be configured for this assignment.",
    prompt:
      overrides.prompt ||
      "Open this homework and submit the code you want to defend across the assessment pipeline.",
    hotspotFocus:
      overrides.hotspotFocus ||
      "Explain the line that expands or contracts the active window and why it protects correctness.",
    traceScenario:
      overrides.traceScenario ||
      'Trace the algorithm on the hidden input "pwwkew" and predict each state update before the code runs.',
    mutationPrompt:
      overrides.mutationPrompt ||
      "Modify the submitted solution so it handles a changed input contract safely without breaking the original reasoning model.",
    repairPrompt:
      overrides.repairPrompt ||
      "Repair a broken variant of the same algorithm by correcting the specific line that now violates the original logic.",
    hiddenTests:
      overrides.hiddenTests ||
      [
        'assert length_of_longest_substring("") == 0',
        'assert length_of_longest_substring("abcabcbb") == 3',
        'assert length_of_longest_substring("bbbbb") == 1',
        'assert length_of_longest_substring("pwwkew") == 3',
      ].join("\n"),
    sourceFile: overrides.sourceFile || "solution.py",
    sourceCode: overrides.sourceCode || starterCode,
    starterCode,
    draftCode: overrides.draftCode || starterCode,
    mutationFile: overrides.mutationFile || overrides.sourceFile || "mutation.py",
    mutationCode: overrides.mutationCode || starterCode,
    mutationFailureOutput:
      overrides.mutationFailureOutput || "TypeError: object of type 'NoneType' has no len()",
    repairFile: overrides.repairFile || overrides.sourceFile || "repair.py",
      repairCode: overrides.repairCode || starterCode,
      repairDetectedIn: overrides.repairDetectedIn || "Detected in: algorithm repair checkpoint",
      modules: createDefaultModules(overrides.modules),
      responses: createDefaultResponses(overrides.responses),
    };
}

const defaultState = {
  activeCourseId: "advanced-algorithms",
  activeAssignmentId: "advanced-algorithms-longest-substring",
  draftCode: defaultDraft,
  reviewContext: null,
  courses: [
    {
      id: "advanced-algorithms",
      title: "Advanced Algorithms",
      term: "Spring 2026 / Section A",
      learners: 42,
      note: "Current unit: sliding windows, binary search, and proof-of-understanding checkpoints.",
      assignments: [
        createDefaultAssignment({
          id: "advanced-algorithms-longest-substring",
          title: "Longest Substring Without Repeating Characters",
          due: "Opens Apr 2 / Due Apr 9",
          summary: "Includes hotspot, trace, mutation, and repair mode.",
          prompt:
            "Write a Python function to find the longest substring without repeating characters. You may use AI assistance, but you must defend the same logic through hotspot, trace, mutation, and repair.",
          hotspotFocus:
            "Focus on the sliding-window lines that move left and right. Explain how each pointer keeps the substring valid.",
          traceScenario:
            'Trace the algorithm with input "pwwkew". Predict max_len, left, and char_map after each iteration.',
          mutationPrompt:
            'Modify your solution so it safely handles a None input by returning 0 before any window logic runs.',
          repairPrompt:
            "Fix the broken sliding-window variant where the left pointer fails to move past a repeated character.",
          hiddenTests: [
            'assert length_of_longest_substring("") == 0',
            'assert length_of_longest_substring("abcabcbb") == 3',
            'assert length_of_longest_substring("bbbbb") == 1',
            'assert length_of_longest_substring("pwwkew") == 3',
            'assert length_of_longest_substring("abba") == 2',
          ].join("\n"),
          sourceFile: "longest_substring.py",
          sourceCode: longestSubstringSource,
          starterCode: longestSubstringSource,
          mutationFile: "longest_substring_mutation.py",
          mutationCode: longestSubstringMutation,
          mutationFailureOutput: "TypeError: object of type 'NoneType' has no len()",
          repairFile: "longest_substring_repair.py",
          repairCode: longestSubstringRepair,
          repairDetectedIn: "Detected in: sliding-window duplicate handling",
        }),
        createDefaultAssignment({
          id: "advanced-algorithms-binary-search",
          title: "Binary Search Failure Modes",
          due: "Due Apr 12",
          summary: "Repair-focused lab on pointer movement and loop guards.",
          prompt:
            "Inspect a binary search implementation, explain the role of each pointer, then repair a broken loop variant.",
          hotspotFocus:
            "Focus on the branch that moves the left pointer. Explain when it should skip past mid and why.",
          traceScenario:
            "Trace the algorithm on a sorted list after the target misses at least once in both directions.",
          mutationPrompt:
            "Adapt the binary search so it safely handles an empty input and exits without touching mid.",
          repairPrompt:
            "Repair the binary search variant where the left pointer is not incremented after nums[mid] is smaller than target.",
          hiddenTests: [
            "assert search([], 4) == -1",
            "assert search([1, 3, 5, 7], 5) == 2",
            "assert search([1, 3, 5, 7], 2) == -1",
          ].join("\n"),
          sourceFile: "binary_search.py",
          sourceCode: binarySearchSource,
          starterCode: binarySearchSource,
          mutationFile: "binary_search_mutation.py",
          mutationCode: binarySearchMutation,
          mutationFailureOutput: "IndexError: list index out of range",
          repairFile: "binary_search_repair.py",
          repairCode: binarySearchRepair,
          repairDetectedIn: "Detected in: binary search left-pointer update",
        }),
      ],
    },
    {
      id: "secure-software-engineering",
      title: "Secure Software Engineering",
      term: "Spring 2026 / Section B",
      learners: 31,
      note: "Current unit: memory safety, defensive mutation tasks, and repair explanations.",
      assignments: [
        createDefaultAssignment({
          id: "secure-software-engineering-null-input",
          title: "Null Input Mutation Defense",
          due: "Due Apr 15",
          summary: "Learners patch function contracts when constraints change.",
          prompt:
            "Modify a working function so it safely handles a None input while preserving the original reasoning model.",
          hotspotFocus:
            "Identify the first line where the function assumes a valid input and explain how that assumption can break.",
          traceScenario:
            "Trace the function once with a normal string input, then describe the first failing step when input becomes None.",
          mutationPrompt:
            "Add a guard so the function returns 0 when input is None and continues to behave normally for valid strings.",
          repairPrompt:
            "Repair the broken defensive version where the guard exists but returns the wrong fallback value.",
          hiddenTests: [
            "assert safe_handler(None) == 0",
            'assert safe_handler("abc") == 3',
          ].join("\n"),
          sourceFile: "safe_handler.py",
          sourceCode: safeHandlerSource,
          starterCode: safeHandlerSource,
          mutationFile: "safe_handler_mutation.py",
          mutationCode: safeHandlerMutation,
          mutationFailureOutput: "TypeError: object of type 'NoneType' has no len()",
          repairFile: "safe_handler_repair.py",
          repairCode: safeHandlerRepair,
          repairDetectedIn: "Detected in: defensive fallback value",
        }),
      ],
    },
  ],
};

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatModuleList(modules) {
  return Object.entries(modules)
    .filter(([, enabled]) => enabled)
    .map(([name]) => name[0].toUpperCase() + name.slice(1))
    .join(", ");
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function hashString(value) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) % 1000003;
  }
  return hash;
}

function scoreFromSeed(seed, min, max) {
  const span = max - min + 1;
  return min + (hashString(seed) % span);
}

function normalizeResponses(responses) {
  return createDefaultResponses(responses || {});
}

function evaluateTextResponse(text, min = 12, max = 100) {
  const normalized = String(text || "").trim();
  if (!normalized) return 0;
  if (normalized.length >= 220) return max;
  const ratio = normalized.length / 220;
  return Math.round(min + (max - min) * ratio);
}

function average(values) {
  const numeric = values.filter((value) => typeof value === "number" && !Number.isNaN(value));
  if (!numeric.length) return 0;
  return Math.round(numeric.reduce((sum, value) => sum + value, 0) / numeric.length);
}

function countAnswered(values) {
  return values.filter((value) => String(value || "").trim()).length;
}

function summarizeText(text, fallback) {
  const normalized = String(text || "").trim().replace(/\s+/g, " ");
  if (!normalized) return fallback;
  return normalized.length > 180 ? `${normalized.slice(0, 177)}...` : normalized;
}

function createStudentBadgeId(name, assignmentId) {
  const initials = (name || "Student")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "X")
    .join("");
  const suffix = String(hashString(`${name}-${assignmentId || "assignment"}`)).slice(0, 3).padStart(3, "0");
  return `${new Date().getFullYear()}-${initials || "ST"}-${suffix}`;
}

function metricLabel(key) {
  return {
    hotspot: "Hotspot Explanation",
    trace: "Trace Reasoning",
    mutation: "Mutation Adaptation",
    repair: "Repair Logic",
    correctness: "Code Correctness",
  }[key];
}

function weakestMetricKey(result) {
  return Object.entries(result.metrics)
    .filter(([key, value]) => key !== "correctness" && typeof value === "number")
    .sort((a, b) => a[1] - b[1])[0]?.[0];
}

function metricStatus(value) {
  if (typeof value !== "number") return "not-assigned";
  if (value >= 80) return "strong";
  if (value >= 60) return "developing";
  return "fragile";
}

function getCheckpointResponseCounts(responses) {
  return {
    hotspot: countAnswered(Object.values(responses.hotspot)),
    trace: countAnswered(Object.values(responses.trace)),
    mutation: countAnswered([responses.mutation.plan]),
    repair: countAnswered([responses.repair.plan]),
  };
}

function createSyntheticResponses(assignment, studentSeed) {
  const bandScore = scoreFromSeed(`${studentSeed}-band`, 0, 99);
  const band = bandScore >= 72 ? "strong" : bandScore >= 42 ? "developing" : "fragile";
  const responsePlan = {
    strong: { hotspot: 3, trace: 3, mutation: 1, repair: 1 },
    developing: { hotspot: 2, trace: 2, mutation: 1, repair: 1 },
    fragile: { hotspot: 1, trace: 1, mutation: scoreFromSeed(`${studentSeed}-mutation`, 0, 1), repair: 0 },
  }[band];

  const hotspotPool = [
    `The pressure point is the line that keeps the active invariant stable. In ${assignment.title}, I would point to the pointer update and explain that it prevents the window from including a repeated character twice.`,
    `I would defend the hotspot by naming the exact line that expands or narrows the working region. If that line stops moving correctly, the algorithm still returns something, but the state no longer matches the rule the rest of the code assumes.`,
    `The hotspot matters because it is where the algorithm chooses what stays in the valid window. My explanation would focus on why that line protects correctness before any later max-length update happens.`,
  ];

  const tracePool = [
    `On the trace input I would log each pointer move in order. The important part is not the final answer but why the state changes when a duplicate or failed comparison appears.`,
    `The trace should show one state transition at a time. I would record the current window, then explain exactly why left or right changes before the next iteration begins.`,
    `My trace explanation would stay concrete: current character, stored index, pointer move, then resulting valid range. That keeps the reasoning tied to state instead of intuition.`,
  ];

  const mutationPool = [
    `I would restate the changed contract first, then add the smallest guard that keeps the original invariant intact. The goal is to adapt input handling without rewriting the whole algorithm.`,
    `For mutation, I would defend the branch I add by showing which failure appears under the new contract and why the new guard isolates that case before the original logic resumes.`,
  ];

  const repairPool = [
    `I would compare the broken line against the known-good movement rule and repair only the branch that now violates it. The key is showing why the restored pointer movement matches the original invariant again.`,
    `For repair, I would name the branch that stopped converging, then explain why the corrected update restores progress and keeps the state valid on the next iteration.`,
  ];

  const responses = createDefaultResponses({
    provenance: DEMO_PROVENANCE[scoreFromSeed(`${studentSeed}-provenance`, 0, DEMO_PROVENANCE.length - 1)],
  });

  [responses.hotspot.q1, responses.hotspot.q2, responses.hotspot.q3] = hotspotPool.map((text, index) =>
    index < responsePlan.hotspot ? text : ""
  );
  [responses.trace.q1, responses.trace.q2, responses.trace.q3] = tracePool.map((text, index) =>
    index < responsePlan.trace ? text : ""
  );
  responses.mutation.plan = responsePlan.mutation ? mutationPool[scoreFromSeed(`${studentSeed}-mutation-copy`, 0, mutationPool.length - 1)] : "";
  responses.repair.plan = responsePlan.repair ? repairPool[scoreFromSeed(`${studentSeed}-repair-copy`, 0, repairPool.length - 1)] : "";

  return { responses, band };
}

function createSyntheticLearnerEntry(course, assignment, assignmentIndex, learnerIndex) {
  const seed = `${assignment.id}-student-${assignmentIndex}-${learnerIndex}`;
  const name = DEMO_STUDENT_NAMES[(assignmentIndex * REVIEW_QUEUE_SAMPLE_SIZE + learnerIndex) % DEMO_STUDENT_NAMES.length];
  const studentId = createStudentBadgeId(name, `${assignment.id}-${learnerIndex}`);
  const { responses, band } = createSyntheticResponses(assignment, seed);
  const attempt = normalizeAssignment(
    {
      ...assignment,
      draftCode:
        learnerIndex % 2 === 0
          ? assignment.sourceCode
          : `# Student snapshot\n${assignment.sourceCode}`,
      responses,
    },
    assignment.id
  );
  const result = createDefaultMetrics(attempt);
  const coverage = getResponseCoverage(attempt);

  return {
    assignmentIndex,
    studentId,
    studentBand: band,
    name,
    courseTitle: course.title,
    courseId: course.id,
    assignmentId: assignment.id,
    assignmentTitle: assignment.title,
    provenance: responses.provenance,
    result,
    coverage,
    responses,
    draftCode: attempt.draftCode,
    riskReason: riskReasonFromResult(result, coverage, responses.provenance),
  };
}

function riskReasonFromResult(result, coverage = { answered: 0, total: 0 }, provenance = "") {
  const weakest = weakestMetricKey(result);

  if (coverage.total && coverage.answered === 0) {
    return "No reasoning evidence saved beyond the code draft";
  }

  if (result.level === "HIGH") {
    return coverage.answered < coverage.total
      ? "Strong understanding, but one checkpoint still has thin evidence"
      : "Stable understanding across the enabled checkpoints";
  }

  if (weakest && result.metrics.correctness >= 85 && result.metrics[weakest] < 60) {
    return `Strong final answer, but ${metricLabel(weakest)} is fragile`;
  }

  if (/AI|external/i.test(provenance) && weakest) {
    return `${metricLabel(weakest)} should be discussed live before review closes`;
  }

  if (coverage.total && coverage.answered / coverage.total < 0.5 && weakest) {
    return `Limited saved evidence for ${metricLabel(weakest)}`;
  }

  if (!weakest) return "Checkpoint evidence incomplete";
  return `${metricLabel(weakest)} needs follow-up`;
}

function createRubricDimension(label, score, status, explanation) {
  return { label, score, status, explanation };
}

function createRubricFeedback(assignment, result) {
  const responses = normalizeResponses(assignment.responses);
  const counts = getCheckpointResponseCounts(responses);

  const assessmentMetrics = Object.entries(result.metrics)
    .filter(([key, value]) => key !== "correctness" && typeof value === "number")
    .sort((a, b) => b[1] - a[1]);

  const strongest = assessmentMetrics[0];
  const weakest = assessmentMetrics[assessmentMetrics.length - 1];
  const answeredSteps = counts.hotspot + counts.trace + counts.mutation + counts.repair;

  let strengthSummary = "The saved evidence is still light, so the strongest pattern is not clear yet.";
  if (strongest) {
    const [key, value] = strongest;
    if (value >= 80) {
      strengthSummary = `${metricLabel(key)} is currently your strongest checkpoint. The saved response suggests you can explain this part of ${assignment.title} in your own words rather than only recognizing the final answer.`;
    } else if (value >= 60) {
      strengthSummary = `${metricLabel(key)} is the most stable part of your current submission. There is some real understanding here, even if the explanation still needs more precision.`;
    } else {
      strengthSummary = `No checkpoint is fully stable yet, but ${metricLabel(key)} is the least fragile of the saved responses so far.`;
    }
  }

  let gapSummary = "No major risk is visible yet because there is not enough saved evidence.";
  if (weakest) {
    const [key, value] = weakest;
    if (value < 60) {
      gapSummary = `${metricLabel(key)} is the main gap right now. The response is either missing or too thin to show a reliable mental model of the algorithm at that stage.`;
    } else if (value < 80) {
      gapSummary = `${metricLabel(key)} still looks developing. You seem to know the direction, but the saved explanation does not yet make the reasoning concrete enough to feel dependable.`;
    } else {
      gapSummary = `The profile is fairly balanced. Small differences remain, but none of the enabled checkpoints collapsed.`;
    }
  }

  let nextStep = `Add fuller written reasoning to the weakest checkpoint so the result reflects how you think, not just the final code.`;
  if (weakest?.[0] === "hotspot") {
    nextStep = `Return to the hotspot step and name the exact line that preserves the invariant. Then explain what would break first if that line behaved incorrectly.`;
  } else if (weakest?.[0] === "trace") {
    nextStep = `Redo the trace with one concrete input and record each state transition in order. Focus on pointer movement or map updates, not just the final return value.`;
  } else if (weakest?.[0] === "mutation") {
    nextStep = `Before editing code, restate the changed contract in one sentence. Then describe the guard or branch you would add and why it protects the original logic.`;
  } else if (weakest?.[0] === "repair") {
    nextStep = `Compare the working and broken variants line by line. Name the exact branch that fails, then explain why the corrected movement or fallback restores the original behavior.`;
  } else if (result.consistency >= 80) {
    nextStep = `Your understanding looks stable. A good next step is to practice the same reasoning pattern on a new problem without copying the structure of this one.`;
  }

  const caption =
    result.level === "HIGH"
      ? "Your saved explanations and adaptation steps largely support the same mental model as the submitted code."
      : result.level === "MEDIUM"
      ? "The overall model is partially there, but at least one checkpoint still reads as incomplete or mechanical."
      : "The final code and the saved reasoning still feel separated. The next win is to make your thinking visible step by step.";

  const diagnosticMessage =
    answeredSteps === 0
      ? "No reasoning evidence has been saved yet, so this report is mostly reading the draft code itself."
      : result.consistency >= 80
      ? "Strong consistency detected between the submitted code and the learner's saved reasoning across the assessment flow."
      : result.consistency >= 60
      ? "A partial understanding signal is present, but one or more checkpoints still need fuller reasoning to confirm stability."
      : "A noticeable gap remains between the submitted code and the learner's saved reasoning across the checkpoints.";

  const dimensionSummaries = [
    createRubricDimension(
      "Code Correctness",
      result.metrics.correctness,
      metricStatus(result.metrics.correctness),
      result.metrics.correctness >= 85
        ? "The submitted program structure is largely sound and handles the visible task well."
        : result.metrics.correctness >= 70
        ? "The code is directionally correct, but there are still signs the final implementation may be brittle."
        : "The final code still needs correction before the reasoning checkpoints can fully support it."
    ),
    ...(typeof result.metrics.hotspot === "number"
      ? [
          createRubricDimension(
            "Hotspot Explanation",
            result.metrics.hotspot,
            metricStatus(result.metrics.hotspot),
            counts.hotspot === 0
              ? "No hotspot defense was saved, so the most sensitive line in the algorithm is still unproven."
              : result.metrics.hotspot >= 80
              ? "You identified the pressure point and explained why that line protects the invariant."
              : result.metrics.hotspot >= 60
              ? "You named the right region of the code, but the explanation still needs a sharper cause-and-effect statement."
              : "The hotspot response is still too thin to show why that line matters to correctness."
          ),
        ]
      : []),
    ...(typeof result.metrics.trace === "number"
      ? [
          createRubricDimension(
            "Trace Reasoning",
            result.metrics.trace,
            metricStatus(result.metrics.trace),
            counts.trace === 0
              ? "No trace prediction was saved, so state movement is not yet visible in the evidence."
              : result.metrics.trace >= 80
              ? "The trace shows a stable mental model of how the state changes over time."
              : result.metrics.trace >= 60
              ? "The trace has the right direction, but it skips some state transitions that would make the reasoning more dependable."
              : "The trace still jumps from input to answer without enough intermediate state to prove understanding."
          ),
        ]
      : []),
    ...(typeof result.metrics.mutation === "number"
      ? [
          createRubricDimension(
            "Mutation Adaptation",
            result.metrics.mutation,
            metricStatus(result.metrics.mutation),
            counts.mutation === 0
              ? "No mutation plan was saved, so the changed contract has not been defended yet."
              : result.metrics.mutation >= 80
              ? "The adaptation plan preserves the original logic while handling the new contract cleanly."
              : result.metrics.mutation >= 60
              ? "You recognized the changed contract, but the guard or branch you described is still underspecified."
              : "The mutation response does not yet show how the original invariant survives under the changed contract."
          ),
        ]
      : []),
    ...(typeof result.metrics.repair === "number"
      ? [
          createRubricDimension(
            "Repair Logic",
            result.metrics.repair,
            metricStatus(result.metrics.repair),
            counts.repair === 0
              ? "No repair explanation was saved, so the broken branch still reads as guesswork."
              : result.metrics.repair >= 80
              ? "The repair explanation clearly links the broken line to the restored invariant."
              : result.metrics.repair >= 60
              ? "You found the risky branch, but the fix still needs a clearer explanation of why progress resumes."
              : "The repair note names a bug, but it does not yet explain why the corrected behavior becomes reliable."
          ),
        ]
      : []),
  ];

  const evidenceSummary =
    answeredSteps === 0
      ? "No checkpoint writing has been saved yet, so this report is mostly reading the code draft and the enabled module configuration."
      : `You saved ${answeredSteps} checkpoint response${answeredSteps === 1 ? "" : "s"} across ${formatModuleList(assignment.modules) || "the active modules"}. The report weighs both the final code and the written reasoning.`;

  const breakdownLine = strongest && weakest
    ? `${metricLabel(strongest[0])} is currently strongest, while ${metricLabel(weakest[0])} is the next place to deepen. Correctness sits at ${result.metrics.correctness}%, and the rest of the feedback asks whether your reasoning keeps pace with that final answer.`
    : `Correctness is ${result.metrics.correctness}%, but there is not enough enabled checkpoint data yet to compare reasoning strength across modules.`;

  return {
    strengthSummary,
    gapSummary,
    nextStep,
    caption,
    diagnosticMessage,
    evidenceSummary,
    breakdownLine,
    dimensionSummaries,
  };
}

function createSyntheticDashboardResult(assignment, index) {
  const metrics = {
    correctness: scoreFromSeed(`${assignment.id}-dashboard-correctness-${index}`, 72, 98),
    hotspot: assignment.modules.hotspot
      ? scoreFromSeed(`${assignment.id}-dashboard-hotspot-${index}`, 52, 92)
      : null,
    trace: assignment.modules.trace
      ? scoreFromSeed(`${assignment.id}-dashboard-trace-${index}`, 36, 88)
      : null,
    mutation: assignment.modules.mutation
      ? scoreFromSeed(`${assignment.id}-dashboard-mutation-${index}`, 40, 86)
      : null,
    repair: assignment.modules.repair
      ? scoreFromSeed(`${assignment.id}-dashboard-repair-${index}`, 34, 82)
      : null,
  };

  const gradedValues = Object.values(metrics).filter((value) => typeof value === "number");
  const consistency = average(gradedValues);

  return {
    metrics,
    consistency,
    level: consistency >= 80 ? "HIGH" : consistency >= 60 ? "MEDIUM" : "LOW",
  };
}

function getResponseCoverage(assignment) {
  const responses = normalizeResponses(assignment.responses);
  const answered =
    countAnswered(Object.values(responses.hotspot)) +
    countAnswered(Object.values(responses.trace)) +
    countAnswered([responses.mutation.plan, responses.repair.plan]);
  const total =
    (assignment.modules.hotspot ? 3 : 0) +
    (assignment.modules.trace ? 3 : 0) +
    (assignment.modules.mutation ? 1 : 0) +
    (assignment.modules.repair ? 1 : 0);
  return { answered, total };
}

function getAssignmentProgressState(assignment) {
  const responses = normalizeResponses(assignment.responses);
  const flow = getEnabledFlow(assignment);
  const checks = {
    submission: Boolean((assignment.draftCode || "").trim()),
    hotspot: !assignment.modules.hotspot || countAnswered(Object.values(responses.hotspot)) > 0,
    trace: !assignment.modules.trace || countAnswered(Object.values(responses.trace)) > 0,
    mutation: !assignment.modules.mutation || Boolean(responses.mutation.plan.trim()),
    repair: !assignment.modules.repair || Boolean(responses.repair.plan.trim()),
  };

  const firstIncomplete = flow.find((step) => step.key !== "result" && !checks[step.key]);
  const completedSteps = flow.filter((step) => step.key !== "result" && checks[step.key]).length;
  const actionableFlow = flow.filter((step) => step.key !== "result");

  return {
    completedSteps,
    totalSteps: actionableFlow.length,
    nextStep: firstIncomplete || flow[flow.length - 1],
    statusLabel:
      completedSteps === 0
        ? "Not started"
        : completedSteps >= actionableFlow.length
        ? "Ready for results"
        : "In progress",
  };
}

function getStudentCta(assignment, isActiveAssignment) {
  const progress = getAssignmentProgressState(assignment);
  if (progress.completedSteps === 0) {
    return { label: "Start Homework", emphasis: "bg-primary text-white" };
  }
  if (progress.completedSteps >= progress.totalSteps) {
    return {
      label: isActiveAssignment ? "Review Results" : "Open Results",
      emphasis: "bg-slate-900 text-white",
    };
  }
  return {
    label: isActiveAssignment ? `Resume ${progress.nextStep.label}` : `Continue ${progress.nextStep.label}`,
    emphasis: "bg-primary text-white",
  };
}

function buildReviewQueue(state) {
  const entries = [];
  let assignmentIndex = 0;

  state.courses.forEach((course) => {
    course.assignments.forEach((assignment) => {
      const isActive = assignment.id === state.activeAssignmentId;
      if (isActive) {
        const actualResponses = normalizeResponses(assignment.responses);
        const actualResult = createDefaultMetrics(assignment);
        const actualCoverage = getResponseCoverage(assignment);
        entries.push({
          assignmentIndex,
          studentId: createStudentBadgeId("Alex Chen", assignment.id),
          studentBand: actualResult.level.toLowerCase(),
          name: "Alex Chen",
          courseTitle: course.title,
          courseId: course.id,
          assignmentId: assignment.id,
          assignmentTitle: assignment.title,
          provenance: actualResponses.provenance,
          result: actualResult,
          coverage: actualCoverage,
          responses: actualResponses,
          draftCode: assignment.draftCode,
          riskReason: riskReasonFromResult(actualResult, actualCoverage, actualResponses.provenance),
        });
      }

      const syntheticCount = isActive ? REVIEW_QUEUE_SAMPLE_SIZE - 1 : REVIEW_QUEUE_SAMPLE_SIZE;
      for (let learnerIndex = 0; learnerIndex < syntheticCount; learnerIndex += 1) {
        entries.push(createSyntheticLearnerEntry(course, assignment, assignmentIndex, learnerIndex));
      }
      assignmentIndex += 1;
    });
  });

  return entries.sort((a, b) => a.result.consistency - b.result.consistency);
}

function renderReviewQueue(queue) {
  const tbody = document.getElementById("review-queue-body");
  if (!tbody) return;

  if (!queue.length) {
    tbody.innerHTML = `<tr><td colspan="9" class="px-4 py-6 text-sm text-slate-500">No assignments have been published yet, so the review queue is empty.</td></tr>`;
    return;
  }

  tbody.innerHTML = queue
    .map((entry) => {
      const levelClass =
        entry.result.level === "HIGH"
          ? "bg-blue-50 text-tertiary"
          : entry.result.level === "MEDIUM"
          ? "bg-amber-50 text-amber-700"
          : "bg-red-50 text-red-700";
      const traceValue = typeof entry.result.metrics.trace === "number" ? `${entry.result.metrics.trace}%` : "N/A";
      const repairValue = typeof entry.result.metrics.repair === "number" ? `${entry.result.metrics.repair}%` : "N/A";
      return `
        <tr>
          <td class="px-4 py-4"><strong>${escapeHtml(entry.name)}</strong><div class="text-xs text-slate-500 mt-1">${escapeHtml(entry.studentId)}</div><div class="text-xs text-slate-400 mt-1">${escapeHtml(entry.provenance)}</div></td>
          <td class="px-4 py-4">${escapeHtml(entry.courseTitle)}</td>
          <td class="px-4 py-4">${escapeHtml(entry.assignmentTitle)}</td>
          <td class="px-4 py-4">${entry.result.metrics.correctness}%</td>
          <td class="px-4 py-4 ${entry.result.metrics.trace !== null && entry.result.metrics.trace < 60 ? "text-red-700 font-semibold" : ""}">${traceValue}</td>
          <td class="px-4 py-4 ${entry.result.metrics.repair !== null && entry.result.metrics.repair < 60 ? "text-red-700 font-semibold" : ""}">${repairValue}</td>
          <td class="px-4 py-4"><span class="px-3 py-1 rounded-full ${levelClass} font-semibold">${entry.result.consistency}%</span><div class="text-[11px] text-slate-400 mt-1">${entry.coverage.answered}/${entry.coverage.total || 0} evidence saved</div></td>
          <td class="px-4 py-4 text-sm ${entry.result.level === "LOW" ? "text-red-700" : entry.result.level === "MEDIUM" ? "text-amber-700" : "text-slate-600"}">${escapeHtml(entry.riskReason)}</td>
          <td class="px-4 py-4"><a class="text-sky-700 font-semibold no-underline review-open-link" data-course-id="${entry.courseId}" data-assignment-id="${entry.assignmentId}" data-student-id="${entry.studentId}" href="./professor-student-detail.html">Open review</a></td>
        </tr>
      `;
    })
    .join("");

  tbody.querySelectorAll(".review-open-link").forEach((link) => {
    link.addEventListener("click", () => {
      const nextState = loadState();
      const entry = queue.find(
        (item) =>
          item.courseId === link.dataset.courseId &&
          item.assignmentId === link.dataset.assignmentId &&
          item.studentId === link.dataset.studentId
      );
      nextState.activeCourseId = link.dataset.courseId || nextState.activeCourseId;
      nextState.activeAssignmentId = link.dataset.assignmentId || nextState.activeAssignmentId;
      nextState.reviewContext = entry
        ? {
            studentName: entry.name,
            studentId: entry.studentId,
            provenance: entry.provenance,
            result: entry.result,
            riskReason: entry.riskReason,
            assignmentId: entry.assignmentId,
            courseId: entry.courseId,
            coverage: entry.coverage,
            responses: entry.responses,
            draftCode: entry.draftCode,
          }
        : null;
      saveState(nextState);
    });
  });
}

function createDefaultMetrics(assignment) {
  const responses = normalizeResponses(assignment.responses);
  const hotspotQuality = average([
    evaluateTextResponse(responses.hotspot.q1),
    evaluateTextResponse(responses.hotspot.q2),
    evaluateTextResponse(responses.hotspot.q3),
  ]);
  const traceQuality = average([
    evaluateTextResponse(responses.trace.q1),
    evaluateTextResponse(responses.trace.q2),
    evaluateTextResponse(responses.trace.q3),
  ]);
  const mutationQuality = evaluateTextResponse(responses.mutation.plan);
  const repairQuality = evaluateTextResponse(responses.repair.plan);
  const draftQuality = evaluateTextResponse(assignment.draftCode || assignment.sourceCode, 48, 96);

  const metrics = {
    correctness: clamp(
      Math.round(scoreFromSeed(`${assignment.title}-correctness`, 78, 94) * 0.6 + draftQuality * 0.4),
      40,
      99
    ),
    hotspot: assignment.modules.hotspot
      ? clamp(
          Math.round(scoreFromSeed(`${assignment.title}-hotspot`, 58, 86) * 0.55 + hotspotQuality * 0.45),
          18,
          99
        )
      : null,
    trace: assignment.modules.trace
      ? clamp(
          Math.round(scoreFromSeed(`${assignment.title}-trace`, 42, 82) * 0.55 + traceQuality * 0.45),
          18,
          99
        )
      : null,
    mutation: assignment.modules.mutation
      ? clamp(
          Math.round(scoreFromSeed(`${assignment.title}-mutation`, 44, 80) * 0.55 + mutationQuality * 0.45),
          18,
          99
        )
      : null,
    repair: assignment.modules.repair
      ? clamp(
          Math.round(scoreFromSeed(`${assignment.title}-repair`, 40, 78) * 0.55 + repairQuality * 0.45),
          18,
          99
        )
      : null,
  };

  const gradedValues = Object.values(metrics).filter((value) => typeof value === "number");
  const consistency = Math.round(
    gradedValues.reduce((sum, value) => sum + value, 0) / gradedValues.length
  );

  return {
    metrics,
    consistency,
    level: consistency >= 80 ? "HIGH" : consistency >= 60 ? "MEDIUM" : "LOW",
  };
}

function normalizeAssignment(assignment, fallbackId) {
  return createDefaultAssignment({
    ...assignment,
    id: assignment?.id || fallbackId,
    modules: createDefaultModules(assignment?.modules || {}),
    responses: normalizeResponses(assignment?.responses),
  });
}

function normalizeState(raw) {
  const state = raw && typeof raw === "object" ? raw : {};
  const courses =
    Array.isArray(state.courses) && state.courses.length > 0 ? state.courses : defaultState.courses;

  const normalizedCourses = courses.map((course, courseIndex) => {
    const courseId = course.id || `course-${courseIndex + 1}`;
    return {
      id: courseId,
      title: course.title || `Course ${courseIndex + 1}`,
      term: course.term || "Unscheduled term",
      learners: Number.isFinite(Number(course.learners)) ? Number(course.learners) : 0,
      note: course.note || "No course note yet.",
      assignments: Array.isArray(course.assignments)
        ? course.assignments.map((assignment, assignmentIndex) =>
            normalizeAssignment(assignment, `${courseId}-assignment-${assignmentIndex + 1}`)
          )
        : [],
    };
  });

  const fallbackCourse = normalizedCourses[0];
  const fallbackAssignment = fallbackCourse?.assignments?.[0];

  return {
    activeCourseId: state.activeCourseId || fallbackCourse?.id || "",
    activeAssignmentId: state.activeAssignmentId || fallbackAssignment?.id || "",
    draftCode:
      typeof state.draftCode === "string" && state.draftCode.trim()
        ? state.draftCode
        : defaultDraft,
    reviewContext: state.reviewContext && typeof state.reviewContext === "object" ? state.reviewContext : null,
    courses: normalizedCourses,
  };
}

function loadState() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return normalizeState(defaultState);
    return normalizeState(JSON.parse(stored));
  } catch {
    return normalizeState(defaultState);
  }
}

function saveState(state) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function totalAssignments(courses) {
  return courses.reduce((sum, course) => sum + course.assignments.length, 0);
}

function findCourse(state, courseId) {
  return state.courses.find((course) => course.id === courseId) ?? state.courses[0];
}

function findAssignment(state, assignmentId) {
  for (const course of state.courses) {
    const assignment = course.assignments.find((item) => item.id === assignmentId);
    if (assignment) return { course, assignment };
  }

  const fallbackCourse = state.courses[0];
  const fallbackAssignment = fallbackCourse?.assignments?.[0];
  return { course: fallbackCourse, assignment: fallbackAssignment };
}

function findAssignmentInCourse(course, assignmentId) {
  return course?.assignments.find((item) => item.id === assignmentId) ?? course?.assignments?.[0];
}

function getAssignmentDraft(assignment) {
  return assignment?.draftCode?.trim() ? assignment.draftCode : assignment?.starterCode || defaultDraft;
}

function updateAssignmentDraft(state, assignmentId, code) {
  const { assignment } = findAssignment(state, assignmentId);
  if (assignment) assignment.draftCode = code;
  state.draftCode = code;
  return state;
}

function updateAssignmentResponse(state, assignmentId, group, field, value) {
  const { assignment } = findAssignment(state, assignmentId);
  if (!assignment) return state;
  assignment.responses = normalizeResponses(assignment.responses);

  if (field) {
    assignment.responses[group] = assignment.responses[group] || {};
    assignment.responses[group][field] = value;
  } else {
    assignment.responses[group] = value;
  }

  return state;
}

function bindStoredValue(element, value, callback, eventName = "input") {
  if (!element) return;
  if (typeof value === "string" && element.value !== value) element.value = value;
  element.addEventListener(eventName, () => callback(element.value));
}

function bindRadioGroup(name, selectedValue, callback) {
  const radios = document.querySelectorAll(`input[name="${name}"]`);
  if (!radios.length) return;

  radios.forEach((radio) => {
    radio.checked = radio.value === selectedValue;
    radio.addEventListener("change", () => {
      if (radio.checked) callback(radio.value);
    });
  });
}

function getActiveAssignmentForCourse(state, course) {
  if (!course) return null;
  const current = course.assignments.find((assignment) => assignment.id === state.activeAssignmentId);
  return current || course.assignments[0] || null;
}

function getEnabledFlow(assignment) {
  return STEP_CONFIG.filter((step) => !step.module || assignment?.modules?.[step.module]);
}

function getNextStep(assignment, currentKey) {
  const enabledFlow = getEnabledFlow(assignment);
  const currentIndex = enabledFlow.findIndex((step) => step.key === currentKey);
  if (currentIndex === -1) return enabledFlow[enabledFlow.length - 1];
  return enabledFlow[currentIndex + 1] || enabledFlow[enabledFlow.length - 1];
}

function getStepMeta(assignment, currentKey) {
  const enabledFlow = getEnabledFlow(assignment);
  const currentIndex = enabledFlow.findIndex((step) => step.key === currentKey);
  const safeIndex = currentIndex === -1 ? 0 : currentIndex;
  const total = enabledFlow.length;
  const percent = total > 0 ? Math.round(((safeIndex + 1) / total) * 100) : 100;
  return {
    current: safeIndex + 1,
    total,
    percent,
  };
}

function renderStepProgress(options) {
  const { assignment, currentKey, stepTextId, percentTextId, barId, barsContainerId } = options;
  const meta = getStepMeta(assignment, currentKey);

  const stepText = document.getElementById(stepTextId);
  if (stepText) stepText.textContent = `Step ${meta.current} of ${meta.total}`;

  const percentText = percentTextId ? document.getElementById(percentTextId) : null;
  if (percentText) percentText.textContent = `${meta.percent}% Complete`;

  const bar = barId ? document.getElementById(barId) : null;
  if (bar) bar.style.width = `${meta.percent}%`;

  const barsContainer = barsContainerId ? document.getElementById(barsContainerId) : null;
  if (barsContainer) {
    const bars = Array.from(barsContainer.children);
    bars.forEach((child, index) => {
      child.className =
        index < meta.current
          ? "h-1.5 w-8 rounded-full bg-tertiary"
          : "h-1.5 w-8 rounded-full bg-slate-300";
    });
  }
}

function configureNextLink(linkId, labelId, assignment, currentKey, prefix) {
  const link = document.getElementById(linkId);
  if (!link) return;

  const nextStep = getNextStep(assignment, currentKey);
  if (nextStep) link.href = nextStep.path;

  const label = document.getElementById(labelId);
  if (label && nextStep) label.textContent = `${prefix}${nextStep.label}`;
}

function applyModuleVisibility(assignment, nextLinkIds = []) {
  Object.entries(MODULE_PATHS).forEach(([module, path]) => {
    const enabled = Boolean(assignment?.modules?.[module]);
    document.querySelectorAll(`a[href="${path}"]`).forEach((link) => {
      if (nextLinkIds.includes(link.id)) return;
      link.style.display = enabled ? "" : "none";
    });
  });
}

function renderInlineCode(container, code, theme) {
  if (!container) return;
  const lines = code.split("\n");
  const numberClass = theme === "dark" ? "text-slate-600" : "text-outline-variant";
  const codeClass = theme === "dark" ? "text-slate-300" : "text-slate-700";

  container.innerHTML = lines
    .map((line, index) => {
      const content = line.length > 0 ? escapeHtml(line) : "&nbsp;";
      return `
        <div class="flex">
          <span class="w-10 shrink-0 text-right pr-4 select-none ${numberClass}">${index + 1}</span>
          <span class="whitespace-pre-wrap ${codeClass}">${content}</span>
        </div>
      `;
    })
    .join("");
}

function renderTracePre(container, code) {
  if (!container) return;
  container.innerHTML = code
    .split("\n")
    .map(
      (line, index) =>
        `<span class="text-slate-400">${String(index + 1)}</span>  ${escapeHtml(line)}`
    )
    .join("\n");
}

function renderMutationPanel(container, code) {
  if (!container) return;
  container.innerHTML = `<pre class="whitespace-pre-wrap text-slate-300">${escapeHtml(code)}</pre>`;
}

function renderRubricDimensionCards(container, dimensionSummaries) {
  if (!container) return;
  container.innerHTML = dimensionSummaries
    .map((dimension) => {
      const badgeClass =
        dimension.status === "strong"
          ? "bg-blue-50 text-tertiary"
          : dimension.status === "developing"
          ? "bg-amber-50 text-amber-700"
          : dimension.status === "fragile"
          ? "bg-red-50 text-red-700"
          : "bg-slate-100 text-slate-600";
      const scoreLabel = typeof dimension.score === "number" ? `${dimension.score}%` : "N/A";
      return `
        <div class="rounded-xl border border-outline-variant/10 bg-surface-container-low p-4">
          <div class="flex items-center justify-between gap-3 mb-3">
            <p class="font-mono text-[11px] uppercase tracking-[0.16em] text-slate-500">${escapeHtml(dimension.label)}</p>
            <span class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.16em] ${badgeClass}">${escapeHtml(dimension.status)}</span>
          </div>
          <p class="text-2xl font-headline font-bold text-on-surface mb-2">${scoreLabel}</p>
          <p class="text-sm text-on-surface-variant leading-relaxed">${escapeHtml(dimension.explanation)}</p>
        </div>
      `;
    })
    .join("");
}

function renderMetricsGrid(container, assignment) {
  if (!container) return;

  const result = createDefaultMetrics(assignment);
  const cards = [
    { label: "Correctness", value: result.metrics.correctness, color: "bg-tertiary", text: "text-white" },
    { label: "Hotspot Understanding", value: result.metrics.hotspot, color: "bg-tertiary", text: "text-white" },
    { label: "Trace Reasoning", value: result.metrics.trace, color: "bg-secondary", text: "text-on-surface" },
    { label: "Mutation Adaptability", value: result.metrics.mutation, color: "bg-secondary", text: "text-on-surface" },
    { label: "Repair Ability", value: result.metrics.repair, color: "bg-error", text: "text-on-surface" },
  ];

  container.innerHTML = cards
    .map((card) => {
      const enabled = typeof card.value === "number";
      const height = enabled ? `${card.value}%` : "12%";
      const display = enabled ? `${card.value}%` : "N/A";
      const barClass = enabled ? card.color : "bg-slate-300";
      const textClass = enabled ? card.text : "text-slate-500";
      const mixClass = card.text === "text-white" ? "mix-blend-difference" : "";

      return `
        <div class="flex flex-col items-center w-full group ${enabled ? "" : "opacity-50"}">
          <div class="relative w-full h-48 bg-surface-container rounded-lg overflow-hidden">
            <div class="absolute bottom-0 w-full ${barClass} transition-all duration-1000" style="height: ${height};"></div>
            <div class="absolute inset-0 flex items-center justify-center font-mono font-bold text-lg ${textClass} ${mixClass}">${display}</div>
          </div>
          <span class="mt-4 font-mono text-[10px] text-on-surface-variant uppercase tracking-widest text-center">${card.label}</span>
        </div>
      `;
    })
    .join("");
}

function renderProfessorCourses(state) {
  const registry = document.getElementById("course-registry");
  if (!registry) return;

  registry.innerHTML = state.courses
    .map((course, index) => {
      const assignments = course.assignments.length
        ? course.assignments
            .map(
              (assignment, assignmentIndex) => `
                <div class="bg-white rounded-xl border border-slate-200 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <p class="font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.15em] text-sky-700 mb-1">Homework ${String(
                      assignmentIndex + 1
                    ).padStart(2, "0")}</p>
                    <h4 class="font-semibold">${assignment.title}</h4>
                    <p class="text-sm text-slate-500 mt-1">${assignment.summary}</p>
                    <p class="text-xs text-slate-400 mt-2">${assignment.due}</p>
                    <p class="text-xs text-slate-400 mt-2">Modules: ${formatModuleList(assignment.modules) || "None"}</p>
                  </div>
                  <a class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-700 text-white no-underline edit-assignment-link" data-course-id="${course.id}" data-assignment-id="${assignment.id}" href="./create-assignment.html">Edit <span class="material-symbols-outlined text-base">north_east</span></a>
                </div>
              `
            )
            .join("")
        : `<div class="bg-white rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">No assignments yet. Add one from the quick form on the right.</div>`;

      return `
        <article class="rounded-2xl bg-slate-50 border border-slate-200 p-5">
          <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <p class="font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.16em] text-sky-700 mb-2">Course ${String(
                index + 1
              ).padStart(2, "0")}</p>
              <h3 class="font-['Space_Grotesk'] text-xl font-bold">${course.title}</h3>
              <p class="text-slate-500 mt-2">${course.term} | ${course.learners} learners | ${course.note}</p>
            </div>
            <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 font-['JetBrains_Mono'] text-[11px] uppercase tracking-[0.14em] text-slate-500">${course.assignments.length} assignments live</span>
          </div>
          <div class="mt-4 grid gap-3">
            ${assignments}
          </div>
        </article>
      `;
    })
    .join("");

  registry.querySelectorAll(".edit-assignment-link").forEach((link) => {
    link.addEventListener("click", () => {
      const nextState = loadState();
      nextState.activeCourseId = link.dataset.courseId || nextState.activeCourseId;
      nextState.activeAssignmentId = link.dataset.assignmentId || nextState.activeAssignmentId;
      saveState(nextState);
    });
  });
}

function populateCourseSelect(select, state, selectedId) {
  if (!select) return;
  select.innerHTML = state.courses
    .map(
      (course) =>
        `<option value="${course.id}" ${course.id === selectedId ? "selected" : ""}>${course.title}</option>`
    )
    .join("");
}

function populateAssignmentSelect(select, course, selectedId) {
  if (!select) return;
  if (!course?.assignments?.length) {
    select.innerHTML = `<option value="">No assignments yet</option>`;
    return;
  }

  select.innerHTML = course.assignments
    .map(
      (assignment) =>
        `<option value="${assignment.id}" ${assignment.id === selectedId ? "selected" : ""}>${assignment.title}</option>`
    )
    .join("");
}

function renderProfessorDashboard() {
  const courseButton = document.getElementById("register-course-btn");
  const assignmentButton = document.getElementById("register-assignment-btn");
  if (!courseButton || !assignmentButton) return;

  let state = loadState();

  const courseTitleInput = document.getElementById("course-title-input");
  const courseTermInput = document.getElementById("course-term-input");
  const courseCountInput = document.getElementById("course-count-input");
  const courseNoteInput = document.getElementById("course-note-input");
  const courseFeedback = document.getElementById("course-register-feedback");

  const assignmentCourseSelect = document.getElementById("assignment-course-select");
  const assignmentTitleInput = document.getElementById("assignment-title-input");
  const assignmentDueInput = document.getElementById("assignment-due-input");
  const assignmentSummaryInput = document.getElementById("assignment-summary-input");
  const assignmentFeedback = document.getElementById("assignment-register-feedback");
  const activeCoursesStat = document.getElementById("stat-active-courses");
  const openAssignmentsStat = document.getElementById("stat-open-assignments");
  const avgConsistencyStat = document.getElementById("stat-avg-consistency");
  const avgCaption = document.getElementById("stat-avg-caption");
  const reviewQueueStat = document.getElementById("stat-review-queue");
  const reviewCaption = document.getElementById("stat-review-caption");

  function refresh() {
    state = loadState();
    renderProfessorCourses(state);
    const queue = buildReviewQueue(state);
    const averageConsistency = queue.length
      ? average(queue.map((entry) => entry.result.consistency))
      : 0;
    const flaggedCount = queue.filter((entry) => entry.result.level !== "HIGH").length;
    populateCourseSelect(assignmentCourseSelect, state, state.activeCourseId);
    renderReviewQueue(queue);
    if (activeCoursesStat) activeCoursesStat.textContent = String(state.courses.length).padStart(2, "0");
    if (openAssignmentsStat) openAssignmentsStat.textContent = String(totalAssignments(state.courses)).padStart(2, "0");
    if (avgConsistencyStat) avgConsistencyStat.textContent = `${averageConsistency}%`;
    if (avgCaption) avgCaption.textContent = queue.length
      ? `${queue.length} learner record${queue.length === 1 ? "" : "s"} in the current dashboard sample`
      : "No learner records yet";
    if (reviewQueueStat) reviewQueueStat.textContent = String(flaggedCount).padStart(2, "0");
    if (reviewCaption) {
      reviewCaption.textContent = flaggedCount
        ? `${flaggedCount} learner${flaggedCount === 1 ? "" : "s"} currently need follow-up or oral defense`
        : "No learners currently need follow-up";
    }
  }

  courseButton.addEventListener("click", () => {
    const title = courseTitleInput?.value.trim();
    const term = courseTermInput?.value.trim();
    const learners = Number(courseCountInput?.value || 0);
    const note = courseNoteInput?.value.trim();

    if (!title) {
      if (courseFeedback) courseFeedback.textContent = "Enter a course title first.";
      return;
    }

    const nextState = loadState();
    const id = `${slugify(title)}-${Date.now()}`;
    nextState.courses.push({
      id,
      title,
      term: term || "Term not set",
      learners: Number.isFinite(learners) ? learners : 0,
      note: note || "No course note yet.",
      assignments: [],
    });
    nextState.activeCourseId = id;
    nextState.activeAssignmentId = "";
    saveState(nextState);
    refresh();
    if (courseFeedback) courseFeedback.textContent = `${title} was registered and is now available for assignment launch.`;
  });

  assignmentButton.addEventListener("click", () => {
    const courseId = assignmentCourseSelect?.value;
    const title = assignmentTitleInput?.value.trim();
    const due = assignmentDueInput?.value.trim();
    const summary = assignmentSummaryInput?.value.trim();

    if (!courseId || !title) {
      if (assignmentFeedback) assignmentFeedback.textContent = "Choose a course and enter an assignment title.";
      return;
    }

    const nextState = loadState();
    const course = nextState.courses.find((item) => item.id === courseId);
    if (!course) {
      if (assignmentFeedback) assignmentFeedback.textContent = "The selected course could not be found.";
      return;
    }

    const assignmentId = `${course.id}-${slugify(title)}-${Date.now()}`;
    course.assignments.push(
      createDefaultAssignment({
        id: assignmentId,
        title,
        due: due || "Due date TBD",
        summary: summary || "Understanding checks will be configured for this assignment.",
        prompt:
          summary ||
          "Open this homework and submit the code you want to defend across hotspot, trace, mutation, and repair.",
      })
    );
    nextState.activeCourseId = course.id;
    nextState.activeAssignmentId = assignmentId;
    saveState(nextState);
    refresh();
    if (assignmentFeedback) assignmentFeedback.textContent = `${title} was added to ${course.title}.`;
  });

  refresh();
}

function renderProfessorStudentDetail() {
  const studentName = document.getElementById("professor-student-name");
  if (!studentName) return;

  const studentId = document.getElementById("professor-student-id");
  const courseSummary = document.getElementById("professor-course-summary");
  const provenanceBadge = document.getElementById("professor-provenance-badge");
  const flagBadge = document.getElementById("professor-flag-badge");
  const sourceFile = document.getElementById("professor-source-file");
  const sourceCode = document.getElementById("professor-source-code");
  const hotspotFocus = document.getElementById("professor-hotspot-focus");
  const hotspotResponse = document.getElementById("professor-hotspot-response");
  const traceScenario = document.getElementById("professor-trace-scenario");
  const traceResponse = document.getElementById("professor-trace-response");
  const mutationResponse = document.getElementById("professor-mutation-response");
  const repairResponse = document.getElementById("professor-repair-response");
  const consistencyLevel = document.getElementById("professor-consistency-level");
  const diagnosticMessage = document.getElementById("professor-diagnostic-message");
  const reviewCard = document.getElementById("professor-review-card");
  const reviewTitle = document.getElementById("professor-review-title");
  const reviewNote = document.getElementById("professor-review-note");
  const strengthSummary = document.getElementById("professor-strength-summary");
  const gapSummary = document.getElementById("professor-gap-summary");
  const nextStep = document.getElementById("professor-next-step");
  const consistencyScore = document.getElementById("professor-consistency-score");
  const responseCoverage = document.getElementById("professor-response-coverage");
  const provenanceMeta = document.getElementById("professor-provenance-meta");
  const rubricEvidence = document.getElementById("professor-rubric-evidence");
  const rubricDimensions = document.getElementById("professor-rubric-dimensions");

  const state = loadState();
  const { course, assignment } = findAssignment(state, state.activeAssignmentId);
  if (!course || !assignment) return;

  const reviewContext =
    state.reviewContext &&
    state.reviewContext.assignmentId === assignment.id &&
    state.reviewContext.courseId === course.id
      ? state.reviewContext
      : null;
  const responses = normalizeResponses(reviewContext?.responses || assignment.responses);
  const assignmentForReview = { ...assignment, responses };
  const result = reviewContext?.result || createDefaultMetrics(assignmentForReview);
  const rubric = createRubricFeedback(assignmentForReview, result);
  const coverage = reviewContext?.coverage || getResponseCoverage(assignmentForReview);

  const displayStudentName = reviewContext?.studentName || "Alex Chen";
  studentName.textContent = displayStudentName;
  if (studentId) studentId.textContent = `ID: ${reviewContext?.studentId || createStudentBadgeId(displayStudentName, assignment.id)}`;
  if (courseSummary) courseSummary.textContent = `${course.title} | ${assignment.title}`;
  if (sourceFile) sourceFile.textContent = assignment.sourceFile;
  if (sourceCode) sourceCode.textContent = reviewContext?.draftCode || assignment.draftCode || assignment.sourceCode;
  if (hotspotFocus) hotspotFocus.textContent = assignment.hotspotFocus;
  if (hotspotResponse) {
    hotspotResponse.textContent = summarizeText(
      responses.hotspot.q1 || responses.hotspot.q2 || responses.hotspot.q3,
      "No hotspot reasoning saved."
    );
  }
  if (traceScenario) traceScenario.textContent = assignment.traceScenario;
  if (traceResponse) {
    traceResponse.textContent = summarizeText(
      responses.trace.q2 || responses.trace.q1 || responses.trace.q3,
      "No trace reasoning saved."
    );
  }
  if (mutationResponse) {
    mutationResponse.textContent = summarizeText(
      responses.mutation.plan,
      "No mutation reasoning saved."
    );
  }
  if (repairResponse) {
    repairResponse.textContent = summarizeText(
      responses.repair.plan,
      "No repair reasoning saved."
    );
  }
  if (consistencyLevel) {
    consistencyLevel.textContent = result.level;
    consistencyLevel.className =
      result.level === "HIGH"
        ? "font-mono text-xs font-bold text-tertiary"
        : result.level === "MEDIUM"
        ? "font-mono text-xs font-bold text-secondary"
        : "font-mono text-xs font-bold text-error";
  }
  if (diagnosticMessage) diagnosticMessage.textContent = rubric.diagnosticMessage;
  if (strengthSummary) strengthSummary.textContent = rubric.strengthSummary;
  if (gapSummary) gapSummary.textContent = rubric.gapSummary;
  if (nextStep) nextStep.textContent = rubric.nextStep;
  if (rubricEvidence) rubricEvidence.textContent = rubric.evidenceSummary;
  renderRubricDimensionCards(rubricDimensions, rubric.dimensionSummaries);
  if (consistencyScore) consistencyScore.textContent = `${result.consistency}%`;
  if (responseCoverage) responseCoverage.textContent = `${coverage.answered} / ${coverage.total || 0}`;
  if (provenanceMeta) provenanceMeta.textContent = reviewContext?.provenance || responses.provenance;

  const displayProvenance = reviewContext?.provenance || responses.provenance;
  const provenanceIsAi = /AI|external/i.test(displayProvenance);
  if (provenanceBadge) {
    provenanceBadge.innerHTML = `<span class="w-2 h-2 rounded-full bg-tertiary"></span>${escapeHtml(displayProvenance)}`;
  }

  if (flagBadge) {
    flagBadge.innerHTML =
      result.level === "HIGH"
        ? `<span class="w-2 h-2 rounded-full bg-tertiary"></span>Ready to Mark Reviewed`
        : result.level === "MEDIUM"
        ? `<span class="w-2 h-2 rounded-full bg-secondary"></span>Follow-Up Recommended`
        : `<span class="w-2 h-2 rounded-full bg-error"></span>Flag for Oral Defense`;

    flagBadge.className =
      result.level === "HIGH"
        ? "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-tertiary border border-blue-100"
        : result.level === "MEDIUM"
        ? "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200"
        : "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-error-container text-on-error-container border border-error/20";
  }

  if (reviewCard && reviewTitle && reviewNote) {
    if (result.level === "HIGH") {
      reviewCard.className = "bg-blue-50 border border-blue-100 p-4 rounded-lg";
      reviewTitle.textContent = "Consistent Understanding";
      reviewTitle.className = "font-headline text-sm font-bold text-tertiary";
      reviewNote.textContent = "The submission and the saved reasoning checkpoints tell a coherent story. A standard review should be enough.";
      reviewNote.className = "text-xs text-slate-600 leading-snug";
    } else if (result.level === "MEDIUM") {
      reviewCard.className = "bg-amber-50 border border-amber-200 p-4 rounded-lg";
      reviewTitle.textContent = "Follow-Up Recommended";
      reviewTitle.className = "font-headline text-sm font-bold text-amber-700";
      reviewNote.textContent = "Some reasoning is present, but the weakest checkpoint still needs a short conversation or resubmission to confirm understanding.";
      reviewNote.className = "text-xs text-amber-800/80 leading-snug";
    } else {
      reviewCard.className = "bg-error-container/20 border border-error/10 p-4 rounded-lg";
      reviewTitle.textContent = provenanceIsAi ? "Flag for Oral Defense" : "High-Risk Comprehension Gap";
      reviewTitle.className = "font-headline text-sm font-bold text-on-error-container";
      reviewNote.textContent = `The current evidence suggests the final code is stronger than the saved reasoning. ${reviewContext?.riskReason || "A short oral defense or targeted walkthrough is recommended."}`;
      reviewNote.className = "text-xs text-on-error-container opacity-80 leading-snug";
    }
  }
}

function renderStudentPortal() {
  const courseSelect = document.getElementById("student-course-select");
  if (!courseSelect) return;

  const courseTitle = document.getElementById("student-course-title");
  const courseSummary = document.getElementById("student-course-summary");
  const courseBadge = document.getElementById("student-course-badge");
  const assignmentList = document.getElementById("student-assignment-list");
  const selectedAssignmentTitle = document.getElementById("student-selected-assignment");
  const selectedAssignmentSummary = document.getElementById("student-selected-summary");
  const selectedAssignmentDue = document.getElementById("student-selected-due");
  const selectedAssignmentNext = document.getElementById("student-selected-next");
  const draftStatus = document.getElementById("student-draft-status");
  const learningNote = document.getElementById("student-learning-note");
  const checklist = document.getElementById("student-checklist");
  const resumeLink = document.getElementById("student-resume-link");
  const resumeLabel = document.getElementById("student-resume-label");

  let state = loadState();

  function refresh() {
    state = loadState();
    populateCourseSelect(courseSelect, state, state.activeCourseId);
    const course = findCourse(state, courseSelect.value || state.activeCourseId);
    if (!course) return;

    const activeAssignment = getActiveAssignmentForCourse(state, course);

    if (courseTitle) courseTitle.textContent = course.title;
    if (courseSummary) courseSummary.textContent = `${course.term} | ${course.learners} learners | ${course.note}`;
    if (courseBadge) {
      courseBadge.textContent = `${course.assignments.length} active homework${course.assignments.length === 1 ? "" : "s"}`;
    }

    if (activeAssignment) {
      const progress = getAssignmentProgressState(activeAssignment);
      const cta = getStudentCta(activeAssignment, activeAssignment.id === state.activeAssignmentId);
      if (selectedAssignmentTitle) selectedAssignmentTitle.textContent = activeAssignment.title;
      if (selectedAssignmentSummary) selectedAssignmentSummary.textContent = activeAssignment.summary;
      if (selectedAssignmentDue) selectedAssignmentDue.textContent = activeAssignment.due;
      if (selectedAssignmentNext) selectedAssignmentNext.textContent = progress.nextStep?.label || "Submission";
      if (resumeLink) resumeLink.href = progress.nextStep?.path || "./student-submission.html";
      if (resumeLabel) resumeLabel.textContent = cta.label;
      if (resumeLink) resumeLink.className = `mt-5 inline-flex items-center justify-center gap-2 w-full rounded-xl px-5 py-3 font-semibold no-underline ${cta.emphasis}`;
    }

    if (activeAssignment && draftStatus) {
      const progress = getAssignmentProgressState(activeAssignment);
      draftStatus.textContent =
        progress.completedSteps === 0
          ? `Start from ${progress.nextStep.label}. The code editor opens inside the homework so the first action stays anchored to the assignment itself.`
          : `You already have progress in ${activeAssignment.title}. Re-entering now will take you to ${progress.nextStep.key === "result" ? "the results view" : progress.nextStep.label}.`;
    }

    if (activeAssignment && learningNote) {
      const coverage = getResponseCoverage(activeAssignment);
      learningNote.textContent =
        coverage.answered > 0
          ? `${coverage.answered} of ${coverage.total || 0} checkpoint responses are already saved for this assignment, so the student can re-enter without losing context.`
          : `This course is ready, but the selected homework has not built up any checkpoint evidence yet. Starting from the course layer keeps the task grounded before the student opens the editor.`;
    }

    if (checklist && activeAssignment) {
      const progress = getAssignmentProgressState(activeAssignment);
      checklist.innerHTML = [
        `1. Confirm the course context for <strong>${escapeHtml(activeAssignment.title)}</strong>.`,
        `2. Check whether you are starting fresh or resuming from <strong>${escapeHtml(progress.nextStep.label)}</strong>.`,
        `3. Paste the version of the code you actually want to defend.`,
        `4. Move through the enabled checkpoints in order: <strong>${escapeHtml(formatModuleList(activeAssignment.modules) || "Submission only")}</strong>.`,
      ]
        .map((item) => `<li>${item}</li>`)
        .join("");
    }

    assignmentList.innerHTML = course.assignments.length
      ? course.assignments
          .map(
            (assignment, index) => `
              <div class="${assignment.id === state.activeAssignmentId ? "bg-blue-50 border border-blue-100" : "bg-surface-container-low"} rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <p class="font-mono text-[10px] uppercase tracking-[0.15em] text-tertiary mb-1">Homework ${String(
                    index + 1
                  ).padStart(2, "0")}</p>
                  <h4 class="font-headline text-lg font-bold">${assignment.title}</h4>
                  <p class="text-sm text-on-surface-variant mt-1">${assignment.summary}</p>
                  <p class="text-xs text-slate-400 mt-2">${assignment.due}</p>
                  <p class="text-xs text-slate-400 mt-2">Modules: ${formatModuleList(assignment.modules) || "None"}</p>
                  <p class="text-xs mt-2 ${assignment.id === state.activeAssignmentId ? "text-tertiary" : "text-slate-500"}">${(() => {
                    const progress = getAssignmentProgressState(assignment);
                    const coverage = getResponseCoverage(assignment);
                    return `${progress.statusLabel} - ${progress.completedSteps}/${progress.totalSteps} steps complete - ${coverage.answered}/${coverage.total || 0} responses saved`;
                  })()}</p>
                </div>
                <button class="open-homework-btn inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold ${getStudentCta(assignment, assignment.id === state.activeAssignmentId).emphasis}" data-course-id="${course.id}" data-assignment-id="${assignment.id}">
                  ${getStudentCta(assignment, assignment.id === state.activeAssignmentId).label}
                  <span class="material-symbols-outlined text-base">arrow_forward</span>
                </button>
              </div>
            `
          )
          .join("")
      : `<div class="bg-surface-container-low rounded-xl p-4 text-sm text-on-surface-variant">No active homework has been published for this course yet.</div>`;

    assignmentList.querySelectorAll(".open-homework-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const nextState = loadState();
        nextState.activeCourseId = button.dataset.courseId || nextState.activeCourseId;
        nextState.activeAssignmentId = button.dataset.assignmentId || nextState.activeAssignmentId;
        saveState(nextState);
        const { assignment } = findAssignment(nextState, nextState.activeAssignmentId);
        const progress = getAssignmentProgressState(assignment);
        window.location.href = progress.nextStep?.path || "./student-submission.html";
      });
    });
  }

  courseSelect.addEventListener("change", () => {
    const nextState = loadState();
    const course = findCourse(nextState, courseSelect.value);
    nextState.activeCourseId = courseSelect.value;
    nextState.activeAssignmentId = course?.assignments?.[0]?.id || "";
    saveState(nextState);
    refresh();
  });

  refresh();
}

function renderStudentSubmission() {
  const courseLabel = document.getElementById("submission-course-label");
  if (!courseLabel) return;

  const title = document.getElementById("submission-page-title");
  const prompt = document.getElementById("submission-prompt-text");
  const context = document.getElementById("submission-context-text");
  const codeInput = document.getElementById("submission-code-input");
  const dueBadge = document.getElementById("submission-due-badge");
  const moduleSummary = document.getElementById("submission-module-summary");
  const sourceFile = document.getElementById("submission-source-file");

  const state = loadState();
  const { course, assignment } = findAssignment(state, state.activeAssignmentId);
  if (!course || !assignment) return;
  const responses = normalizeResponses(assignment.responses);

  courseLabel.textContent = `${course.title} / ${assignment.title}`;
  if (title) title.textContent = `${assignment.title} Submission`;
  if (prompt) prompt.textContent = assignment.prompt;
  if (context) {
    context.textContent = `Selected from ${course.title} (${course.term}). ${assignment.due}. Submit the version of the code you want to defend in the checkpoints that follow.`;
  }
  if (dueBadge) dueBadge.textContent = assignment.due;
  if (moduleSummary) moduleSummary.textContent = `Assessment modules: ${formatModuleList(assignment.modules) || "None configured"}`;
    if (sourceFile) sourceFile.textContent = assignment.sourceFile;

    if (codeInput) {
      codeInput.value = getAssignmentDraft(assignment);
      codeInput.addEventListener("input", () => {
      const nextState = loadState();
      updateAssignmentDraft(nextState, nextState.activeAssignmentId, codeInput.value);
        saveState(nextState);
      });
    }

    bindRadioGroup("provenance", responses.provenance, (value) => {
      const nextState = loadState();
      updateAssignmentResponse(nextState, nextState.activeAssignmentId, "provenance", null, value);
      saveState(nextState);
    });

    renderStepProgress({
      assignment,
      currentKey: "submission",
      stepTextId: "submission-step-text",
      percentTextId: "submission-progress-text",
      barId: "submission-progress-bar",
    });

    configureNextLink("submission-next-link", "submission-next-label", assignment, "submission", "Begin ");
    applyModuleVisibility(assignment, ["submission-next-link"]);
}

function renderCreateAssignment() {
  const courseSelect = document.getElementById("builder-course-select");
  if (!courseSelect) return;

  const assignmentSelect = document.getElementById("builder-assignment-select");
  const titleInput = document.getElementById("builder-assignment-title");
  const promptInput = document.getElementById("builder-assignment-prompt");
  const dueInput = document.getElementById("builder-assignment-due");
  const summaryInput = document.getElementById("builder-assignment-summary");
  const hotspotInput = document.getElementById("builder-hotspot-focus");
  const traceInput = document.getElementById("builder-trace-scenario");
  const mutationInput = document.getElementById("builder-mutation-prompt");
  const repairInput = document.getElementById("builder-repair-prompt");
  const hiddenTestsInput = document.getElementById("builder-hidden-tests");
  const moduleInputs = {
    hotspot: document.getElementById("builder-module-hotspot"),
    trace: document.getElementById("builder-module-trace"),
    mutation: document.getElementById("builder-module-mutation"),
    repair: document.getElementById("builder-module-repair"),
  };
  const feedback = document.getElementById("builder-save-feedback");
  const publishButton = document.getElementById("builder-publish-btn");
  const courseTerm = document.getElementById("builder-course-term");
  const enrollment = document.getElementById("builder-course-enrollment");

  if (!assignmentSelect || !publishButton) return;

  function refresh() {
    const state = loadState();
    populateCourseSelect(courseSelect, state, state.activeCourseId);
    const course = findCourse(state, courseSelect.value || state.activeCourseId);
    const assignment = findAssignmentInCourse(course, state.activeAssignmentId);
    populateAssignmentSelect(assignmentSelect, course, assignment?.id);

    if (!course || !assignment) return;

    if (courseTerm) courseTerm.value = course.term;
    if (enrollment) enrollment.value = `${course.learners} enrolled learners`;
    if (titleInput) titleInput.value = assignment.title;
    if (promptInput) promptInput.value = assignment.prompt;
    if (dueInput) dueInput.value = assignment.due;
    if (summaryInput) summaryInput.value = assignment.summary;
    if (hotspotInput) hotspotInput.value = assignment.hotspotFocus;
    if (traceInput) traceInput.value = assignment.traceScenario;
    if (mutationInput) mutationInput.value = assignment.mutationPrompt;
    if (repairInput) repairInput.value = assignment.repairPrompt;
    if (hiddenTestsInput) hiddenTestsInput.value = assignment.hiddenTests;

    Object.entries(moduleInputs).forEach(([module, input]) => {
      if (input) input.checked = Boolean(assignment.modules[module]);
    });
  }

  courseSelect.addEventListener("change", () => {
    const nextState = loadState();
    const course = findCourse(nextState, courseSelect.value);
    nextState.activeCourseId = course.id;
    nextState.activeAssignmentId = course.assignments[0]?.id || "";
    saveState(nextState);
    refresh();
  });

  assignmentSelect.addEventListener("change", () => {
    const nextState = loadState();
    nextState.activeAssignmentId = assignmentSelect.value;
    saveState(nextState);
    refresh();
  });

  publishButton.addEventListener("click", () => {
    const nextState = loadState();
    const course = nextState.courses.find((item) => item.id === courseSelect.value);
    const assignment = course?.assignments.find((item) => item.id === assignmentSelect.value);

    if (!course || !assignment) {
      if (feedback) feedback.textContent = "Select a course and assignment before publishing.";
      return;
    }

    assignment.title = titleInput?.value.trim() || assignment.title;
    assignment.prompt = promptInput?.value.trim() || assignment.prompt;
    assignment.due = dueInput?.value.trim() || assignment.due;
    assignment.summary = summaryInput?.value.trim() || assignment.summary;
    assignment.hotspotFocus = hotspotInput?.value.trim() || assignment.hotspotFocus;
    assignment.traceScenario = traceInput?.value.trim() || assignment.traceScenario;
    assignment.mutationPrompt = mutationInput?.value.trim() || assignment.mutationPrompt;
    assignment.repairPrompt = repairInput?.value.trim() || assignment.repairPrompt;
    assignment.hiddenTests = hiddenTestsInput?.value.trim() || assignment.hiddenTests;
    assignment.modules = createDefaultModules({
      hotspot: moduleInputs.hotspot?.checked,
      trace: moduleInputs.trace?.checked,
      mutation: moduleInputs.mutation?.checked,
      repair: moduleInputs.repair?.checked,
    });
    assignment.sourceFile = `${slugify(assignment.title).replace(/-/g, "_")}.py`;
    assignment.mutationFile = `${slugify(assignment.title).replace(/-/g, "_")}_mutation.py`;
    assignment.repairFile = `${slugify(assignment.title).replace(/-/g, "_")}_repair.py`;

    saveState(nextState);
    refresh();
    if (feedback) feedback.textContent = `${assignment.title} is now synced to the full student flow.`;
  });

  refresh();
}

function renderHotspotQuestions() {
  const courseLabel = document.getElementById("hotspot-course-label");
  if (!courseLabel) return;

  const assignmentTitle = document.getElementById("hotspot-assignment-title");
  const goalText = document.getElementById("hotspot-goal-text");
  const sourceFile = document.getElementById("hotspot-source-file");
  const questionOne = document.getElementById("hotspot-question-1");
  const questionTwo = document.getElementById("hotspot-question-2");
  const questionThree = document.getElementById("hotspot-question-3");
  const focusCard = document.getElementById("hotspot-focus-card");
  const modules = document.getElementById("hotspot-module-summary");
  const codeBlock = document.getElementById("hotspot-code-block");
  const answerOne = document.getElementById("hotspot-answer-1");
  const answerTwo = document.getElementById("hotspot-answer-2");
  const answerThree = document.getElementById("hotspot-answer-3");

  const state = loadState();
  const { course, assignment } = findAssignment(state, state.activeAssignmentId);
  if (!course || !assignment) return;
  const responses = normalizeResponses(assignment.responses);

  courseLabel.textContent = `${course.title} / ${assignment.title}`;
  if (assignmentTitle) assignmentTitle.textContent = `${assignment.title} Hotspot Review`;
  if (goalText) {
    goalText.textContent = `${assignment.prompt} This step asks the learner to explain the critical lines before tracing full execution.`;
  }
  if (sourceFile) sourceFile.textContent = assignment.sourceFile;
  if (focusCard) focusCard.textContent = assignment.hotspotFocus;
  if (modules) modules.textContent = `Enabled modules: ${formatModuleList(assignment.modules) || "None configured"}`;
  if (questionOne) questionOne.textContent = `Which line best expresses this focus: ${assignment.hotspotFocus}`;
  if (questionTwo) questionTwo.textContent = `How does that line support the assignment prompt: ${assignment.prompt}`;
  if (questionThree) {
    questionThree.textContent = `What failure would you expect first if that line behaved incorrectly while working on ${assignment.title}?`;
    }
    renderInlineCode(codeBlock, assignment.sourceCode, "light");
    bindStoredValue(answerOne, responses.hotspot.q1, (value) => {
      const nextState = loadState();
      updateAssignmentResponse(nextState, nextState.activeAssignmentId, "hotspot", "q1", value);
      saveState(nextState);
    });
    bindStoredValue(answerTwo, responses.hotspot.q2, (value) => {
      const nextState = loadState();
      updateAssignmentResponse(nextState, nextState.activeAssignmentId, "hotspot", "q2", value);
      saveState(nextState);
    });
    bindStoredValue(answerThree, responses.hotspot.q3, (value) => {
      const nextState = loadState();
      updateAssignmentResponse(nextState, nextState.activeAssignmentId, "hotspot", "q3", value);
      saveState(nextState);
    });
    renderStepProgress({
      assignment,
      currentKey: "hotspot",
      stepTextId: "hotspot-step-text",
      percentTextId: "hotspot-progress-text",
      barId: "hotspot-progress-bar",
    });

    configureNextLink("hotspot-next-link", "hotspot-next-label", assignment, "hotspot", "Next Task: ");
    applyModuleVisibility(assignment, ["hotspot-next-link"]);
}

function renderTraceMode() {
  const assignmentTitle = document.getElementById("trace-assignment-title");
  if (!assignmentTitle) return;

  const courseLabel = document.getElementById("trace-course-label");
  const scenario = document.getElementById("trace-scenario-text");
  const intro = document.getElementById("trace-intro-text");
  const sourceFile = document.getElementById("trace-source-file");
  const questionOne = document.getElementById("trace-question-1");
  const questionTwo = document.getElementById("trace-question-2");
  const questionThree = document.getElementById("trace-question-3");
  const codeBlock = document.getElementById("trace-code-block");
  const answerOne = document.getElementById("trace-answer-1");
  const answerTwo = document.getElementById("trace-answer-2");
  const answerThree = document.getElementById("trace-answer-3");

  const state = loadState();
  const { course, assignment } = findAssignment(state, state.activeAssignmentId);
  if (!course || !assignment) return;
  const responses = normalizeResponses(assignment.responses);

  assignmentTitle.textContent = `${assignment.title} Trace Mode`;
  if (courseLabel) courseLabel.textContent = `${course.title} / ${assignment.title}`;
  if (scenario) scenario.textContent = assignment.traceScenario;
  if (intro) {
    intro.textContent = `Trace reasoning for ${assignment.title}. Start from the prompt, then walk through the state changes you expect to see.`;
  }
  if (sourceFile) sourceFile.textContent = assignment.sourceFile;
  if (questionOne) questionOne.textContent = "After the first critical turn in this scenario, what state change should happen first?";
  if (questionTwo) {
    questionTwo.textContent = `Record the map or memory structure you expect while tracing: ${assignment.traceScenario}`;
  }
  if (questionThree) {
    questionThree.textContent = `Based on this scenario, what final result should the function return for ${assignment.title}?`;
    }
    renderTracePre(codeBlock, assignment.sourceCode);
    bindStoredValue(answerOne, responses.trace.q1, (value) => {
      const nextState = loadState();
      updateAssignmentResponse(nextState, nextState.activeAssignmentId, "trace", "q1", value);
      saveState(nextState);
    });
    bindStoredValue(answerTwo, responses.trace.q2, (value) => {
      const nextState = loadState();
      updateAssignmentResponse(nextState, nextState.activeAssignmentId, "trace", "q2", value);
      saveState(nextState);
    });
    bindStoredValue(answerThree, responses.trace.q3, (value) => {
      const nextState = loadState();
      updateAssignmentResponse(nextState, nextState.activeAssignmentId, "trace", "q3", value);
      saveState(nextState);
    });
    renderStepProgress({
      assignment,
      currentKey: "trace",
      stepTextId: "trace-step-text",
      percentTextId: "trace-progress-text",
      barId: "trace-progress-bar",
    });

    configureNextLink("trace-next-link", "trace-next-label", assignment, "trace", "Next Task: ");
    applyModuleVisibility(assignment, ["trace-next-link"]);
}

function renderMutationTask() {
  const assignmentTitle = document.getElementById("mutation-assignment-title");
  if (!assignmentTitle) return;

  const courseLabel = document.getElementById("mutation-course-label");
  const prompt = document.getElementById("mutation-prompt-text");
  const intro = document.getElementById("mutation-intro-text");
  const sourceFile = document.getElementById("mutation-source-file");
  const whyCard = document.getElementById("mutation-why-card");
  const moduleState = document.getElementById("mutation-module-state");
  const codeBlock = document.getElementById("mutation-code-block");
  const logOutput = document.querySelector(".text-error\\/80.leading-relaxed");
  const answer = document.getElementById("mutation-answer");

  const state = loadState();
  const { course, assignment } = findAssignment(state, state.activeAssignmentId);
  if (!course || !assignment) return;
  const responses = normalizeResponses(assignment.responses);

  assignmentTitle.textContent = `${assignment.title} Mutation Task`;
  if (courseLabel) courseLabel.textContent = `${course.title} / ${assignment.title}`;
  if (prompt) prompt.textContent = assignment.mutationPrompt;
  if (intro) {
    intro.textContent = `This transfer step checks whether the learner can adapt ${assignment.title} after the constraints shift.`;
  }
  if (sourceFile) sourceFile.textContent = assignment.mutationFile;
  if (whyCard) {
    whyCard.textContent = `Students who understand ${assignment.title} usually adapt quickly when the contract changes. This mutation uses: ${assignment.mutationPrompt}`;
  }
    if (moduleState) moduleState.textContent = `Enabled modules: ${formatModuleList(assignment.modules) || "None configured"}`;
    if (logOutput) logOutput.textContent = assignment.mutationFailureOutput;
    renderMutationPanel(codeBlock, assignment.mutationCode);
    bindStoredValue(answer, responses.mutation.plan, (value) => {
      const nextState = loadState();
      updateAssignmentResponse(nextState, nextState.activeAssignmentId, "mutation", "plan", value);
      saveState(nextState);
    });
    renderStepProgress({
      assignment,
      currentKey: "mutation",
      stepTextId: "mutation-step-text",
      percentTextId: "mutation-progress-text",
      barId: "mutation-progress-bar",
    });

    configureNextLink("mutation-next-link", "mutation-next-label", assignment, "mutation", "Continue to ");
    applyModuleVisibility(assignment, ["mutation-next-link"]);
}

function renderRepairMode() {
  const assignmentTitle = document.getElementById("repair-assignment-title");
  if (!assignmentTitle) return;

  const courseLabel = document.getElementById("repair-course-label");
  const prompt = document.getElementById("repair-prompt-text");
  const intro = document.getElementById("repair-intro-text");
  const sourceFile = document.getElementById("repair-source-file");
  const issueLabel = document.getElementById("repair-issue-label");
  const moduleState = document.getElementById("repair-module-state");
  const codeBlock = document.getElementById("repair-code-block");
  const answer = document.getElementById("repair-answer");

  const state = loadState();
  const { course, assignment } = findAssignment(state, state.activeAssignmentId);
  if (!course || !assignment) return;
  const responses = normalizeResponses(assignment.responses);

  assignmentTitle.textContent = `${assignment.title} Repair Mode`;
  if (courseLabel) courseLabel.textContent = `${course.title} / ${assignment.title}`;
  if (prompt) prompt.textContent = assignment.repairPrompt;
  if (intro) {
    intro.textContent = `Repair is the final authenticity check for ${assignment.title}. The learner must recognize the same logic in damaged form and correct it precisely.`;
  }
  if (sourceFile) sourceFile.textContent = assignment.repairFile;
    if (issueLabel) issueLabel.textContent = assignment.repairDetectedIn;
    if (moduleState) moduleState.textContent = `Enabled modules: ${formatModuleList(assignment.modules) || "None configured"}`;
    renderInlineCode(codeBlock, assignment.repairCode, "dark");
    bindStoredValue(answer, responses.repair.plan, (value) => {
      const nextState = loadState();
      updateAssignmentResponse(nextState, nextState.activeAssignmentId, "repair", "plan", value);
      saveState(nextState);
    });
    renderStepProgress({
      assignment,
      currentKey: "repair",
      stepTextId: "repair-step-text",
      percentTextId: "repair-progress-text",
      barId: "repair-progress-bar",
    });

    configureNextLink("repair-next-link", "repair-next-label", assignment, "repair", "View ");
    applyModuleVisibility(assignment, ["repair-next-link"]);
}

function renderStudentResult() {
  const reportTitle = document.getElementById("result-assignment-title");
  if (!reportTitle) return;

  const summary = document.getElementById("result-course-summary");
  const diagnostic = document.getElementById("result-diagnostic-context");
  const diagnosticMessage = document.getElementById("result-diagnostic-message");
  const breakdown = document.getElementById("result-breakdown");
  const disparityLabel = document.getElementById("result-disparity-label");
  const consistencyScore = document.getElementById("result-consistency-score");
  const consistencyLevel = document.getElementById("result-consistency-level");
  const metricsGrid = document.getElementById("result-metrics-grid");
  const provenance = document.getElementById("result-provenance");
  const hotspotResponse = document.getElementById("result-hotspot-response");
  const traceResponse = document.getElementById("result-trace-response");
  const mutationResponse = document.getElementById("result-mutation-response");
  const repairResponse = document.getElementById("result-repair-response");
  const consistencyCaption = document.getElementById("result-consistency-caption");
  const strengthSummary = document.getElementById("result-strength-summary");
  const gapSummary = document.getElementById("result-gap-summary");
  const nextStep = document.getElementById("result-next-step");
  const rubricDimensions = document.getElementById("result-rubric-dimensions");

  const state = loadState();
  const { course, assignment } = findAssignment(state, state.activeAssignmentId);
  if (!course || !assignment) return;

  const result = createDefaultMetrics(assignment);
  const rubric = createRubricFeedback(assignment, result);
  const responses = normalizeResponses(assignment.responses);
  const hotspotAnswered = countAnswered(Object.values(responses.hotspot));
  const traceAnswered = countAnswered(Object.values(responses.trace));
  const mutationAnswered = countAnswered([responses.mutation.plan]);
  const repairAnswered = countAnswered([responses.repair.plan]);

  reportTitle.textContent = `Analysis: ${assignment.title}`;
  if (summary) {
    summary.textContent = `${course.title} | ${assignment.due} | Modules: ${formatModuleList(assignment.modules) || "None configured"}`;
  }
    if (diagnostic) {
      diagnostic.textContent = rubric.evidenceSummary;
    }
    if (diagnosticMessage) {
      diagnosticMessage.textContent = rubric.diagnosticMessage;
    }
    if (breakdown) {
      breakdown.textContent = rubric.breakdownLine;
    }
  if (disparityLabel) {
    disparityLabel.textContent =
      result.level === "HIGH" ? "CONSISTENT" : result.level === "MEDIUM" ? "FOLLOW-UP ADVISED" : "CRITICAL DISPARITY";
  }
  if (consistencyScore) consistencyScore.textContent = `${result.consistency}%`;
    if (consistencyLevel) {
      consistencyLevel.textContent = result.level;
      consistencyLevel.className =
        result.level === "HIGH"
        ? "bg-tertiary/10 text-tertiary px-3 py-0.5 rounded-full font-mono text-[10px] font-bold mt-2"
        : result.level === "MEDIUM"
          ? "bg-secondary/10 text-secondary px-3 py-0.5 rounded-full font-mono text-[10px] font-bold mt-2"
          : "bg-error/10 text-error px-3 py-0.5 rounded-full font-mono text-[10px] font-bold mt-2";
    }
    if (consistencyCaption) consistencyCaption.textContent = rubric.caption;
    renderMetricsGrid(metricsGrid, assignment);
    if (provenance) provenance.textContent = responses.provenance || "No provenance saved yet.";
    if (hotspotResponse) {
      hotspotResponse.textContent = summarizeText(
        responses.hotspot.q1 || responses.hotspot.q2 || responses.hotspot.q3,
        "No hotspot response saved yet."
      );
    }
    if (traceResponse) {
      traceResponse.textContent = summarizeText(
        responses.trace.q2 || responses.trace.q1 || responses.trace.q3,
        "No trace response saved yet."
      );
    }
    if (mutationResponse) {
      mutationResponse.textContent = summarizeText(
        responses.mutation.plan,
        "No mutation response saved yet."
      );
    }
    if (repairResponse) {
      repairResponse.textContent = summarizeText(
        responses.repair.plan,
        "No repair response saved yet."
      );
    }
    if (strengthSummary) strengthSummary.textContent = rubric.strengthSummary;
    if (gapSummary) gapSummary.textContent = rubric.gapSummary;
    if (nextStep) nextStep.textContent = rubric.nextStep;
    renderRubricDimensionCards(rubricDimensions, rubric.dimensionSummaries);
}

renderProfessorDashboard();
renderProfessorStudentDetail();
renderStudentPortal();
renderStudentSubmission();
renderCreateAssignment();
renderHotspotQuestions();
renderTraceMode();
renderMutationTask();
renderRepairMode();
renderStudentResult();
