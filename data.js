const DATA = [
  {
    id: "arch", title: "Архитектура монолитных приложений", icon: "&#9608;", color: "cyan",
    rows: [
      { topic: "Слои (Layers)", desc: `Разделение приложения на слои: **Presentation**, **Application**, **Domain**, **Infrastructure**.

Каждый слой имеет чёткую ответственность. Зависимости направлены внутрь по **Dependency Rule**.

В терминах **Clean Architecture**:

- **Entities** — ядро бизнеса.
  Тут лежат сущности и правила предметной области: например \`Order\`, \`Account\`, \`Money\`.
  Они не знают про HTTP, БД, ORM, UI.
- **Use Cases** — сценарии приложения.
  Это действия типа: \`CreateOrder\`, \`TransferMoney\`, \`LoginUser\`.
  Они говорят, что система делает, и координируют entities.
- **Interface Adapters** — слой-переводчик между внутренней логикой и внешним миром.
  Внутри обычно:
  - **Controllers** — принимают входящий запрос;
  - **Presenters** — подготавливают результат для показа;
  - **Views** — отображают результат;
  - **Gateways / Repositories / API adapters** — ходят в БД и внешние сервисы.
- **Frameworks & Drivers** — внешняя инфраструктура:
  web framework, БД, ORM, роутинг, конфиг, драйверы, SDK.

Что такое **Presenter**:

- это не бизнес-логика;
- он берет результат use case и превращает его в удобный формат для UI/API;
- например: из внутреннего Response делает JSON, ViewModel или DTO для экрана.`, links: [{t: "The Clean Architecture — Uncle Bob", u: "https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html"}] },
      { topic: "Чистая архитектура (Clean Architecture)", desc: "Архитектурный паттерн Роберта Мартина: независимость от фреймворков, UI, БД. Ядро — бизнес-логика, внешние слои — инфраструктура. Ключевой принцип — Dependency Inversion.", links: [{t: "Clean Architecture — оригинал", u: "https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html"}] },
      { topic: "Разделение на компоненты и модули", desc: "Группировка кода по фичам или bounded context. Варианты: by layer, by feature, by feature + layer (модульный монолит). Позволяет независимо развивать части системы.", links: [] },
      { topic: "Реализация Outbox", desc: `## Зачем вообще Outbox

Проблема в том, что нельзя надежно сделать так:

1. сохранить заказ в БД
2. потом отправить событие в брокер

Потому что между этими шагами всё может упасть.

### Outbox решает это так:

* агрегат поднимает доменное событие
* при \`CommitAsync()\` это событие записывается в таблицу \`OutboxMessages\`
* и сам агрегат, и outbox сохраняются **в одной транзакции**
* потом отдельный процесс читает outbox и публикует события наружу

---

# Как выглядит поток

## Сценарий создания заказа

1. \`CommandHandler\` вызывает \`Order.Create(...)\`
2. \`Order\` проверяет инварианты
3. \`Order\` добавляет \`DomainEvent\`
4. \`Repository\` добавляет агрегат в \`DbContext\`
5. \`UnitOfWork.CommitAsync()\`:

   * собирает \`DomainEvents\`
   * превращает их в \`OutboxMessage\`
   * вызывает \`SaveChangesAsync()\`
6. фоновый процесс читает \`OutboxMessages\`
7. публикует событие
8. помечает сообщение как обработанное

---

# Минимальный пример

## 1. Domain primitives

\`\`\`csharp
namespace Demo.Domain.Primitives;

public interface IDomainEvent
{
    Guid Id { get; }
    DateTime OccurredOnUtc { get; }
}

public abstract record DomainEvent : IDomainEvent
{
    public Guid Id { get; init; } = Guid.NewGuid();
    public DateTime OccurredOnUtc { get; init; } = DateTime.UtcNow;
}
\`\`\`

\`\`\`csharp
using System.Collections.ObjectModel;

namespace Demo.Domain.Primitives;

public abstract class AggregateRoot
{
    private readonly List<IDomainEvent> _domainEvents = [];

    public IReadOnlyCollection<IDomainEvent> DomainEvents =>
        new ReadOnlyCollection<IDomainEvent>(_domainEvents);

    protected void Raise(IDomainEvent domainEvent)
    {
        _domainEvents.Add(domainEvent);
    }

    public void ClearDomainEvents()
    {
        _domainEvents.Clear();
    }
}
\`\`\`

---

## 2. Агрегат Order

\`\`\`csharp
using Demo.Domain.Primitives;

namespace Demo.Domain.Orders;

public sealed class Order : AggregateRoot
{
    private readonly List<OrderLine> _lines = [];

    private Order() { }

    public Guid Id { get; private set; }
    public Guid CustomerId { get; private set; }
    public decimal TotalAmount { get; private set; }

    public IReadOnlyCollection<OrderLine> Lines => _lines.AsReadOnly();

    public static Order Create(Guid customerId, IEnumerable<CreateOrderLineData> lines)
    {
        var items = lines.ToList();

        if (customerId == Guid.Empty)
            throw new ArgumentException("CustomerId is required.");

        if (items.Count == 0)
            throw new InvalidOperationException("Order must have at least one line.");

        var order = new Order
        {
            Id = Guid.NewGuid(),
            CustomerId = customerId
        };

        foreach (var item in items)
        {
            order.AddLine(item.ProductId, item.Quantity, item.UnitPrice);
        }

        order.Raise(new OrderCreatedDomainEvent(order.Id, order.CustomerId, order.TotalAmount));

        return order;
    }

    private void AddLine(Guid productId, int quantity, decimal unitPrice)
    {
        if (productId == Guid.Empty)
            throw new ArgumentException("ProductId is required.");

        if (quantity <= 0)
            throw new InvalidOperationException("Quantity must be greater than zero.");

        if (unitPrice <= 0)
            throw new InvalidOperationException("UnitPrice must be greater than zero.");

        _lines.Add(new OrderLine(productId, quantity, unitPrice));
        TotalAmount = _lines.Sum(x => x.Quantity * x.UnitPrice);
    }
}

public sealed class OrderLine
{
    private OrderLine() { }

    public OrderLine(Guid productId, int quantity, decimal unitPrice)
    {
        Id = Guid.NewGuid();
        ProductId = productId;
        Quantity = quantity;
        UnitPrice = unitPrice;
    }

    public Guid Id { get; private set; }
    public Guid ProductId { get; private set; }
    public int Quantity { get; private set; }
    public decimal UnitPrice { get; private set; }
}

public sealed record CreateOrderLineData(Guid ProductId, int Quantity, decimal UnitPrice);

public sealed record OrderCreatedDomainEvent(
    Guid OrderId,
    Guid CustomerId,
    decimal TotalAmount) : DomainEvent;
\`\`\`

---

## 3. Command

\`\`\`csharp
namespace Demo.Application.Orders.CreateOrder;

public sealed record CreateOrderCommand(
    Guid CustomerId,
    IReadOnlyCollection<CreateOrderLineRequest> Lines);

public sealed record CreateOrderLineRequest(
    Guid ProductId,
    int Quantity,
    decimal UnitPrice);
\`\`\`

---

## 4. Repository и UnitOfWork

\`\`\`csharp
using Demo.Domain.Orders;

namespace Demo.Application.Abstractions;

public interface IOrderRepository
{
    Task AddAsync(Order order, CancellationToken cancellationToken = default);
}

public interface IUnitOfWork
{
    Task CommitAsync(CancellationToken cancellationToken = default);
}
\`\`\`

---

## 5. CommandHandler

Здесь нет логики outbox. Это важно.

\`\`\`csharp
using Demo.Application.Abstractions;
using Demo.Domain.Orders;

namespace Demo.Application.Orders.CreateOrder;

public sealed class CreateOrderCommandHandler
{
    private readonly IOrderRepository _orders;
    private readonly IUnitOfWork _unitOfWork;

    public CreateOrderCommandHandler(IOrderRepository orders, IUnitOfWork unitOfWork)
    {
        _orders = orders;
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> Handle(CreateOrderCommand command, CancellationToken cancellationToken)
    {
        var order = Order.Create(
            command.CustomerId,
            command.Lines.Select(x => new CreateOrderLineData(
                x.ProductId,
                x.Quantity,
                x.UnitPrice)));

        await _orders.AddAsync(order, cancellationToken);
        await _unitOfWork.CommitAsync(cancellationToken);

        return order.Id;
    }
}
\`\`\`

---

## 6. OutboxMessage

\`\`\`csharp
namespace Demo.Infrastructure.Outbox;

public sealed class OutboxMessage
{
    public Guid Id { get; set; }
    public DateTime OccurredOnUtc { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Payload { get; set; } = string.Empty;
    public DateTime? ProcessedOnUtc { get; set; }
    public string? Error { get; set; }
}
\`\`\`

---

## 7. DbContext

\`\`\`csharp
using Demo.Domain.Orders;
using Demo.Infrastructure.Outbox;
using Microsoft.EntityFrameworkCore;

namespace Demo.Infrastructure.Persistence;

public sealed class AppDbContext : DbContext
{
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OutboxMessage> OutboxMessages => Set<OutboxMessage>();

    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Order>(builder =>
        {
            builder.ToTable("orders");
            builder.HasKey(x => x.Id);

            builder.Property(x => x.CustomerId).IsRequired();
            builder.Property(x => x.TotalAmount).HasPrecision(18, 2);

            builder.OwnsMany(x => x.Lines, lines =>
            {
                lines.ToTable("order_lines");
                lines.WithOwner().HasForeignKey("OrderId");
                lines.HasKey(x => x.Id);
                lines.Property(x => x.ProductId).IsRequired();
                lines.Property(x => x.Quantity).IsRequired();
                lines.Property(x => x.UnitPrice).HasPrecision(18, 2);
            });

            builder.Ignore(x => x.DomainEvents);
        });

        modelBuilder.Entity<OutboxMessage>(builder =>
        {
            builder.ToTable("outbox_messages");
            builder.HasKey(x => x.Id);

            builder.Property(x => x.Type).IsRequired();
            builder.Property(x => x.Payload).IsRequired();
            builder.Property(x => x.OccurredOnUtc).IsRequired();
        });
    }
}
\`\`\`

---

## 8. Repository

\`\`\`csharp
using Demo.Application.Abstractions;
using Demo.Domain.Orders;
using Demo.Infrastructure.Persistence;

namespace Demo.Infrastructure.Repositories;

public sealed class OrderRepository : IOrderRepository
{
    private readonly AppDbContext _dbContext;

    public OrderRepository(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public Task AddAsync(Order order, CancellationToken cancellationToken = default)
    {
        _dbContext.Orders.Add(order);
        return Task.CompletedTask;
    }
}
\`\`\`

---

## 9. Главное: UnitOfWork.CommitAsync()

Вот центральная часть.

\`\`\`csharp
using System.Text.Json;
using Demo.Application.Abstractions;
using Demo.Domain.Primitives;
using Demo.Infrastructure.Outbox;
using Demo.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Demo.Infrastructure;

public sealed class UnitOfWork : IUnitOfWork
{
    private readonly AppDbContext _dbContext;

    public UnitOfWork(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task CommitAsync(CancellationToken cancellationToken = default)
    {
        var aggregates = _dbContext.ChangeTracker
            .Entries<AggregateRoot>()
            .Select(x => x.Entity)
            .Where(x => x.DomainEvents.Any())
            .ToList();

        var domainEvents = aggregates
            .SelectMany(x => x.DomainEvents)
            .ToList();

        foreach (var domainEvent in domainEvents)
        {
            var outboxMessage = new OutboxMessage
            {
                Id = domainEvent.Id,
                OccurredOnUtc = domainEvent.OccurredOnUtc,
                Type = domainEvent.GetType().FullName!,
                Payload = JsonSerializer.Serialize(domainEvent, domainEvent.GetType())
            };

            _dbContext.OutboxMessages.Add(outboxMessage);
        }

        foreach (var aggregate in aggregates)
        {
            aggregate.ClearDomainEvents();
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
\`\`\`

---

# Почему это хороший вариант

## 1. Агрегат знает только про домен

Он не знает ни про брокер, ни про outbox, ни про инфраструктуру.

## 2. CommandHandler не замусорен

Он просто создает агрегат и вызывает commit.

## 3. Outbox добавляется автоматически

Любое доменное событие агрегата попадет в outbox при сохранении.

## 4. Всё сохраняется атомарно

\`Order\` и \`OutboxMessage\` пишутся одним \`SaveChangesAsync()\`.

---

# 10. Фоновый обработчик

Минимальная версия: читает outbox и помечает сообщения обработанными.

\`\`\`csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Demo.Infrastructure.Persistence;

namespace Demo.Infrastructure.Outbox;

public sealed class OutboxProcessor : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;

    public OutboxProcessor(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            using var scope = _serviceProvider.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var messages = await dbContext.OutboxMessages
                .Where(x => x.ProcessedOnUtc == null)
                .OrderBy(x => x.OccurredOnUtc)
                .Take(20)
                .ToListAsync(stoppingToken);

            foreach (var message in messages)
            {
                try
                {
                    // Здесь будет публикация в Kafka / RabbitMQ / Service Bus
                    Console.WriteLine($"Publish: {message.Type}");

                    message.ProcessedOnUtc = DateTime.UtcNow;
                    message.Error = null;
                }
                catch (Exception ex)
                {
                    message.Error = ex.Message;
                }
            }

            await dbContext.SaveChangesAsync(stoppingToken);
            await Task.Delay(TimeSpan.FromSeconds(2), stoppingToken);
        }
    }
}
\`\`\`

---

# Что в итоге надо запомнить

Самая важная связка здесь такая:

\`\`\`csharp
AggregateRoot -> DomainEvents -> UnitOfWork.CommitAsync() -> OutboxMessages
\`\`\`

Именно это и дает нужный эффект:

* доменная модель остается чистой
* приложение остается простым
* инфраструктура надежно сохраняет события
* публикация наружу происходит отдельно`, links: [{t: "microservices.io — Outbox", u: "https://microservices.io/patterns/data/transactional-outbox.html"}] },
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
const SHEETS_URL = 'https://script.google.com/macros/s/AKfycbyeDAWD2m7QLsR1KDCqn4_vT77kbJBsY-s45NSqA30DcTUxf1D_5wODHt-8pJp8vdjdFw/exec';
const STORAGE_KEY = 'devkb_learned';
const COMMENT_AUTHOR_KEY = 'devkb_comment_author';

// ── Local state ───────────────────────────────────────────────────────────────
let learned = {};
try { learned = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch(e) {}
function saveLearned() { localStorage.setItem(STORAGE_KEY, JSON.stringify(learned)); }

let commentAuthor = '';
try { commentAuthor = localStorage.getItem(COMMENT_AUTHOR_KEY) || ''; } catch(e) {}
function saveCommentAuthor(name) {
  commentAuthor = name || '';
  localStorage.setItem(COMMENT_AUTHOR_KEY, commentAuthor);
}

let commentsByTopic = {};

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

async function fetchAllCommentsFromSheets() {
  try {
    const r = await fetch(`${SHEETS_URL}?action=getAllComments`, { signal: AbortSignal.timeout(8000) });
    if (!r.ok) return null;
    const d = await r.json();
    return (d && typeof d === 'object' && !d.error) ? d : null;
  } catch { return null; }
}

async function addCommentToSheets(payload) {
  try {
    const params = new URLSearchParams({ action: 'addComment' });
    Object.entries(payload).forEach(([k, v]) => {
      if (v !== undefined && v !== null) params.set(k, String(v));
    });
    const r = await fetch(`${SHEETS_URL}?${params.toString()}`, { signal: AbortSignal.timeout(8000) });
    if (!r.ok) return null;
    const d = await r.json();
    return (d && typeof d === 'object' && !d.error) ? d : null;
  } catch { return null; }
}

function normalizeComment(comment) {
  return {
    id: comment.id || `${comment.topicKey}-${comment.createdAt || Date.now()}`,
    topicKey: comment.topicKey || '',
    topicTitle: comment.topicTitle || '',
    sectionId: comment.sectionId || '',
    sectionTitle: comment.sectionTitle || '',
    author: comment.author || 'Anonymous',
    comment: comment.comment || '',
    createdAt: comment.createdAt || new Date().toISOString()
  };
}

function getComments(topicKey) {
  return commentsByTopic[topicKey] || [];
}

function setAllComments(raw) {
  commentsByTopic = {};
  if (!raw || typeof raw !== 'object') return;
  Object.keys(raw).forEach(topicKey => {
    commentsByTopic[topicKey] = Array.isArray(raw[topicKey])
      ? raw[topicKey].map(normalizeComment)
      : [];
  });
}

function rememberCommentLocally(comment) {
  const normalized = normalizeComment(comment);
  commentsByTopic[normalized.topicKey] ||= [];
  commentsByTopic[normalized.topicKey].push(normalized);
  commentsByTopic[normalized.topicKey].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  return normalized;
}

async function submitComment(payload) {
  const trimmedAuthor = (payload.author || '').trim();
  const trimmedComment = (payload.comment || '').trim();

  if (!payload.topicKey) throw new Error('topicKey is required');
  if (!trimmedComment) throw new Error('comment is required');

  if (trimmedAuthor) saveCommentAuthor(trimmedAuthor);

  const remote = await addCommentToSheets({
    topicKey: payload.topicKey,
    topicTitle: payload.topicTitle,
    sectionId: payload.sectionId,
    sectionTitle: payload.sectionTitle,
    author: trimmedAuthor || 'Anonymous',
    comment: trimmedComment
  });

  if (!remote) throw new Error('Не удалось сохранить комментарий');

  return rememberCommentLocally({
    topicKey: payload.topicKey,
    topicTitle: payload.topicTitle,
    sectionId: payload.sectionId,
    sectionTitle: payload.sectionTitle,
    author: remote.author || trimmedAuthor || 'Anonymous',
    comment: remote.comment || trimmedComment,
    createdAt: remote.createdAt || new Date().toISOString()
  });
}

function formatCommentDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
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
  const [remoteProgress, remoteComments] = await Promise.all([
    fetchFromSheets(),
    fetchAllCommentsFromSheets()
  ]);

  if (!remoteProgress) { setSyncState(navigator.onLine ? 'error' : 'offline'); return; }

  let changed = false;
  Object.keys(remoteProgress).forEach(k => {
    if (remoteProgress[k] === true && !learned[k]) { learned[k] = true; changed = true; }
  });

  if (remoteComments) {
    setAllComments(remoteComments);
    changed = true;
  }

  if (changed) { saveLearned(); onSyncRefresh(); }
  setSyncState('synced');
  setTimeout(() => setSyncState('idle'), 2000);
}
