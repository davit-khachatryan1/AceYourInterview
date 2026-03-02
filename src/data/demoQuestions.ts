import type { QuestionRecord } from '@/types/interview';

export const demoQuestions: QuestionRecord[] = [
  {
    id: 'demo-react-1',
    topicId: 'react',
    tags: ['hooks', 'rendering'],
    en_text: 'What is the difference between useMemo and useCallback?',
    am_text: 'Ի՞նչ տարբերություն կա useMemo-ի և useCallback-ի միջև:',
    en_answer:
      'useMemo memoizes computed values, while useCallback memoizes function references to avoid unnecessary re-renders.',
    am_answer:
      'useMemo-ը պահում է հաշվարկված արժեքը, իսկ useCallback-ը՝ ֆունկցիայի հղումը՝ ավելորդ re-render-ներից խուսափելու համար։',
    en_explanation:
      'In interviews, frame this as value caching vs function identity stability. Mention dependency arrays and when memoization overhead can hurt.',
    am_explanation:
      'Հարցազրույցում սա ներկայացրու որպես value cache և function identity stability։ Նշիր dependency array-ը և երբ memoization-ը կարող է վնասել։',
    en_pitfalls: ['Using memoization everywhere by default.', 'Forgetting dependencies and causing stale values.'],
    am_pitfalls: ['Memoization-ը ամենուր կիրառել առանց պատճառի։', 'Dependency-ները մոռանալ և ստանալ stale value։'],
    en_followups: ['When does memoization become a net negative?', 'How does React.memo relate to these hooks?'],
    am_followups: ['Ե՞րբ է memoization-ը դառնում վնասակար։', 'Ինչպե՞ս է React.memo-ն կապված այս hook-երի հետ։'],
    examples: [
      {
        id: 'react-memo-vs-callback-1',
        en_title: 'Memoize expensive value',
        am_title: 'Թանկ հաշվարկի պահպանում',
        en_description: 'useMemo keeps derived data stable until dependencies change.',
        am_description: 'useMemo-ը պահում է derived տվյալը մինչև dependency-ի փոփոխությունը։',
        codeLanguage: 'tsx',
        codeSnippet: `const visibleItems = useMemo(() => filter(items, query), [items, query]);`,
      },
      {
        id: 'react-memo-vs-callback-2',
        en_title: 'Stable callback for child',
        am_title: 'Կայուն callback child-ի համար',
        en_description: 'useCallback avoids changing function identity every render.',
        am_description: 'useCallback-ը պահում է ֆունկցիայի նույն հղումը re-render-ների ընթացքում։',
        codeLanguage: 'tsx',
        codeSnippet: `const handleSelect = useCallback((id: string) => setSelectedId(id), []);`,
      },
    ],
    codeLanguage: 'tsx',
    codeSnippet: `const visibleItems = useMemo(() => filter(items, query), [items, query]);\nconst handleSelect = useCallback((id: string) => setSelectedId(id), []);`,
  },
  {
    id: 'demo-react-2',
    topicId: 'react',
    tags: ['state', 'performance'],
    en_text: 'When does a React component re-render?',
    am_text: 'Ե՞րբ է React կոմպոնենտը վերարարկվում (re-render):',
    en_answer:
      'A component re-renders when its state changes, parent props change, or consumed context updates.',
    am_answer:
      'Կոմպոնենտը re-render է լինում, երբ state-ը փոխվում է, parent-ից եկած props-ը փոխվում են կամ context-ը թարմացվում է։',
    en_explanation:
      'Mention render triggers, batching, and that re-render does not always mean DOM update due to reconciliation.',
    am_explanation:
      'Նշիր render trigger-ները, batching-ը և այն, որ re-render-ը միշտ չէ, որ DOM update է նշանակում reconciliation-ի պատճառով։',
    en_pitfalls: ['Confusing re-render with repaint.', 'Ignoring parent renders that cascade into children.'],
    am_pitfalls: ['Re-render-ը շփոթել repaint-ի հետ։', 'Անտեսել parent render-ի ազդեցությունը child-երի վրա։'],
    en_followups: ['How can you prevent unnecessary renders?', 'What does React DevTools Profiler show?'],
    am_followups: ['Ինչպե՞ս կանխել ավելորդ render-ները։', 'Ի՞նչ է ցույց տալիս React DevTools Profiler-ը։'],
    examples: [
      {
        id: 'react-rerender-1',
        en_title: 'State update trigger',
        am_title: 'State update-trigger',
        en_description: 'Any setState call schedules a re-render of that component.',
        am_description: 'setState-ի յուրաքանչյուր կանչ ծրագրավորում է այդ կոմպոնենտի re-render։',
        codeLanguage: 'tsx',
        codeSnippet: `const [count, setCount] = useState(0);\n<button onClick={() => setCount((c) => c + 1)}>+</button>;`,
      },
    ],
    codeLanguage: 'tsx',
    codeSnippet: `const Parent = () => {\n  const [value, setValue] = useState(0);\n  return <Child value={value} />;\n};`,
  },
  {
    id: 'demo-react-3',
    topicId: 'react',
    tags: ['state-management'],
    en_text: 'When should you use Zustand over React Context?',
    am_text: 'Ե՞րբ է ավելի ճիշտ Zustand օգտագործել Context-ի փոխարեն:',
    en_answer:
      'Use Zustand when many components need global state with selective subscriptions and minimal boilerplate.',
    am_answer:
      'Zustand-ը օգտակար է, երբ շատ կոմպոնենտներ պետք է օգտվեն shared state-ից selective subscription-ներով և քիչ boilerplate-ով։',
    en_explanation:
      'Context is great for dependency injection and low-frequency updates. Zustand shines for frequently-changing global state slices.',
    am_explanation:
      'Context-ը լավ է dependency injection-ի և քիչ update-ների համար, իսկ Zustand-ը՝ հաճախ թարմացվող global state slice-երի համար։',
    en_pitfalls: ['Putting frequently changing data in a single Context value.', 'Overengineering with global state too early.'],
    am_pitfalls: ['Հաճախ փոխվող տվյալը մեկ Context value-ում պահել։', 'Շատ շուտ global state-ով բարդացնել լուծումը։'],
    en_followups: ['How does selector-based subscription help performance?', 'When is Context still the better choice?'],
    am_followups: ['Ինչպե՞ս է selector-based subscription-ը օգնում performance-ին։', 'Ե՞րբ է Context-ը ավելի ճիշտ ընտրություն։'],
    examples: [
      {
        id: 'zustand-example-1',
        en_title: 'Scoped selector subscription',
        am_title: 'Selector-ով subscription',
        en_description: 'Only components using selected slice re-render.',
        am_description: 'Միայն ընտրված slice օգտագործող կոմպոնենտներն են re-render լինում։',
        codeLanguage: 'tsx',
        codeSnippet: `const count = useCounterStore((s) => s.count);\nconst inc = useCounterStore((s) => s.inc);`,
      },
    ],
  },
  {
    id: 'demo-js-1',
    topicId: 'javascript',
    tags: ['event-loop', 'async'],
    en_text: 'Explain the JavaScript event loop in one minute.',
    am_text: 'Բացատրիր JavaScript event loop-ը մեկ րոպեում։',
    en_answer:
      'JS uses a call stack. Async work queues callbacks. The event loop pushes tasks from queues to the stack when it is free, prioritizing microtasks.',
    am_answer:
      'JS-ը օգտագործում է call stack։ Async աշխատանքը callback-ները դնում է հերթերի մեջ, event loop-ը դրանք stack է բերում, երբ այն ազատ է՝ առաջնահերթ տալով microtask-ներին։',
    en_explanation:
      'Highlight ordering: sync code first, then microtasks (Promise callbacks), then macrotasks (setTimeout).',
    am_explanation:
      'Շեշտիր հերթականությունը՝ sync code, հետո microtask (Promise callback), հետո macrotask (setTimeout):',
    en_pitfalls: ['Saying setTimeout(0) runs immediately.', 'Mixing microtask and macrotask order.'],
    am_pitfalls: ['Ասել, որ setTimeout(0)-ը անմիջապես է աշխատում։', 'Խառնել microtask/macrotask հերթականությունը։'],
    en_followups: ['Where do MutationObserver callbacks run?', 'How does this affect UI jank?'],
    am_followups: ['MutationObserver callback-ները որտե՞ղ են աշխատում։', 'Սա ինչպե՞ս է ազդում UI jank-ի վրա։'],
    examples: [
      {
        id: 'event-loop-order',
        en_title: 'Execution order',
        am_title: 'Կատարման հերթականություն',
        en_description: 'Promise callback executes before timeout callback.',
        am_description: 'Promise callback-ը աշխատում է timeout callback-ից առաջ։',
        codeLanguage: 'js',
        codeSnippet: `console.log('A');\nsetTimeout(() => console.log('B'), 0);\nPromise.resolve().then(() => console.log('C'));\n// A, C, B`,
      },
    ],
  },
  {
    id: 'demo-js-2',
    topicId: 'javascript',
    tags: ['closures'],
    en_text: 'What problem do closures solve?',
    am_text: 'Ի՞նչ խնդիր են closures-ը լուծում:',
    en_answer:
      'Closures let functions keep access to lexical variables after the outer function returns.',
    am_answer:
      'Closure-ը թույլ է տալիս ֆունկցիային պահել lexical scope-ի փոփոխականներին մուտքը արտաքին ֆունկցիայի ավարտից հետո։',
    en_explanation:
      'Use closures for private state, factory functions, and callbacks that need historical context.',
    am_explanation:
      'Closure-ը օգտագործիր private state-ի, factory ֆունկցիաների և context պահպանող callback-ների համար։',
    en_pitfalls: ['Capturing changing loop variables incorrectly.', 'Keeping large objects alive accidentally.'],
    am_pitfalls: ['loop variable-ը սխալ capture անել։', 'Մեծ օբյեկտները պատահաբար հիշողության մեջ պահել։'],
    en_followups: ['How does let fix closure-in-loop bugs?', 'How do closures affect memory?'],
    am_followups: ['Ինչպե՞ս է let-ը լուծում closure-ի loop bug-ը։', 'Closure-ները ինչպե՞ս են ազդում memory-ի վրա։'],
    examples: [
      {
        id: 'closure-counter',
        en_title: 'Private counter factory',
        am_title: 'Private counter factory',
        en_description: 'Returned functions can still access count.',
        am_description: 'Վերադարձված ֆունկցիաները շարունակում են տեսնել count-ը։',
        codeLanguage: 'js',
        codeSnippet: `function createCounter() {\n  let count = 0;\n  return () => ++count;\n}`,
      },
    ],
  },
  {
    id: 'demo-js-3',
    topicId: 'javascript',
    tags: ['types', 'coercion'],
    en_text: 'What is type coercion and why can it be dangerous?',
    am_text: 'Ի՞նչ է type coercion-ը և ինչու կարող է վտանգավոր լինել:',
    en_answer:
      'Type coercion is implicit conversion between types, which can hide bugs and produce surprising comparisons.',
    am_answer:
      'Type coercion-ը տիպերի միջև implicit փոխարկում է, որը կարող է թաքցնել bug-եր և տալ անակնկալ համեմատություններ։',
    en_explanation:
      'Mention == vs === and suggest explicit Number/String conversion in critical code paths.',
    am_explanation:
      'Նշիր == և === տարբերությունը, ու առաջարկիր Number/String explicit փոխարկումներ critical հոսքերում։',
    en_pitfalls: ['Using == in business-critical comparisons.', 'Assuming all falsy values mean the same thing.'],
    am_pitfalls: ['== օգտագործել critical համեմատություններում։', 'Ենթադրել, որ բոլոր falsy արժեքները նույնն են։'],
    en_followups: ['What are common coercion edge cases?', 'How do you lint against unsafe coercion?'],
    am_followups: ['Ի՞նչ edge case-ներ կան coercion-ում։', 'Ինչպե՞ս lint անել unsafe coercion-ի դեմ։'],
    examples: [
      {
        id: 'coercion-eq',
        en_title: 'Strict equality safety',
        am_title: 'Strict equality անվտանգություն',
        en_description: 'Prefer strict comparison for predictable behavior.',
        am_description: 'Կանխատեսելի վարքագծի համար նախընտրիր strict comparison։',
        codeLanguage: 'js',
        codeSnippet: `0 == false   // true\n0 === false  // false`,
      },
    ],
  },
  {
    id: 'demo-system-1',
    topicId: 'system-design',
    tags: ['scalability', 'architecture'],
    en_text: 'How would you design a URL shortener?',
    am_text: 'Ինչպե՞ս կդիզայնեիր URL shortener:',
    en_answer:
      'Design an API, key generation, storage, redirect layer, cache, and analytics with high availability and low latency.',
    am_answer:
      'Կառուցիր API, key generation, storage, redirect շերտ, cache և analytics՝ բարձր availability-ով և ցածր latency-ով։',
    en_explanation:
      'Discuss read/write ratio, collision handling, key-space strategy, and eventual consistency for analytics.',
    am_explanation:
      'Քննարկիր read/write հարաբերակցությունը, collision handling-ը, key-space ռազմավարությունը և analytics-ի eventual consistency-ն։',
    en_pitfalls: ['Ignoring hot-key traffic spikes.', 'No expiration or abuse controls.'],
    am_pitfalls: ['Չհաշվել hot-key traffic-ի թռիչքները։', 'Չունենալ expiration կամ abuse control։'],
    en_followups: ['How would you shard keys?', 'How do you support custom aliases safely?'],
    am_followups: ['Ինչպե՞ս shard անել key-երը։', 'Ինչպե՞ս անվտանգ աջակցել custom alias-ներին։'],
    examples: [
      {
        id: 'shortener-api',
        en_title: 'Create endpoint',
        am_title: 'Create endpoint',
        en_description: 'POST endpoint returns shortened URL and metadata.',
        am_description: 'POST endpoint-ը վերադարձնում է կարճ URL և metadata։',
        codeLanguage: 'http',
        codeSnippet: `POST /api/shorten\n{ "url": "https://example.com/page" }`,
      },
    ],
  },
  {
    id: 'demo-system-2',
    topicId: 'system-design',
    tags: ['consistency', 'databases'],
    en_text: 'When do you pick eventual consistency?',
    am_text: 'Ե՞րբ ընտրել eventual consistency:',
    en_answer:
      'Pick eventual consistency when availability and partition tolerance matter more than immediate read-after-write correctness.',
    am_answer:
      'Eventual consistency ընտրիր, երբ availability-ն և partition tolerance-ը ավելի կարևոր են, քան անմիջական read-after-write correctness-ը։',
    en_explanation:
      'Use examples like feeds and analytics where stale reads are acceptable for a short window.',
    am_explanation:
      'Օգտագործիր feed-երի և analytics-ի օրինակներ, որտեղ կարճ ժամանակով stale read-ը ընդունելի է։',
    en_pitfalls: ['Applying eventual consistency to financial ledgers.', 'Not communicating staleness to users.'],
    am_pitfalls: ['Eventual consistency կիրառել ֆինանսական ledger-ների վրա։', 'Օգտվողին չտեղեկացնել stale տվյալների մասին։'],
    en_followups: ['How do you reduce staleness impact?', 'What monitoring proves consistency health?'],
    am_followups: ['Ինչպե՞ս նվազեցնել staleness-ի ազդեցությունը։', 'Ո՞ր monitoring-ը ցույց կտա consistency-ի առողջությունը։'],
    examples: [
      {
        id: 'eventual-read-model',
        en_title: 'Read model replication',
        am_title: 'Read model replication',
        en_description: 'Writes go to primary; replicas serve slightly stale reads.',
        am_description: 'Write-երը գնում են primary, replica-ները ծառայում են փոքր stale read-եր։',
        codeLanguage: 'txt',
        codeSnippet: `Client -> Write API -> Primary DB\nReplica lag: 50-500ms`,
      },
    ],
  },
  {
    id: 'demo-system-3',
    topicId: 'system-design',
    tags: ['caching'],
    en_text: 'What cache invalidation strategy would you start with?',
    am_text: 'Cache invalidation-ի ո՞ր ռազմավարությամբ կսկսեիր:',
    en_answer:
      'Start with TTL + explicit invalidation on writes, then add versioned keys for critical consistency-sensitive paths.',
    am_answer:
      'Սկսիր TTL + write-ի ժամանակ explicit invalidation-ով, հետո critical հոսքերի համար ավելացրու versioned key-եր։',
    en_explanation:
      'Explain consistency vs latency trade-off and justify invalidation guarantees needed by product requirements.',
    am_explanation:
      'Բացատրի consistency/latency trade-off-ը և հիմնավորի invalidation-ի անհրաժեշտ երաշխիքները ըստ product պահանջների։',
    en_pitfalls: ['Relying only on TTL for critical data.', 'Invalidating too broadly and causing cache stampede.'],
    am_pitfalls: ['Critical տվյալների համար միայն TTL-ի վրա հիմնվել։', 'Շատ լայն invalidation անել և առաջացնել cache stampede։'],
    en_followups: ['How would you prevent stampedes?', 'When should you use write-through cache?'],
    am_followups: ['Ինչպե՞ս կանխել stampede-ը։', 'Ե՞րբ օգտագործել write-through cache։'],
    examples: [
      {
        id: 'cache-version-key',
        en_title: 'Versioned cache key',
        am_title: 'Versioned cache key',
        en_description: 'Bump key version to invalidate old entries safely.',
        am_description: 'Key version-ը բարձրացնելով՝ անվտանգ invalidation անում ես հին entry-երի համար։',
        codeLanguage: 'txt',
        codeSnippet: `product:{id}:v{version}`,
      },
    ],
  },
];
