const DATA = [
  {
    id: "arch", title: "Архитектура монолитных приложений", icon: "&#9608;", color: "cyan",
    rows: [
      { topic: "Слои (Layers)", desc: "Разделение приложения на слои: Presentation, Application, Domain, Infrastructure. Каждый слой имеет чёткую ответственность. Зависимости направлены внутрь (Dependency Rule). В терминах Clean Architecture: Entities — ядро бизнеса. Тут лежат сущности и правила предметной области: например Order, Account, Money. Они не знают про HTTP, БД, ORM, UI. Use Cases — сценарии приложения. Это действия типа: CreateOrder, TransferMoney, LoginUser. Они говорят, что система делает, и координируют entities. Interface Adapters — слой-переводчик между внутренней логикой и внешним миром. Внутри обычно: Controllers — принимают входящий запрос; Presenters — подготавливают результат для показа; Views — отображают результат; Gateways / Repositories / API adapters — ходят в БД и внешние сервисы. Frameworks & Drivers — внешняя инфраструктура: web framework, БД, ORM, роутинг, конфиг, драйверы, SDK. Presenter — это не бизнес-логика; он берет результат use case и превращает его в удобный формат для UI/API; например: из внутреннего Response делает JSON, ViewModel или DTO для экрана.", links: [{t: "The Clean Architecture — Uncle Bob", u: "https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html"}] },
      { topic: "Чистая архитектура (Clean Architecture)", desc: "Архитектурный паттерн Роберта Мартина: независимость от фреймворков, UI, БД. Ядро — бизнес-логика, внешние слои — инфраструктура. Ключевой принцип — Dependency Inversion.", links: [{t: "Clean Architecture — оригинал", u: "https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html"}] },
      { topic: "Разделение на компоненты и модули", desc: "Группировка кода по фичам или bounded context. Варианты: by layer, by feature, by feature + layer (модульный монолит). Позволяет независимо развивать части системы.", links: [] },
      { topic: "Реализация Outbox", desc: "Transactional Outbox pattern: запись событий в таблицу outbox в той же транзакции, что и бизнес-данные. Отдельный процесс читает outbox и публикует события. Гарантирует at-least-once доставку.", links: [{t: "microservices.io — Outbox", u: "https://microservices.io/patterns/data/transactional-outbox.html"}] },
      { topic: "Domain layer — что пишем, структура", desc: "Entities, Value Objects, Domain Services, Domain Events, Aggregates, Specifications. Папки: Entities/, ValueObjects/, Services/, Events/, Exceptions/. Никаких зависимостей на инфраструктуру.", links: [] },
      { topic: "Application layer — что пишем, структура", desc: "Use Cases / Command & Query Handlers, DTOs, Interfaces репозиториев, Application Services, Validators. Папки: UseCases/ (или Commands/, Queries/), DTOs/, Interfaces/, Services/. Оркестрация доменной логики.", links: [] },
      { topic: "Изучение DDD-проекта ТЛ", desc: "Досконально разобрать один реальный проект: структура папок, принципы группировки, как реализованы агрегаты, события, слои. Составить карту зависимостей между модулями.", links: [] }
    ]
  },
  {
    id: "patterns", title: "Паттерны проектирования", icon: "&#9674;", color: "violet",
    rows: [
      { topic: "Порождающие (Creational)", desc: "Factory Method, Abstract Factory, Builder, Singleton, Prototype. Когда применять: сложное создание объектов, управление жизненным циклом.", links: [{t: "refactoring.guru — порождающие", u: "https://refactoring.guru/ru/design-patterns/creational-patterns"}] },
      { topic: "Структурные (Structural)", desc: "Adapter, Bridge, Composite, Decorator, Facade, Proxy. Когда применять: интеграция несовместимых интерфейсов, добавление поведения без наследования.", links: [{t: "refactoring.guru — структурные", u: "https://refactoring.guru/ru/design-patterns/structural-patterns"}] },
      { topic: "Поведенческие (Behavioral)", desc: "Strategy, Observer, Command, Mediator, Chain of Responsibility, Template Method, State. Когда применять: гибкая замена алгоритмов, событийное взаимодействие.", links: [{t: "refactoring.guru — поведенческие", u: "https://refactoring.guru/ru/design-patterns/behavioral-patterns"}] },
      { topic: "Правила применения", desc: "Выработать для каждого паттерна: когда стоит применять, когда НЕ стоит и почему. Антипаттерны: overengineering, Singleton abuse, God Object.", links: [] }
    ]
  },
  {
    id: "ddd", title: "Тактические паттерны DDD", icon: "&#9670;", color: "amber",
    rows: [
      { topic: "Aggregate", desc: "Кластер связанных объектов с единой точкой входа (Aggregate Root). Гарантирует консистентность внутри границ. Изменения — только через root.", links: [] },
      { topic: "Entity", desc: "Объект с уникальной идентичностью (ID). Равенство определяется по ID, а не по значениям полей. Имеет жизненный цикл.", links: [] },
      { topic: "Value Object", desc: "Объект без идентичности. Равенство по значениям всех полей. Immutable. Примеры: Money, Address, Email.", links: [] },
      { topic: "Repository", desc: "Абстракция для доступа к агрегатам. Скрывает детали хранения. Интерфейс в Domain, реализация в Infrastructure.", links: [] },
      { topic: "Domain Service", desc: "Логика, не принадлежащая ни одному Entity/VO. Работает с несколькими агрегатами. Stateless.", links: [] },
      { topic: "Application Service", desc: "Оркестрация use case: получить агрегат из репозитория, вызвать бизнес-метод, сохранить. Не содержит бизнес-логику.", links: [] },
      { topic: "Domain Event и реализация", desc: "Фиксация факта изменения в домене. Публикация через MediatR, in-process шину или Outbox. Подписчики — в Application или Infrastructure слое.", links: [] },
      { topic: "Layers (в контексте DDD)", desc: "Domain → Application → Infrastructure → Presentation. Domain не зависит ни от кого. Application знает Domain. Infrastructure реализует интерфейсы Domain/Application.", links: [] },
      { topic: "Границы транзакций агрегатов", desc: "Один агрегат = одна транзакция. Смешивать изменения разных агрегатов в одной транзакции нежелательно. Eventual consistency между агрегатами через Domain Events.", links: [] }
    ]
  },
  {
    id: "efcore", title: "EF Core", icon: "&#9107;", color: "blue",
    rows: [
      { topic: "Миграции", desc: "Code-first миграции: Add-Migration, Update-Database. Связь с CI/CD: генерация SQL-скриптов (dotnet ef migrations script).", links: [{t: "docs — миграции", u: "https://learn.microsoft.com/ru-ru/ef/core/managing-schemas/migrations/"}] },
      { topic: "Миграции как сырой SQL", desc: "migrationBuilder.Sql(\"...\") в методе Up()/Down(). Для сложных DDL/DML, которые EF не умеет генерировать автоматически.", links: [] },
      { topic: "Скрипты CI", desc: "dotnet ef migrations script --idempotent для генерации безопасных скриптов. Интеграция в pipeline: генерация → ревью → применение.", links: [] },
      { topic: "CRUD + транзакции", desc: "SaveChanges() — неявная транзакция. Для нескольких таблиц: Database.BeginTransaction(), Commit(), Rollback().", links: [{t: "docs — транзакции", u: "https://learn.microsoft.com/ru-ru/ef/core/saving/transactions"}] },
      { topic: "Модели отношений", desc: "One-to-One, One-to-Many, Many-to-Many. Конфигурация через Fluent API или Data Annotations. Navigation properties.", links: [{t: "docs — relationships", u: "https://learn.microsoft.com/ru-ru/ef/core/modeling/relationships"}] },
      { topic: "Варианты хранения подсущности", desc: "Owned Types (OwnsOne/OwnsMany), Table Splitting, TPH, TPT, TPC.", links: [] },
      { topic: "Сложные свойства (Value Conversions)", desc: "HasConversion() — преобразование типов при чтении/записи. ValueComparer — настройка сравнения для change tracking.", links: [{t: "docs — value conversions", u: "https://learn.microsoft.com/ru-ru/ef/core/modeling/value-conversions"}] },
      { topic: "PK: составной ключ", desc: "HasKey(e => new { e.Key1, e.Key2 }) через Fluent API. Ограничения: нет автогенерации для составных ключей.", links: [] },
      { topic: "Кластерный индекс (MSSQL)", desc: "По умолчанию PK = кластерный индекс. Можно переопределить: IsClustered(false) для PK, создать кластерный на другом столбце.", links: [] },
      { topic: "HiLo генерация ключей", desc: "UseHiLo() — получение блоков ID из последовательности в БД. Меньше round-trips, ID известен до INSERT.", links: [{t: "docs — generated properties", u: "https://learn.microsoft.com/ru-ru/ef/core/modeling/generated-properties"}] },
      { topic: "Concurrency Tokens", desc: "IsConcurrencyToken() или [ConcurrencyCheck]. Rowversion/Timestamp. EF проверяет значение при UPDATE, бросает DbUpdateConcurrencyException.", links: [{t: "docs — concurrency", u: "https://learn.microsoft.com/ru-ru/ef/core/saving/concurrency"}] },
      { topic: "Tracking vs No-Tracking", desc: "AsNoTracking() — без отслеживания, быстрее для read-only. С отслеживанием — EF следит за изменениями для SaveChanges(). AsNoTrackingWithIdentityResolution() — компромисс.", links: [{t: "docs — tracking", u: "https://learn.microsoft.com/ru-ru/ef/core/querying/tracking"}] },
      { topic: "Загрузка связанных данных", desc: "Eager (Include/ThenInclude), Explicit (Entry().Collection().Load()), Lazy (прокси). Eager для известных графов, Lazy — осторожно (N+1).", links: [{t: "docs — related data", u: "https://learn.microsoft.com/ru-ru/ef/core/querying/related-data/"}] },
      { topic: "Split Queries", desc: "AsSplitQuery() — разбивает один запрос с Include на несколько SQL-запросов. Избегает cartesian explosion.", links: [{t: "docs — split queries", u: "https://learn.microsoft.com/ru-ru/ef/core/querying/single-split-queries"}] },
      { topic: "Функции базы данных", desc: "DbFunction, HasDbFunction() — маппинг C# методов на SQL-функции. Для использования серверных функций в LINQ.", links: [{t: "docs — db functions", u: "https://learn.microsoft.com/ru-ru/ef/core/querying/database-functions"}] },
      { topic: "Отслеживание изменений", desc: "Snapshot (по умолчанию), Notification (INotifyPropertyChanged), Proxy. Snapshot — сравнивает при DetectChanges(). Notification — реагирует на события.", links: [{t: "docs — change tracking", u: "https://learn.microsoft.com/ru-ru/ef/core/change-tracking/"}] },
      { topic: "Получить SQL текст запроса", desc: "ToQueryString() — возвращает SQL до выполнения. Logging через ILoggerFactory. EnableSensitiveDataLogging() для параметров.", links: [] },
      { topic: "Тестирование с EF Core", desc: "In-Memory провайдер (ограничен), SQLite in-memory (ближе к реальности), Testcontainers (реальная БД).", links: [{t: "docs — testing", u: "https://learn.microsoft.com/ru-ru/ef/core/testing/"}] },
      { topic: "Проблемы производительности", desc: "N+1, cartesian explosion, неиспользуемые Include, отсутствие индексов, tracking overhead. Решения: AsSplitQuery, AsNoTracking, проекции, raw SQL.", links: [{t: "docs — performance", u: "https://learn.microsoft.com/ru-ru/ef/core/performance/"}] },
      { topic: "Параллелизм в APP слое", desc: "Нельзя использовать один DbContext параллельно. Создавать отдельный DbContext через IDbContextFactory. Task.WhenAll для параллельных запросов.", links: [] }
    ]
  },
  {
    id: "webapi", title: "WebAPI (ASP.NET Core)", icon: "&#9656;", color: "green",
    rows: [
      { topic: "Configure() vs ConfigureServices()", desc: "ConfigureServices() — регистрация зависимостей в DI. Configure() — настройка HTTP-пайплайна (middleware). В .NET 6+ — builder.Services и app.", links: [{t: "docs — startup", u: "https://learn.microsoft.com/ru-ru/aspnet/core/fundamentals/startup"}] },
      { topic: "Кастомный Middleware", desc: "app.Use(), app.Map(), или класс с InvokeAsync(HttpContext). Добавление через app.UseMiddleware<T>(). Порядок регистрации = порядок выполнения.", links: [{t: "docs — middleware", u: "https://learn.microsoft.com/ru-ru/aspnet/core/fundamentals/middleware/"}] },
      { topic: "HttpContext.Response events", desc: "OnStarting — перед отправкой заголовков (можно модифицировать headers). OnCompleted — после полной отправки ответа (cleanup).", links: [{t: "docs — HttpResponse", u: "https://learn.microsoft.com/ru-ru/dotnet/api/microsoft.aspnetcore.http.httpresponse"}] },
      { topic: "Kestrel WebHost", desc: "Кроссплатформенный веб-сервер ASP.NET Core. Работает как edge-сервер или за reverse proxy (Nginx, IIS).", links: [{t: "docs — Kestrel", u: "https://learn.microsoft.com/ru-ru/aspnet/core/fundamentals/servers/kestrel"}] },
      { topic: "KestrelServerOptions: Limits", desc: "MaxConcurrentConnections, MaxRequestBodySize, RequestHeadersTimeout, KeepAliveTimeout. AllowSynchronousIO — false по умолчанию, включение рискует thread starvation.", links: [] },
      { topic: "Метрики Kestrel: KestrelEventSource", desc: "EventSource для диагностики: connections, requests, rejected, queue length. Чтение через dotnet-counters или EventListener.", links: [{t: "docs — Kestrel diagnostics", u: "https://learn.microsoft.com/ru-ru/aspnet/core/fundamentals/servers/kestrel/diagnostics"}] },
      { topic: "Formatters для MVC", desc: "Input/Output formatters: JSON (System.Text.Json / Newtonsoft), XML, custom. Настройка через AddControllers().AddJsonOptions().", links: [{t: "docs — formatting", u: "https://learn.microsoft.com/ru-ru/aspnet/core/web-api/advanced/formatting"}] },
      { topic: "Форсирование формата ObjectResult", desc: "Produces(\"application/json\"), [FormatFilter], Content negotiation. Для конкретного action: return new ObjectResult(data) { ContentTypes = ... }.", links: [] },
      { topic: "HealthChecks", desc: "AddHealthChecks().AddCheck<T>(), MapHealthChecks(\"/health\"). Liveness, readiness probes. UI: AspNetCore.HealthChecks.UI.", links: [{t: "docs — health checks", u: "https://learn.microsoft.com/ru-ru/aspnet/core/host-and-deploy/health-checks"}] },
      { topic: "Swagger (OpenAPI)", desc: "Swashbuckle или NSwag. AddSwaggerGen(), UseSwagger(), UseSwaggerUI(). Аннотации: [ProducesResponseType], XML-комментарии.", links: [{t: "docs — Swagger", u: "https://learn.microsoft.com/ru-ru/aspnet/core/tutorials/getting-started-with-swashbuckle"}] },
      { topic: "Время жизни контроллера", desc: "По умолчанию Transient — создаётся на каждый запрос. Все зависимости контроллера должны быть совместимы по lifetime.", links: [] },
      { topic: "FromService, FromRoute и др.", desc: "[FromServices] — из DI. [FromRoute] — из URL. [FromHeader] — из HTTP header. [FromBody] — из тела запроса. [FromQuery] — из query string.", links: [{t: "docs — model binding", u: "https://learn.microsoft.com/ru-ru/aspnet/core/mvc/models/model-binding"}] },
      { topic: "ModelBinding", desc: "Привязка HTTP-данных к параметрам action. Порядок: FormValues → Route → QueryString. Custom model binders через IModelBinder.", links: [] },
      { topic: "CancellationToken в async/await", desc: "Передавать CancellationToken в async-методы контроллера. При отмене запроса — прерывание операции. Проброс в EF, HttpClient и т.д.", links: [] }
    ]
  },
  {
    id: "api", title: "Разработка API", icon: "&#8644;", color: "orange",
    rows: [
      { topic: "Идемпотентность", desc: "Повторный вызов с теми же параметрами даёт тот же результат. Idempotency-Key в заголовке. GET, PUT, DELETE — идемпотентны. POST — требует реализации.", links: [{t: "Habr — идемпотентность (Яндекс)", u: "https://habr.com/ru/company/yandex/blog/442762/"}] },
      { topic: "Корректные HTTP статус коды", desc: "2xx — успех, 3xx — перенаправление, 4xx — ошибка клиента, 5xx — ошибка сервера. 200, 201, 204, 400, 404, 409, 422.", links: [] },
      { topic: "Отдача статики отдельно", desc: "Статические файлы через CDN или отдельный сервер. Не нагружать application server статикой.", links: [] },
      { topic: "API Gateway", desc: "Отделение Gateway (маршрутизация, аутентификация, rate limiting) от сервисов с бизнес-логикой. Ocelot, YARP, Kong, Nginx.", links: [{t: "docs — API Gateway pattern", u: "https://learn.microsoft.com/ru-ru/azure/architecture/microservices/design/gateway"}] },
      { topic: "Кэширование", desc: "Response caching, distributed cache (Redis), ETag/If-None-Match, Cache-Control headers. Снижает нагрузку на сервер и БД.", links: [] },
      { topic: "Rate Limiting", desc: "Fixed window, sliding window, token bucket. ASP.NET Core: AddRateLimiter().", links: [{t: "Habr — Rate Limiting", u: "https://habr.com/ru/post/448438/"}] },
      { topic: "Защита от перегрузки", desc: "Circuit breaker (Polly), bulkhead isolation, timeout policies, backpressure. Graceful degradation при пиковых нагрузках.", links: [] },
      { topic: "Пагинация", desc: "Offset-based (skip/take), cursor-based (continuation token). Cursor стабильнее при изменениях данных.", links: [{t: "phauer.com — continuation token", u: "https://phauer.com/2018/web-api-pagination-timestamp-id-continuation-token/"}] },
      { topic: "Observability API", desc: "Метрики (Prometheus, Grafana), логирование (Serilog, ELK), трейсинг (OpenTelemetry, Jaeger). Мониторинг latency, error rate, throughput.", links: [] }
    ]
  },
  {
    id: "security", title: "Безопасность", icon: "&#9919;", color: "rose",
    rows: [
      { topic: "OWASP Top 10", desc: "Injection, Broken Auth, XSS, Insecure Direct Object Ref, Security Misconfiguration и другие основные уязвимости веб-приложений.", links: [{t: "owasp.org — Top 10", u: "https://owasp.org/www-project-top-ten/"}] },
      { topic: "OAuth 2.0", desc: "Протокол авторизации: Authorization Code, Client Credentials, Implicit (deprecated), PKCE. Разделение ролей: Resource Owner, Client, Auth Server, Resource Server.", links: [{t: "Habr — OAuth 2.0", u: "https://habr.com/ru/company/dataart/blog/311376/"}] },
      { topic: "Единая точка аутентификации (SSO)", desc: "Один Identity Provider для всех сервисов. Централизованное управление. IdentityServer, Keycloak, Auth0.", links: [] },
      { topic: "Авторизация на уровне объектов", desc: "Проверка прав не только на endpoint, но и на конкретный объект: может ли user_42 редактировать order_123? Resource-based authorization.", links: [] },
      { topic: "Парадигма: всё закрыто по умолчанию", desc: "Deny by default. Доступ открывается явно через [Authorize], политики, claims. Без атрибута — endpoint закрыт.", links: [] },
      { topic: "JWT (JSON Web Token)", desc: "Формат: Header.Payload.Signature. Stateless аутентификация. Claims. Валидация подписи. Refresh tokens.", links: [{t: "jwt.io — introduction", u: "https://jwt.io/introduction"}] },
      { topic: "Cookies Policy", desc: "HttpOnly — запрет доступа из JS. Secure — только HTTPS. SameSite (Strict/Lax/None) — защита от CSRF. Path, Domain, Expires.", links: [] },
      { topic: "HSTS", desc: "HTTP Strict Transport Security. Браузер всегда использует HTTPS. Заголовок Strict-Transport-Security. Preload list.", links: [{t: "docs — HSTS", u: "https://learn.microsoft.com/ru-ru/aspnet/core/security/enforcing-ssl"}] },
      { topic: "Secret Storage / Vault", desc: "Не хранить секреты в коде. User Secrets (dev), Azure Key Vault, HashiCorp Vault, Environment Variables.", links: [{t: "docs — app secrets", u: "https://learn.microsoft.com/ru-ru/aspnet/core/security/app-secrets"}] },
      { topic: "CSRF / Antiforgery", desc: "Cross-Site Request Forgery: запрос от имени пользователя. Защита: Antiforgery tokens, SameSite cookies. [ValidateAntiForgeryToken].", links: [{t: "docs — antiforgery", u: "https://learn.microsoft.com/ru-ru/aspnet/core/security/anti-request-forgery"}] },
      { topic: "CORS", desc: "Cross-Origin Resource Sharing. Контроль доступа к API с других доменов. AddCors(), WithOrigins(). Preflight OPTIONS запросы.", links: [{t: "docs — CORS", u: "https://learn.microsoft.com/ru-ru/aspnet/core/security/cors"}] }
    ]
  }
];

// ── Config ────────────────────────────────────────────────────────────────────
const SHEETS_URL = 'https://script.google.com/macros/s/AKfycbypmFuhrakRHWqfi6g4NZW7YOgHcrDdf4atgP1XTEfVDL-Eq42Xnjy3dMCu6-gmayAirg/exec';
const STORAGE_KEY = 'devkb_learned';

// ── Local state ───────────────────────────────────────────────────────────────
let learned = {};
try { learned = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch(e) {}
function saveLearned() { localStorage.setItem(STORAGE_KEY, JSON.stringify(learned)); }

// ── Sync UI ───────────────────────────────────────────────────────────────────
function setSyncState(state) {
  const dot = document.getElementById('sync-dot');
  const lbl = document.getElementById('sync-label');
  if (!dot || !lbl) return;
  dot.className = 'sync-dot';
  const cls = { syncing: 'syncing', synced: 'synced', error: 'error', offline: 'error' };
  const txt = { syncing: 'sync…', synced: '', error: 'offline', offline: 'offline' };
  if (cls[state]) dot.classList.add(cls[state]);
  lbl.textContent = txt[state] ?? '';
}

// ── Sheets API ────────────────────────────────────────────────────────────────
async function fetchFromSheets() {
  try {
    const r = await fetch(`${SHEETS_URL}?action=getAll`, { signal: AbortSignal.timeout(8000) });
    if (!r.ok) return null;
    const d = await r.json();
    return (d && typeof d === 'object' && !d.error) ? d : null;
  } catch { return null; }
}

async function pushToSheets(key, value) {
  try {
    await fetch(`${SHEETS_URL}?action=set&key=${encodeURIComponent(key)}&value=${value}`,
      { signal: AbortSignal.timeout(8000) });
  } catch { /* localStorage already saved — silent fail is fine */ }
}

// Debounce rapid toggles into a batch of parallel pushes
let _syncTimer = null;
const _pendingKeys = new Set();
function schedulePush(key) {
  _pendingKeys.add(key);
  clearTimeout(_syncTimer);
  setSyncState('syncing');
  _syncTimer = setTimeout(async () => {
    const keys = [..._pendingKeys]; _pendingKeys.clear();
    await Promise.allSettled(keys.map(k => pushToSheets(k, learned[k] ? 'true' : 'false')));
    setSyncState('synced');
    setTimeout(() => setSyncState('idle'), 2000);
  }, 600);
}

// ── Progress bar (shared between pages) ──────────────────────────────────────
function updateProgress() {
  const total = DATA.reduce((s, sec) => s + sec.rows.length, 0);
  const done = Object.keys(learned).length;
  const pct = total > 0 ? Math.round(done / total * 100) : 0;
  document.getElementById('progress-text').textContent = `${done} / ${total}`;
  document.getElementById('progress-fill').style.width = pct + '%';
}

// ── Initial sync — each page sets onSyncRefresh before calling initSync ───────
let onSyncRefresh = () => {};

async function initSync() {
  setSyncState('syncing');
  const remote = await fetchFromSheets();
  if (!remote) { setSyncState(navigator.onLine ? 'error' : 'offline'); return; }
  let changed = false;
  Object.keys(remote).forEach(k => {
    if (remote[k] === true && !learned[k]) { learned[k] = true; changed = true; }
  });
  if (changed) { saveLearned(); onSyncRefresh(); }
  setSyncState('synced');
  setTimeout(() => setSyncState('idle'), 2000);
}
