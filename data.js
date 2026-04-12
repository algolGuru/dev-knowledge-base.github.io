const article = ({
  what,
  problem,
  how = "",
  diagram = "",
  code = "",
  codeLang = "csharp",
  codeTitle = "Минимальный пример",
  important = []
}) => {
  const parts = [
    "## Что это",
    what.trim()
  ];

  if (problem?.trim()) {
    parts.push("", "## Какую проблему решает", problem.trim());
  }

  if (diagram?.trim()) {
    parts.push("", "## Схема", "", "```text", diagram.trim(), "```");
  }

  if (how?.trim()) {
    parts.push("", "## Как это обычно выглядит в проекте", how.trim());
  }

  if (code?.trim()) {
    parts.push(
      "",
      `## ${codeTitle}`,
      "Ниже упрощенный пример: он показывает идею без лишней инфраструктуры.",
      "",
      `\`\`\`${codeLang}`,
      code.trim(),
      "```"
    );
  }

  if (important.length > 0) {
    parts.push("", "## Что запомнить", ...important.map(item => `- ${item}`));
  }

  return parts.join("\n");
};

const theory = ({ what, problem = "", diagram = "", details = "", important = [] }) => {
  const parts = [
    "## Что это",
    what.trim()
  ];

  if (problem?.trim()) {
    parts.push("", "## Какую проблему решает", problem.trim());
  }

  if (diagram?.trim()) {
    parts.push("", "## Схема", "", "```text", diagram.trim(), "```");
  }

  if (details?.trim()) {
    parts.push("", "## Как это читать", details.trim());
  }

  if (important.length > 0) {
    parts.push("", "## Что запомнить", ...important.map(item => `- ${item}`));
  }

  return parts.join("\n");
};

const topic = (topic, desc, links = []) => ({ topic, desc, links });
const link = (t, u) => ({ t, u });

const DATA = [
  {
    id: "arch", title: "Архитектура монолитных приложений", icon: "&#9608;", color: "cyan",
    rows: [
      topic("Слои (Layers)", theory({
        what: "Слои делят приложение по ответственности: кто принимает вход, кто координирует сценарий, где живут бизнес-правила и кто работает с внешним миром. Чаще всего речь про `Presentation`, `Application`, `Domain`, `Infrastructure`.",
        problem: "Так код не превращается в смесь HTTP, SQL и бизнес-логики в одном месте. Чем яснее границы, тем легче менять UI, БД и интеграции без переписывания ядра.",
        diagram: `
Presentation / API / UI
          |
          v
Application (use cases)
          |
          v
Domain (entities, value objects, rules)
          ^
          |
Infrastructure (DB, SMTP, broker, files)
        `,
        details: `Обычно это читается так:

- **Presentation** принимает HTTP/UI/CLI-вход и переводит его в команду или запрос.
- **Application** собирает use case: вызывает репозитории, доменные методы, транзакцию, интеграции.
- **Domain** хранит инварианты и язык предметной области: \`Order\`, \`Money\`, \`Email\`, правила подтверждения, расчёта и т.д.
- **Infrastructure** реализует доступ к БД, брокерам, файловой системе, внешним API.

Если смотреть через призму Clean Architecture, то:

- **Entities** — самое внутреннее ядро бизнеса;
- **Use Cases** — прикладные сценарии;
- **Interface Adapters** — controllers, presenters, gateways;
- **Frameworks & Drivers** — ASP.NET Core, EF Core, SMTP, Kafka, файловая система.

**Presenter** нужен там, где результат use case надо преобразовать в удобную форму для UI или API. Он не принимает бизнес-решения, а только переводит внутренний результат в DTO, ViewModel или JSON.`,
        important: [
          "Главное не названия папок, а чёткое разделение ответственности.",
          "Зависимости должны смотреть внутрь: домен не знает про HTTP, EF Core и внешние SDK."
        ]
      }), [link("The Clean Architecture — Uncle Bob", "https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html")]),
            topic("Чистая архитектура (Clean Architecture)", `## Что это
Clean Architecture держит бизнес-модель в центре системы. UI, веб-фреймворк, ORM, очередь и файловое хранилище оказываются снаружи и подключаются через интерфейсы, а не наоборот.

![Схема Clean Architecture](/assets/diagrams/arch/clean-architecture.svg)

## Как читать схему
- **Entities** и **Use Cases** содержат то, что должно жить дольше всего.
- **Interface Adapters** переводят HTTP, JSON и SQL в контракты приложения.
- **Frameworks & Drivers** - это заменяемые детали: ASP.NET Core, EF Core, брокеры, UI.

## Практически
- В Application Core обычно держат сущности, абстракции, доменные сервисы и сценарии.
- В Infrastructure лежат реализации репозиториев, отправка писем, очереди, файловая система.
- Если класс знает, как открыть DbContext или какой JSON вернуть контроллеру, он уже слишком близко к внешнему миру.
- Хорошая проверка простая: бизнес-правило должно оставаться понятным даже без знания HTTP и базы данных.
`, [
          link("The Clean Architecture", "https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html"),
          link("Common web application architectures - .NET", "https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/common-web-application-architectures"),
          link("Designing a DDD-oriented microservice - .NET", "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice")
        ]),
            topic("Разделение на компоненты и модули", `## Зачем
Модульный монолит - это не просто много папок. Это один деплой, в котором каждая фича владеет своим публичным контрактом, своим use case-слоем и своими адаптерами.

![Модульный монолит](/assets/diagrams/arch/modular-monolith.svg)

## Хороший разрез
- Модуль собирается вокруг бизнеса, а не вокруг технического слоя.
- Между модулями лучше ходить через команды, события или фасады, а не через чужие сервисы и DbContext.
- Внутри модуля можно держать свой мини-стек: API -> Application -> Domain -> Infrastructure.
- Это удобно, когда одну фичу хочется понимать, тестировать и развивать отдельно от остальных.

## Признаки удачной границы
- Изменение одной фичи не ломает соседние.
- У модуля есть понятный контракт наружу.
- Компонентный набор можно вынести в отдельный сервис без переписывания всей системы.
- Если для новой фичи приходится трогать половину решения, граница выбрана неудачно.
`, [
          link("On .NET Live - Modular Monoliths with ASP.NET Core", "https://learn.microsoft.com/en-us/shows/on-dotnet/on-dotnet-live-modular-monoliths-with-aspnet-core"),
          link("On .NET Live - Clean Architecture, Vertical Slices, and Modular Monoliths (Oh My!)", "https://learn.microsoft.com/en-us/shows/on-dotnet/on-dotnet-live-clean-architecture-vertical-slices-and-modular-monoliths-oh-my"),
          link("Common web application architectures - .NET", "https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/common-web-application-architectures")
        ]),
      topic("Реализация Outbox", `## Зачем вообще Outbox

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
* публикация наружу происходит отдельно`, [link("microservices.io — Outbox", "https://microservices.io/patterns/data/transactional-outbox.html")]),
            topic("Domain layer — что пишем, структура", `## Что здесь живёт
Доменные сущности, value objects, агрегаты, доменные сервисы и доменные события. Это слой, где формулируется язык предметной области и защищаются инварианты.

![Domain layer](/assets/diagrams/arch/domain-layer.svg)

## Что полезно держать внутри
- Инварианты и проверки на изменение состояния.
- Доменные методы, а не только набор сеттеров.
- Value Object для денег, email, срока, адреса, статуса и других смысловых единиц.
- Доменные события, если они помогают выразить факт, а не техническую деталь.

## Чего здесь быть не должно
- HTTP, MVC и HttpContext.
- DbContext, SQL-запросов и любых ORM-специфичных деталей.
- UI-моделей и сценариев доставки ответа.
- Логики "как сохранить" - здесь должно быть только "что должно быть истинным".
`, [
          link("Designing a DDD-oriented microservice - .NET", "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice"),
          link("Common web application architectures - .NET", "https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/common-web-application-architectures")
        ]),
            topic("Application layer — что пишем, структура", `## Роль слоя
Application layer собирает сценарий: принимает command или query, вызывает доменную модель, управляет транзакцией, оркестрирует порты и возвращает DTO. Он отвечает на вопрос "что происходит сейчас?", а не "как устроена база".

![Application layer](/assets/diagrams/arch/application-layer.svg)

## Типичный состав
- Handlers для команд и запросов.
- DTO, request/response модели и маппинг.
- Границы транзакции и Unit of Work.
- Интерфейсы для репозиториев, внешних API и уведомлений.
- Идемпотентность, авторизация на уровне сценария и повторные попытки там, где это нужно.

## Полезная граница
- Бизнес-правила и инварианты остаются в domain layer.
- Application layer не должен превращаться в свалку из SQL и маппинга.
- Если use case стал длинным, его обычно лучше разбить на более узкие сценарии, а не переносить логику в контроллер.
`, [
          link("Designing a DDD-oriented microservice - .NET", "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice"),
          link("Common web application architectures - .NET", "https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/common-web-application-architectures"),
          link("Developing ASP.NET Core MVC apps - .NET", "https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/develop-asp-net-core-mvc-apps")
        ]),
            topic("Изучение DDD-проекта ТЛ", `## Как читать чужой DDD-проект
Когда вы открываете проект ТЛ, лучше начинать не с папок, а с потока: где вход, где границы контекстов, какие агрегаты владеют данными и где события покидают модуль.

![Карта чтения DDD-проекта](/assets/diagrams/arch/ddd-study-map.svg)

## Маршрут исследования
1. Найдите entry point и публичные use case-ы.
2. Определите bounded contexts и module boundaries.
3. Откройте агрегаты: какие инварианты они защищают и что меняется атомарно.
4. Проследите доменные события, интеграции и outbox.
5. Смотрите тесты на поведение, а не только на покрытие.

## Что обычно быстро показывает качество
- Границы между контекстами читаются без комментариев.
- Каждый агрегат владеет небольшой согласованной транзакцией.
- Инфраструктура не протекает в доменную модель.
- Сценарии можно объяснить через язык бизнеса, а не через таблицы.
`, [
          link("Designing a DDD-oriented microservice - .NET", "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice"),
          link("Common web application architectures - .NET", "https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/common-web-application-architectures"),
          link("On .NET Live - Clean Architecture, Vertical Slices, and Modular Monoliths (Oh My!)", "https://learn.microsoft.com/en-us/shows/on-dotnet/on-dotnet-live-clean-architecture-vertical-slices-and-modular-monoliths-oh-my")
        ])
    ]
  },  {
    id: "patterns", title: "Паттерны проектирования", icon: "&#9873;", color: "amber",
    rows: [
            topic("Порождающие (Creational)", `![Схема порождающих паттернов](/assets/diagrams/patterns/creational.svg)

## Что это
Порождающие паттерны отделяют *что* нужно создать от *как* именно это собрать. Это полезно, когда простой \`new\` уже не передаёт всю историю: есть выбор реализации, пошаговая сборка, сложная инициализация или необходимость контролировать жизненный цикл объекта.

## Когда они действительно помогают
- Когда у одного и того же интерфейса есть несколько реализаций, а решение зависит от конфигурации, окружения или типа сценария.
- Когда объект должен собираться по шагам и валидация на каждом шаге важнее одного длинного конструктора.
- Когда создание дорогое, а результат можно повторно использовать или клонировать.

## Что обычно сюда относят
Factory Method и Abstract Factory помогают скрыть конкретный класс. Builder делает создание пошаговым. Prototype полезен, когда дешевле копировать уже подготовленный объект, чем собирать его заново. Singleton, если он вообще нужен, стоит держать как редкий исключительный случай, а не как стиль по умолчанию.

## Практический ориентир
Если клиенту приходится знать слишком много о том, *какой* класс создать и *как* его правильно собрать, это хороший сигнал присмотреться к порождающему паттерну. Хороший результат здесь - код, в котором создание живет рядом с политикой приложения, а не размазано по \`switch\` и \`if\` по всей базе.

## Что запомнить
- Порождающий паттерн упрощает не объект, а место, где он рождается.
- Чем больше вариантов и условий вокруг создания, тем полезнее абстракция.
- Если вариантов один-два и они почти не меняются, лишняя фабрика только усложнит код.`, [
          link("Refactoring Guru — Creational patterns", "https://refactoring.guru/design-patterns/creational-patterns"),
          link("Refactoring Guru — Design patterns catalog", "https://refactoring.guru/design-patterns/catalog"),
          link("O'Reilly — Design Patterns: Elements of Reusable Object-Oriented Software", "https://www.oreilly.com/library/view/design-patterns-elements/0201633612/")
        ]),
            topic("Структурные (Structural)", `![Схема структурных паттернов](/assets/diagrams/patterns/structural.svg)

## Что это
Структурные паттерны не изобретают новые смыслы, а собирают уже существующие классы и интерфейсы в более удобную форму. Их сила в том, что они меняют *отношения* между объектами: прячут сложность, добавляют поведение, адаптируют внешний контракт или собирают дерево из частей.

## Где они особенно полезны
- Когда есть чужой API или legacy-класс, который неудобно использовать напрямую.
- Когда поведение нужно добавлять без переписывания исходного класса.
- Когда сложная система должна выглядеть для клиента как один простой вход.

## Что обычно сюда относят
Adapter спасает от несовместимых интерфейсов. Decorator добавляет поведение слоями. Facade прячет сложный подсистемный ландшафт. Composite даёт работать с деревом как с одним объектом. Bridge разрывает жёсткую связь между абстракцией и реализацией. Proxy ставит управляемую прослойку перед объектом.

## Практический ориентир
Если ты ловишь себя на том, что переписываешь один и тот же код обвязки вокруг разных классов, или пытаешься прикрутить поведение к уже живому типу, структурный паттерн часто оказывается дешевле, чем очередной рефакторинг на месте. Он особенно хорош там, где важны совместимость, оборачиваемость и аккуратные границы.

## Что запомнить
- Структурные паттерны обычно уменьшают связанность.
- Они полезны там, где композиция выигрывает у наследования.
- Лучший признак - когда код уже существует, а не когда ты проектируешь всё с нуля.`, [
          link("Refactoring Guru — Structural patterns", "https://refactoring.guru/design-patterns/structural-patterns"),
          link("Refactoring Guru — Design patterns catalog", "https://refactoring.guru/design-patterns/catalog"),
          link("O'Reilly — Design Patterns: Elements of Reusable Object-Oriented Software", "https://www.oreilly.com/library/view/design-patterns-elements/0201633612/")
        ]),
            topic("Поведенческие (Behavioral)", `![Схема поведенческих паттернов](/assets/diagrams/patterns/behavioral.svg)

## Что это
Поведенческие паттерны описывают, как объекты взаимодействуют во времени: кто выбирает алгоритм, кто отправляет команду, кто реагирует на событие, кто меняет состояние и кто координирует поток действий.

## Когда они нужны
- Когда длинный \`if/switch\` начинает определять поведение всей системы.
- Когда один и тот же сценарий должен исполняться разными способами в зависимости от данных или окружения.
- Когда код разрастается из-за сигналов, callbacks, очередей или событий.

## Что обычно сюда относят
Strategy выносит выбор алгоритма наружу. Command превращает действие в объект. Observer связывает источник события с подписчиками. State прячет переключение состояний внутри доменной модели. Chain of Responsibility хорошо ложится на последовательные проверки. Mediator убирает прямую сетку связей между объектами.

## Практический ориентир
Поведенческий паттерн особенно полезен, когда важен не только результат, но и *маршрут выполнения*. Если алгоритм меняется чаще, чем сам домен, или если объекты слишком много знают друг о друге, это знак искать более явную форму коммуникации. Тут выигрывает код, в котором решение видно сразу, а не расползлось по ветвям условной логики.

## Что запомнить
- Поведенческие паттерны делают взаимодействие более явным и тестируемым.
- Они помогают вынести изменение поведения из \`if/switch\` в отдельные роли.
- Если поведение одно и не меняется, паттерн обычно лишний.`, [
          link("Refactoring Guru — Behavioral patterns", "https://refactoring.guru/design-patterns/behavioral-patterns"),
          link("Refactoring Guru — Design patterns catalog", "https://refactoring.guru/design-patterns/catalog"),
          link("O'Reilly — Design Patterns: Elements of Reusable Object-Oriented Software", "https://www.oreilly.com/library/view/design-patterns-elements/0201633612/")
        ]),
            topic("Правила применения", `![Когда паттерн оправдан](/assets/diagrams/patterns/rules.svg)

## Что это
Паттерн нужен не потому, что он *известный*, а потому что он снижает стоимость изменений. Если у задачи нет повторяемости, вариативности или реальной боли, лишняя абстракция быстро становится балластом.

## Хорошие сигналы
- Есть несколько похожих сценариев, которые различаются одной осью поведения.
- Уже появился дублирующийся код вокруг создания, композиции или выбора алгоритма.
- Тестировать или расширять текущий код становится ощутимо дороже.

## Плохие сигналы
- Вариант пока один, и он вряд ли изменится.
- Паттерн вводится ради “архитектурной правильности”, а не ради конкретной боли.
- Абстракция появляется раньше фактов и заставляет читать лишние слои без выигрыша.

## Практическое правило
Сначала назови повторяемую проблему, потом покажи, где именно будет точка расширения, и только после этого вводи паттерн. Если ты не можешь объяснить, какую будущую вариативность он защищает, скорее всего, его ещё рано добавлять.

## Что запомнить
- Паттерн - это инструмент управления изменением, а не украшение кода.
- Самая частая ошибка - абстракция без доказанной повторяемости.
- Лучше простой код сегодня, чем сложный “на вырост” без реальной нагрузки.`, [
          link("Refactoring Guru — Design patterns catalog", "https://refactoring.guru/design-patterns/catalog"),
          link("Refactoring Guru — Design patterns", "https://refactoring.guru/design-patterns"),
          link("O'Reilly — Design Patterns: Elements of Reusable Object-Oriented Software", "https://www.oreilly.com/library/view/design-patterns-elements/0201633612/")
        ])
    ]
  },  {
    id: "ddd", title: "DDD (Domain-Driven Design)", icon: "&#9673;", color: "violet",
    rows: [
            topic("Aggregate Root", `# DDD Aggregate Root в C# .NET — описание и примеры

## Введение

В Domain-Driven Design агрегат — это кластер связанных сущностей и value object'ов, которые должны изменяться как единое целое. Внешний мир работает не с любой внутренней сущностью агрегата, а только через **Aggregate Root**.

Aggregate Root решает сразу несколько задач:

* задаёт **границу консистентности**;
* защищает **инварианты** доменной модели;
* определяет единственную допустимую точку изменения состояния агрегата;
* является естественным местом для генерации **domain events**.

На практике это означает простое правило:

> Снаружи агрегата нельзя напрямую менять его внутренние сущности. Все изменения проходят через методы Aggregate Root.

![Граница агрегата](/assets/diagrams/ddd/aggregate-boundary.svg)

---

## Когда нужен Aggregate Root

Aggregate Root нужен, когда:

* у объекта есть важные бизнес-правила;
* состояние должно меняться только по контролируемым сценариям;
* несколько вложенных сущностей должны быть согласованы между собой;
* нужно публиковать domain events после бизнес-изменений;
* необходимо явно отделить доменную модель от application/service слоя.

Если объект — просто DTO или таблица без поведения, полноценный агрегат обычно не нужен.

---

## Что обычно входит в базовый класс AggregateRoot

Базовый класс \`AggregateRoot\` чаще всего содержит:

1. **Идентификатор** агрегата.
2. **Коллекцию domain events**.
3. Методы для:

   * добавления domain events;
   * чтения накопленных events;
   * очистки events после сохранения.
4. Иногда:

   * версию для optimistic concurrency;
   * общие проверки;
   * базовую инфраструктурную логику.

Важно: базовый класс не должен превращаться в «свалку» общего кода. В него стоит помещать только то, что действительно относится ко всем агрегатам.

---

## Базовые строительные блоки

### Domain Event

Domain Event описывает уже случившийся факт в домене.

Примеры:

* \`OrderCreatedDomainEvent\`
* \`OrderItemAddedDomainEvent\`
* \`OrderSubmittedDomainEvent\`

Событие не должно описывать команду вроде «создай заказ». Оно должно описывать факт: «заказ создан».

### Domain Exception

Domain Exception используется, когда нарушаются инварианты доменной модели.

Примеры:

* нельзя добавить товар с отрицательным количеством;
* нельзя подтвердить уже отменённый заказ;
* нельзя изменить закрытый агрегат.

### Entity и Value Object

Внутри агрегата могут находиться:

* **Entity** — объект с идентичностью;
* **Value Object** — объект без собственной идентичности, определяемый значением.

Aggregate Root управляет ими и не позволяет внешнему коду ломать инварианты.

---

# Пример базовой доменной инфраструктуры

## Интерфейс доменного события

\`\`\`csharp
namespace Demo.Domain.Abstractions;

public interface IDomainEvent
{
    DateTime OccurredOnUtc { get; }
}
\`\`\`

## Базовое исключение домена

\`\`\`csharp
namespace Demo.Domain.Abstractions;

public class DomainException : Exception
{
    public DomainException(string message) : base(message)
    {
    }
}
\`\`\`

## Базовый класс Entity

\`\`\`csharp
namespace Demo.Domain.Abstractions;

public abstract class Entity<TId>
    where TId : notnull
{
    public TId Id { get; protected set; } = default!;
}
\`\`\`

## Базовый класс AggregateRoot

\`\`\`csharp
using System.Collections.ObjectModel;

namespace Demo.Domain.Abstractions;

public abstract class AggregateRoot<TId> : Entity<TId>
    where TId : notnull
{
    private readonly List<IDomainEvent> _domainEvents = [];

    public ReadOnlyCollection<IDomainEvent> DomainEvents => _domainEvents.AsReadOnly();

    protected void RaiseDomainEvent(IDomainEvent domainEvent)
    {
        _domainEvents.Add(domainEvent);
    }

    public void ClearDomainEvents()
    {
        _domainEvents.Clear();
    }
}
\`\`\`

### Почему этого достаточно

Этот базовый класс делает главное:

* агрегат умеет накапливать domain events;
* application/infrastructure слой может прочитать их после изменения агрегата;
* после сохранения events можно очистить.

Это минималистичный и практичный вариант.

---

# Пример агрегата: Order

Рассмотрим агрегат заказа.

Бизнес-правила:

* заказ можно создать только с валидным клиентом;
* товар можно добавить только с положительным количеством;
* нельзя менять уже отправленный или отменённый заказ;
* нельзя отправить пустой заказ.

## Value Object: CustomerId

\`\`\`csharp
namespace Demo.Domain.Orders;

public readonly record struct CustomerId(Guid Value)
{
    public static CustomerId New() => new(Guid.NewGuid());

    public override string ToString() => Value.ToString();
}
\`\`\`

## Value Object: ProductId

\`\`\`csharp
namespace Demo.Domain.Orders;

public readonly record struct ProductId(Guid Value)
{
    public static ProductId New() => new(Guid.NewGuid());

    public override string ToString() => Value.ToString();
}
\`\`\`

## Идентификатор заказа

\`\`\`csharp
namespace Demo.Domain.Orders;

public readonly record struct OrderId(Guid Value)
{
    public static OrderId New() => new(Guid.NewGuid());

    public override string ToString() => Value.ToString();
}
\`\`\`

## Статус заказа

\`\`\`csharp
namespace Demo.Domain.Orders;

public enum OrderStatus
{
    Draft = 0,
    Submitted = 1,
    Cancelled = 2
}
\`\`\`

## Внутренняя entity: OrderItem

\`\`\`csharp
using Demo.Domain.Abstractions;

namespace Demo.Domain.Orders;

public sealed class OrderItem : Entity<Guid>
{
    public ProductId ProductId { get; private set; }
    public string ProductName { get; private set; }
    public decimal UnitPrice { get; private set; }
    public int Quantity { get; private set; }

    public decimal TotalPrice => UnitPrice * Quantity;

    private OrderItem()
    {
    }

    internal OrderItem(ProductId productId, string productName, decimal unitPrice, int quantity)
    {
        if (string.IsNullOrWhiteSpace(productName))
            throw new DomainException("Product name cannot be empty.");

        if (unitPrice <= 0)
            throw new DomainException("Unit price must be greater than zero.");

        if (quantity <= 0)
            throw new DomainException("Quantity must be greater than zero.");

        Id = Guid.NewGuid();
        ProductId = productId;
        ProductName = productName;
        UnitPrice = unitPrice;
        Quantity = quantity;
    }

    internal void IncreaseQuantity(int quantity)
    {
        if (quantity <= 0)
            throw new DomainException("Quantity increment must be greater than zero.");

        Quantity += quantity;
    }

    internal void ChangeQuantity(int quantity)
    {
        if (quantity <= 0)
            throw new DomainException("Quantity must be greater than zero.");

        Quantity = quantity;
    }
}
\`\`\`

Обрати внимание на \`internal\` методы. Это хороший способ показать, что внутреннюю entity нельзя свободно менять извне. Управление идёт через root.

---

## Domain Events заказа

\`\`\`csharp
using Demo.Domain.Abstractions;

namespace Demo.Domain.Orders.Events;

public sealed record OrderCreatedDomainEvent(
    OrderId OrderId,
    CustomerId CustomerId,
    DateTime OccurredOnUtc) : IDomainEvent;

public sealed record OrderItemAddedDomainEvent(
    OrderId OrderId,
    ProductId ProductId,
    int Quantity,
    DateTime OccurredOnUtc) : IDomainEvent;

public sealed record OrderSubmittedDomainEvent(
    OrderId OrderId,
    decimal TotalAmount,
    DateTime OccurredOnUtc) : IDomainEvent;

public sealed record OrderCancelledDomainEvent(
    OrderId OrderId,
    string Reason,
    DateTime OccurredOnUtc) : IDomainEvent;
\`\`\`

## Aggregate Root: Order

\`\`\`csharp
using Demo.Domain.Abstractions;
using Demo.Domain.Orders.Events;

namespace Demo.Domain.Orders;

public sealed class Order : AggregateRoot<OrderId>
{
    private readonly List<OrderItem> _items = [];

    public CustomerId CustomerId { get; private set; }
    public OrderStatus Status { get; private set; }
    public DateTime CreatedAtUtc { get; private set; }
    public DateTime? SubmittedAtUtc { get; private set; }
    public IReadOnlyCollection<OrderItem> Items => _items.AsReadOnly();
    public decimal TotalAmount => _items.Sum(x => x.TotalPrice);

    private Order()
    {
    }

    private Order(OrderId id, CustomerId customerId)
    {
        if (customerId == default)
            throw new DomainException("CustomerId is required.");

        Id = id;
        CustomerId = customerId;
        Status = OrderStatus.Draft;
        CreatedAtUtc = DateTime.UtcNow;

        RaiseDomainEvent(new OrderCreatedDomainEvent(
            Id,
            CustomerId,
            DateTime.UtcNow));
    }

    public static Order Create(CustomerId customerId)
    {
        return new Order(OrderId.New(), customerId);
    }

    public void AddItem(ProductId productId, string productName, decimal unitPrice, int quantity)
    {
        EnsureCanBeModified();

        if (productId == default)
            throw new DomainException("ProductId is required.");

        var existingItem = _items.FirstOrDefault(x => x.ProductId == productId);

        if (existingItem is null)
        {
            var item = new OrderItem(productId, productName, unitPrice, quantity);
            _items.Add(item);
        }
        else
        {
            existingItem.IncreaseQuantity(quantity);
        }

        RaiseDomainEvent(new OrderItemAddedDomainEvent(
            Id,
            productId,
            quantity,
            DateTime.UtcNow));
    }

    public void ChangeItemQuantity(ProductId productId, int quantity)
    {
        EnsureCanBeModified();

        var item = _items.FirstOrDefault(x => x.ProductId == productId)
            ?? throw new DomainException("Order item was not found.");

        item.ChangeQuantity(quantity);
    }

    public void RemoveItem(ProductId productId)
    {
        EnsureCanBeModified();

        var item = _items.FirstOrDefault(x => x.ProductId == productId)
            ?? throw new DomainException("Order item was not found.");

        _items.Remove(item);
    }

    public void Submit()
    {
        EnsureCanBeModified();

        if (_items.Count == 0)
            throw new DomainException("Order cannot be submitted without items.");

        Status = OrderStatus.Submitted;
        SubmittedAtUtc = DateTime.UtcNow;

        RaiseDomainEvent(new OrderSubmittedDomainEvent(
            Id,
            TotalAmount,
            DateTime.UtcNow));
    }

    public void Cancel(string reason)
    {
        if (Status == OrderStatus.Cancelled)
            throw new DomainException("Order is already cancelled.");

        if (Status == OrderStatus.Submitted)
            throw new DomainException("Submitted order cannot be cancelled in this business flow.");

        if (string.IsNullOrWhiteSpace(reason))
            throw new DomainException("Cancellation reason is required.");

        Status = OrderStatus.Cancelled;

        RaiseDomainEvent(new OrderCancelledDomainEvent(
            Id,
            reason,
            DateTime.UtcNow));
    }

    private void EnsureCanBeModified()
    {
        if (Status == OrderStatus.Submitted)
            throw new DomainException("Submitted order cannot be modified.");

        if (Status == OrderStatus.Cancelled)
            throw new DomainException("Cancelled order cannot be modified.");
    }
}
\`\`\`

![Поток domain event](/assets/diagrams/ddd/domain-event-flow.svg)

---

# Что здесь важно архитектурно

## 1. Создание агрегата через фабричный метод

\`\`\`csharp
var order = Order.Create(customerId);
\`\`\`

Почему не публичный конструктор:

* можно централизовать инварианты создания;
* можно сразу поднять \`OrderCreatedDomainEvent\`;
* код становится выразительнее.

## 2. Изменение агрегата только через методы root

\`\`\`csharp
order.AddItem(productId, "Keyboard", 120m, 2);
order.Submit();
\`\`\`

Внешний код не делает так:

\`\`\`csharp
order.Items.Add(...); // так делать нельзя
\`\`\`

Именно в этом и смысл Aggregate Root.

## 3. Инварианты находятся внутри домена

Нельзя полагаться только на проверки в контроллере, хендлере или UI. Даже если application слой что-то забыл проверить, агрегат должен защитить себя сам.

## 4. Domain events рождаются в момент доменного изменения

Это важно, потому что событие должно появляться не в application service «по договорённости», а как следствие реального изменения доменного состояния.

---

# Пример использования в CQRS

Ниже — минимальный application слой. Он не содержит бизнес-правил заказа, а только orchestrates сценарий.

![Application service](/assets/diagrams/ddd/application-service.svg)

## Команда создания заказа

\`\`\`csharp
namespace Demo.Application.Orders.CreateOrder;

public sealed record CreateOrderCommand(Guid CustomerId) : IRequest<Guid>;
\`\`\`

## Команда добавления товара

\`\`\`csharp
namespace Demo.Application.Orders.AddOrderItem;

public sealed record AddOrderItemCommand(
    Guid OrderId,
    Guid ProductId,
    string ProductName,
    decimal UnitPrice,
    int Quantity) : IRequest;
\`\`\`

## Команда отправки заказа

\`\`\`csharp
namespace Demo.Application.Orders.SubmitOrder;

public sealed record SubmitOrderCommand(Guid OrderId) : IRequest;
\`\`\`

---

## Репозиторий агрегата

\`\`\`csharp
using Demo.Domain.Orders;

namespace Demo.Application.Abstractions;

public interface IOrderRepository
{
    Task AddAsync(Order order, CancellationToken cancellationToken = default);
    Task<Order?> GetByIdAsync(OrderId orderId, CancellationToken cancellationToken = default);
}
\`\`\`

## Unit of Work

\`\`\`csharp
namespace Demo.Application.Abstractions;

public interface IUnitOfWork
{
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
\`\`\`

---

## Handler: CreateOrder

\`\`\`csharp
using Demo.Application.Abstractions;
using Demo.Domain.Orders;
using MediatR;

namespace Demo.Application.Orders.CreateOrder;

public sealed class CreateOrderCommandHandler : IRequestHandler<CreateOrderCommand, Guid>
{
    private readonly IOrderRepository _orderRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateOrderCommandHandler(
        IOrderRepository orderRepository,
        IUnitOfWork unitOfWork)
    {
        _orderRepository = orderRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
    {
        var order = Order.Create(new CustomerId(request.CustomerId));

        await _orderRepository.AddAsync(order, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return order.Id.Value;
    }
}
\`\`\`

## Handler: AddOrderItem

\`\`\`csharp
using Demo.Application.Abstractions;
using Demo.Domain.Abstractions;
using Demo.Domain.Orders;
using MediatR;

namespace Demo.Application.Orders.AddOrderItem;

public sealed class AddOrderItemCommandHandler : IRequestHandler<AddOrderItemCommand>
{
    private readonly IOrderRepository _orderRepository;
    private readonly IUnitOfWork _unitOfWork;

    public AddOrderItemCommandHandler(
        IOrderRepository orderRepository,
        IUnitOfWork unitOfWork)
    {
        _orderRepository = orderRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(AddOrderItemCommand request, CancellationToken cancellationToken)
    {
        var order = await _orderRepository.GetByIdAsync(new OrderId(request.OrderId), cancellationToken)
            ?? throw new DomainException("Order was not found.");

        order.AddItem(
            new ProductId(request.ProductId),
            request.ProductName,
            request.UnitPrice,
            request.Quantity);

        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
\`\`\`

## Handler: SubmitOrder

\`\`\`csharp
using Demo.Application.Abstractions;
using Demo.Domain.Abstractions;
using Demo.Domain.Orders;
using MediatR;

namespace Demo.Application.Orders.SubmitOrder;

public sealed class SubmitOrderCommandHandler : IRequestHandler<SubmitOrderCommand>
{
    private readonly IOrderRepository _orderRepository;
    private readonly IUnitOfWork _unitOfWork;

    public SubmitOrderCommandHandler(
        IOrderRepository orderRepository,
        IUnitOfWork unitOfWork)
    {
        _orderRepository = orderRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(SubmitOrderCommand request, CancellationToken cancellationToken)
    {
        var order = await _orderRepository.GetByIdAsync(new OrderId(request.OrderId), cancellationToken)
            ?? throw new DomainException("Order was not found.");

        order.Submit();

        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
\`\`\`

---

# Почему CQRS здесь полезен

CQRS хорошо сочетается с агрегатами, потому что:

* **Command side** работает с богатой доменной моделью;
* бизнес-логика живёт в агрегатах, а не в хендлерах;
* хендлеры остаются тонкими;
* **Query side** можно строить отдельно, без протаскивания всей доменной модели.

Идея такая:

* команда вызывает aggregate root;
* aggregate root проверяет инварианты и меняет состояние;
* aggregate root поднимает domain events;
* unit of work сохраняет изменения;
* infrastructure публикует события или складывает их в outbox.

![Границы транзакций](/assets/diagrams/ddd/transaction-boundaries.svg)

---

# Где место domain events в реальной архитектуре

Обычно процесс выглядит так:

1. Application handler загружает агрегат.
2. Вызывает доменный метод.
3. Агрегат меняет состояние и добавляет \`DomainEvents\`.
4. \`UnitOfWork\` сохраняет агрегат.
5. После этого infrastructure:

   * либо публикует events in-process;
   * либо сохраняет их в outbox;
   * либо делает оба шага через надёжный механизм.

То есть Aggregate Root **не отправляет сообщения в брокер сам**. Он только фиксирует доменные факты.

![Поток domain event](/assets/diagrams/ddd/domain-event-flow.svg)

---

# Пример возможного dispatcher после сохранения

Это уже не домен, а инфраструктурный код.

\`\`\`csharp
using Demo.Domain.Abstractions;
using MediatR;

namespace Demo.Infrastructure.Persistence;

public sealed class DomainEventsDispatcher
{
    private readonly IPublisher _publisher;

    public DomainEventsDispatcher(IPublisher publisher)
    {
        _publisher = publisher;
    }

    public async Task DispatchAsync(
        IEnumerable<AggregateRoot<object>> aggregates,
        CancellationToken cancellationToken = default)
    {
        var domainEvents = aggregates
            .SelectMany(x => x.DomainEvents)
            .ToList();

        foreach (var aggregate in aggregates)
        {
            aggregate.ClearDomainEvents();
        }

        foreach (var domainEvent in domainEvents)
        {
            await _publisher.Publish(domainEvent, cancellationToken);
        }
    }
}
\`\`\`

В реальном проекте такой код обычно делают аккуратнее: с единым базовым интерфейсом для агрегатов, с outbox, с транзакционной согласованностью.

---

# Частые ошибки при проектировании Aggregate Root

## 1. Анемичная модель

Плохо:

\`\`\`csharp
order.Status = OrderStatus.Submitted;
\`\`\`

Хорошо:

\`\`\`csharp
order.Submit();
\`\`\`

Когда состояние меняется напрямую, домен перестаёт защищать свои правила.

## 2. Слишком большой агрегат

Если один aggregate root начинает содержать слишком много сущностей и сценариев, любая операция становится тяжёлой, а конкуренция за изменение данных — дорогой.

Признаки проблемы:

* агрегат грузится с огромным графом данных;
* почти каждое действие блокирует всё подряд;
* сложно понять границы инвариантов.

## 3. Domain events создаются в application layer

Плохо:

\`\`\`csharp
order.Submit();
publisher.Publish(new OrderSubmittedDomainEvent(...));
\`\`\`

Тогда событие легко забыть. Лучше, чтобы агрегат сам фиксировал этот факт.

## 4. Репозиторий возвращает внутренние сущности агрегата отдельно

Например, \`OrderItemRepository\` рядом с \`OrderRepository\` часто ломает границы агрегата. Если \`OrderItem\` принадлежит агрегату \`Order\`, доступ к нему должен идти через \`Order\`.

## 5. Публичные set-теры

Плохо:

\`\`\`csharp
public OrderStatus Status { get; set; }
\`\`\`

Хорошо:

\`\`\`csharp
public OrderStatus Status { get; private set; }
\`\`\`

И изменение — только через доменные методы.

---

# Практические рекомендации

## Когда использовать базовый AggregateRoot

Используй базовый класс, если почти у всех агрегатов есть:

* \`Id\`;
* \`DomainEvents\`;
* общий механизм \`RaiseDomainEvent\`.

Если общности нет, можно использовать интерфейсы и композицию.

## Как именовать методы агрегата

Методы должны отражать бизнес-действия:

* \`Submit()\`
* \`Cancel(reason)\`
* \`AddItem(...)\`
* \`Approve()\`
* \`Complete()\`

Лучше избегать технических названий вроде:

* \`UpdateStatus()\`
* \`SetState()\`
* \`Process()\`

## Где делать валидацию

* **Формат и transport validation** — во входном слое.
* **Бизнес-инварианты** — внутри доменной модели.

Например:

* проверить, что \`Quantity\` пришёл как число — это не домен;
* проверить, что \`Quantity > 0\` для заказа — уже домен.

---

# Ещё один короткий пример: BankAccount Aggregate Root

Иногда на простом примере идея видна ещё лучше.

\`\`\`csharp
using Demo.Domain.Abstractions;

namespace Demo.Domain.BankAccounts;

public sealed class BankAccount : AggregateRoot<Guid>
{
    public string Number { get; private set; } = string.Empty;
    public decimal Balance { get; private set; }
    public bool IsClosed { get; private set; }

    private BankAccount()
    {
    }

    private BankAccount(string number)
    {
        if (string.IsNullOrWhiteSpace(number))
            throw new DomainException("Account number is required.");

        Id = Guid.NewGuid();
        Number = number;
        Balance = 0m;
        IsClosed = false;
    }

    public static BankAccount Open(string number)
    {
        return new BankAccount(number);
    }

    public void Deposit(decimal amount)
    {
        EnsureNotClosed();

        if (amount <= 0)
            throw new DomainException("Deposit amount must be greater than zero.");

        Balance += amount;
    }

    public void Withdraw(decimal amount)
    {
        EnsureNotClosed();

        if (amount <= 0)
            throw new DomainException("Withdraw amount must be greater than zero.");

        if (Balance < amount)
            throw new DomainException("Insufficient funds.");

        Balance -= amount;
    }

    public void Close()
    {
        EnsureNotClosed();

        if (Balance != 0)
            throw new DomainException("Account with non-zero balance cannot be closed.");

        IsClosed = true;
    }

    private void EnsureNotClosed()
    {
        if (IsClosed)
            throw new DomainException("Closed account cannot be modified.");
    }
}
\`\`\`

Здесь отлично видно, что Aggregate Root — это не просто контейнер данных, а объект поведения.

---

# Итого

\`AggregateRoot\` в DDD — это центральная точка управления консистентностью агрегата. Его задача — не просто хранить \`Id\`, а:

* защищать инварианты;
* управлять внутренними сущностями;
* задавать допустимые бизнес-операции;
* поднимать domain events;
* не позволять внешнему коду менять состояние в обход доменных правил.

Хороший Aggregate Root обычно имеет такие признаки:

* небольшой, но выразительный публичный API;
* \`private set\` и инкапсулированные коллекции;
* явные бизнес-методы;
* проверки инвариантов внутри;
* domain events как отражение случившихся доменных фактов.

В связке с CQRS такой подход даёт чистую архитектуру:

* commands меняют состояние через aggregate root;
* queries читают отдельно;
* application layer координирует сценарий;
* домен хранит бизнес-правила;
* infrastructure сохраняет и публикует события.`, [
          link("Martin Fowler — DDD Aggregate", "https://martinfowler.com/bliki/DDD_Aggregate.html"),
          link("Microsoft Learn — microservice domain model", "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/net-core-microservice-domain-model"),
          link("Microsoft Learn — domain model validations", "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/domain-model-layer-validations"),
          link("Microsoft Learn — domain events design and implementation", "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/domain-events-design-implementation")
        ]),
            topic("Entity", `## Что это
Entity — объект с устойчивой identity. Поля могут меняться, но объект остаётся тем же, пока не изменился \`Id\`.

![Entity и Value Object](/assets/diagrams/ddd/entity-vs-value-object.svg)

## Практика
- Равенство entity обычно строится на \`Id\`, а не на всех полях.
- У entity должны быть методы, которые проводят изменения через правила.
- Если объект нужен только как значение, лучше сделать его Value Object.

## Как читать модель
Entity полезна там, где важны история, жизненный цикл и ссылка на конкретный экземпляр: заказ, пользователь, счёт, договор.`, [
          link("Martin Fowler — Evans Classification", "https://martinfowler.com/bliki/EvansClassification.html"),
          link("Martin Fowler — Domain Driven Design", "https://martinfowler.com/bliki/DomainDrivenDesign.html"),
          link("Microsoft Learn — microservice domain model", "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/net-core-microservice-domain-model")
        ]),
            topic("Value Object", `## Что это
Value Object описывает значение, а не личность. Два объекта с одинаковыми значимыми полями считаются равными; обычно такой объект неизменяемый.

![Entity и Value Object](/assets/diagrams/ddd/entity-vs-value-object.svg)

## Практика
- Создавайте новый объект вместо частичной мутации.
- Делайте сравнение по всем существенным полям.
- Хорошие примеры: \`Money\`, \`Email\`, \`DateRange\`, \`Address\`.

## Почему это удобно
Value Object убирает расплывчатые строки и числа из домена и делает правила явными, особенно когда нужно валидировать формат, валюту или диапазон.`, [
          link("Martin Fowler — Value Object", "https://martinfowler.com/bliki/ValueObject.html"),
          link("Martin Fowler — Value Object in PoEAA", "https://martinfowler.com/eaaCatalog/valueObject.html"),
          link("Microsoft Learn — implement value objects", "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/implement-value-objects")
        ]),
            topic("Repository", `## Что это
Repository — коллекция агрегатов с доменным интерфейсом. Он прячет способ хранения и даёт коду ощущение работы с памятью, а не с БД.

![Поток Repository](/assets/diagrams/ddd/repository-flow.svg)

## Практика
- Определяйте repository на уровне aggregate root.
- Не тащите наружу SQL, \`Include\`, \`DbContext\` и другие детали маппинга.
- Пусть repository возвращает доменные объекты или спецификации, а не таблицы.

## На что смотреть
Если repository начинает выглядеть как универсальный CRUD-сервис для всего подряд, граница домена уже размывается.`, [
          link("Martin Fowler — Repository", "https://martinfowler.com/eaaCatalog/repository.html"),
          link("Microsoft Learn — persistence layer design", "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/infrastructure-persistence-layer-design"),
          link("Microsoft Learn — EF Core persistence layer", "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/infrastructure-persistence-layer-implementation-entity-framework-core")
        ]),
            topic("Domain Service", `## Что это
Domain Service нужен для доменной операции, у которой нет естественного владельца среди entity или value object. Это должна быть именно бизнес-операция, а не просто удобная функция.

![Domain service](/assets/diagrams/ddd/domain-service.svg)

## Практика
- Делайте service stateless.
- Держите в нём правило, а не поток управления use case.
- Хорошие примеры: расчёт цены, маршрутизация, проверка политики перевода между объектами.

## Антипаттерн
Если логика просто потому, что не нашли место для неё, часто лучше вернуть её в entity или value object, чем раздувать слой сервисов.`, [
          link("Martin Fowler — Evans Classification", "https://martinfowler.com/bliki/EvansClassification.html"),
          link("Martin Fowler — Anemic Domain Model", "https://martinfowler.com/bliki/AnemicDomainModel.html"),
          link("Martin Fowler — Service Layer", "https://martinfowler.com/eaaCatalog/serviceLayer.html")
        ]),
            topic("Application Service", `## Что это
Application Service координирует сценарий: загрузить агрегат, вызвать доменные методы, сохранить изменения и отдать результат. Он тонкий и не должен содержать бизнес-правил.

![Application service](/assets/diagrams/ddd/application-service.svg)

## Практика
- Весь оркестратор держите в одном месте: transaction, repo, mapper, integration events.
- Правила и инварианты оставляйте домену.
- Используйте его как слой use case, а не как место для всей логики приложения.

## Хороший признак
Если application service можно читать как сценарий на естественном языке, а не как свалку if/else, он, скорее всего, на месте.`, [
          link("Microsoft Learn — microservice application layer via Web API", "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-application-layer-implementation-web-api"),
          link("Microsoft Learn — DDD-oriented microservice", "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice"),
          link("Martin Fowler — Service Layer", "https://martinfowler.com/eaaCatalog/serviceLayer.html")
        ]),
            topic("Domain Event и реализация", `## Что это
Domain Event — это факт, который уже произошёл в домене: заказ создан, оплата подтверждена, лимит превышен. Он описывает событие, а не команду.

![Поток domain event](/assets/diagrams/ddd/domain-event-flow.svg)

## Практика
- Поднимайте event внутри агрегата, когда меняется важное состояние.
- Обработчики должны реагировать отдельно: письмо, read model, интеграция.
- Не превращайте event в скрытый второй канал для основной бизнес-логики.

## Важное различие
In-process domain event и integration event — не одно и то же. Первый живёт внутри bounded context, второй нужен для общения между контекстами.`, [
          link("Microsoft Learn — domain events design and implementation", "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/domain-events-design-implementation"),
          link("Microsoft Learn — DDD-oriented microservice", "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice"),
          link("Martin Fowler — Domain Driven Design", "https://martinfowler.com/bliki/DomainDrivenDesign.html")
        ]),
            topic("Layers (в контексте DDD)", `## Что это
В DDD слои — это прежде всего направление зависимостей: Presentation -> Application -> Domain, а Infrastructure подключается снаружи и зависит от домена, а не наоборот.

![DDD layers](/assets/diagrams/ddd/ddd-layers.svg)

## Практика
- Домен не должен знать про EF Core, HTTP и фреймворк UI.
- Application слой координирует сценарии и переводит вход в команды.
- Infrastructure реализует репозитории, хранилища и внешние адаптеры.

## Смысл
Слои нужны не ради папок в проекте, а ради ясной зависимости и удобной замены внешних деталей.`, [
          link("Microsoft Learn — DDD-oriented microservice", "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice"),
          link("Martin Fowler — Layering Principles", "https://martinfowler.com/bliki/LayeringPrinciples.html"),
          link("Martin Fowler — Presentation Domain Data Layering", "https://martinfowler.com/bliki/PresentationDomainDataLayering.html")
        ]),
            topic("Границы транзакций агрегатов", `## Что это
Обычно одна транзакция охватывает один aggregate root. Если нужно изменить несколько агрегатов, лучше связывать их через events и eventual consistency, а не склеивать в одну огромную транзакцию.

![Границы транзакций](/assets/diagrams/ddd/transaction-boundaries.svg)

## Практика
- Не расширяйте transaction boundary только потому, что это проще в коде.
- Если доменные правила касаются нескольких агрегатов, подумайте о domain event или process manager.
- Там, где нужна атомарность, задачу, скорее всего, надо пересмотреть на уровне модели.

## Что запомнить
Граница агрегата и граница транзакции почти всегда идут вместе. Если они начинают расходиться, модель пора проверять.`, [
          link("Martin Fowler — DDD Aggregate", "https://martinfowler.com/bliki/DDD_Aggregate.html"),
          link("Microsoft Learn — domain model validations", "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/domain-model-layer-validations"),
          link("Microsoft Learn — domain events design and implementation", "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/domain-events-design-implementation")
        ])
    ]
  },  {
    id: "efcore", title: "EF Core", icon: "&#9107;", color: "blue",
    rows: [
            topic("Миграции", `<img src="/assets/diagrams/efcore/migrations-pipeline.svg" alt="Поток миграций" style="max-width:100%;height:auto;display:block;margin:12px 0;border:1px solid rgba(255,255,255,0.08);border-radius:12px;background:#0b1020" />

Миграции в EF Core - это не просто папка с файлами, а история изменения модели. EF сравнивает текущую модель с последним <code>ModelSnapshot</code>, а база помнит факт применения в <code>__EFMigrationsHistory</code>.

Хорошая последовательность почти всегда одна и та же: сгенерировать миграцию, прочитать код, затем применить ее. Для production лучше сначала получить SQL-скрипт или bundle, чтобы увидеть DDL до запуска.

- snapshot отвечает за diff
- history table отвечает за уже примененные миграции
- отдельный шаг применения делает схему безопаснее
`, [
          link("Migrations overview", "https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/"),
          link("Applying migrations", "https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/applying"),
          link("Custom migrations history table", "https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/history-table")
        ]),
            topic("Миграции как сырой SQL", `Иногда встроенных операций EF Core недостаточно: нужно перенести данные между колонками, создать view, trigger, stored procedure или выполнить пакет, который EF не умеет выразить напрямую.

Тогда на сцену выходит <code>migrationBuilder.Sql()</code>. Он хорош для маленьких, явных и проверяемых вставок SQL внутри миграции. Если конкретная операция не может жить внутри транзакции, EF позволяет отключить транзакционную обертку через <code>suppressTransaction: true</code>.

Главное правило здесь простое: raw SQL должен оставаться точечным инструментом, а не способом переписать всю миграцию вручную.
`, [
          link("Custom migrations operations", "https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/operations"),
          link("Managing migrations", "https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/managing")
        ]),
            topic("Скрипты CI", `Для CI/CD миграции лучше превращать в SQL-скрипт, а не применять напрямую с машины разработчика. Так проверка и выкладка разделяются: скрипт можно просмотреть, прогнать в pipeline, передать DBA и архивировать отдельно.

Именно поэтому EF Core рекомендует генерировать script в production-процессе и, когда состояние баз может отличаться, делать его идемпотентным. Это особенно полезно, если у вас несколько окружений или часть миграций уже была применена вручную.

Типовой набор выглядит так: создать script, проверить его на staging, и только потом запускать в production.`, [
          link("Applying migrations", "https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/applying"),
          link("Managing migrations", "https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/managing"),
          link("Custom migrations history table", "https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/history-table")
        ]),
            topic("CRUD + транзакции", `По умолчанию EF Core уже делает многое за вас: один вызов <code>SaveChanges()</code> выполняется в транзакции, и если что-то падает, база не остается в полусостоянии.

Явная транзакция нужна, когда несколько операций должны быть атомарны вместе: два <code>SaveChanges()</code>, плюс чтение, плюс raw SQL, плюс дополнительная проверка. В этом случае вы управляете границей вручную через <code>Database.BeginTransactionAsync()</code>.

Важная оговорка: явные транзакции плохо сочетаются с retrying execution strategies, поэтому такие сценарии стоит тестировать на реальном провайдере.
`, [
          link("Transactions", "https://learn.microsoft.com/en-us/ef/core/saving/transactions"),
          link("DbContext lifetime and configuration", "https://learn.microsoft.com/en-us/ef/core/dbcontext-configuration/")
        ]),
            topic("Модели отношений", `<img src="/assets/diagrams/efcore/relationships-map.svg" alt="Карта отношений" style="max-width:100%;height:auto;display:block;margin:12px 0;border:1px solid rgba(255,255,255,0.08);border-radius:12px;background:#0b1020" />

Отношения в EF Core строятся вокруг foreign key: один конец является principal, другой - dependent. В модели это выражается через навигации, <code>HasForeignKey</code> и при необходимости <code>HasPrincipalKey</code>.

Практически это означает три вещи: кардинальность задает форму связи, FK держит ссылку, а навигация делает граф удобным для кода. Многие проблемы с отношениями исчезают, когда эти три слоя не смешиваются между собой.

Для DDD-мышления полезно помнить: отношение принадлежит модели, а не только таблице. Хорошая настройка отношений помогает и в запросах, и в инвариантах агрегата.
`, [
          link("Relationships overview", "https://learn.microsoft.com/en-us/ef/core/modeling/relationships"),
          link("Foreign and principal keys in relationships", "https://learn.microsoft.com/en-us/ef/core/modeling/relationships/foreign-and-principal-keys"),
          link("Relationship navigations", "https://learn.microsoft.com/en-us/ef/core/modeling/relationships/navigations")
        ]),
            topic("Варианты хранения подсущности", `<img src="/assets/diagrams/efcore/owned-types-storage.svg" alt="Варианты хранения owned type" style="max-width:100%;height:auto;display:block;margin:12px 0;border:1px solid rgba(255,255,255,0.08);border-radius:12px;background:#0b1020" />

Подсущность или value object можно хранить по-разному: в той же таблице, в отдельной таблице или, в современных версиях EF Core, даже в JSON-колонке. Базовое поведение для owned types - table splitting, то есть данные владельца и owned-объекта живут в одной таблице.

Отдельная таблица нужна, когда у части модели появляется свой жизненный цикл, свои ограничения или она слишком разрастается по ширине. JSON-колонка хорошо подходит там, где структура часто меняется и при этом остается логически вложенной.

Хорошее правило выбора: если у объекта нет самостоятельной идентичности и он не должен жить отдельно от владельца, начинайте с owned type.
`, [
          link("Owned entity types", "https://learn.microsoft.com/en-us/ef/core/modeling/owned-entities"),
          link("What's New in EF Core 7.0", "https://learn.microsoft.com/en-us/ef/core/what-is-new/ef-core-7.0/whatsnew")
        ]),
            topic("Сложные свойства (Value Conversions)", `<img src="/assets/diagrams/efcore/value-conversion-flow.svg" alt="Поток value conversion" style="max-width:100%;height:auto;display:block;margin:12px 0;border:1px solid rgba(255,255,255,0.08);border-radius:12px;background:#0b1020" />

<code>ValueConversion</code> переводит доменный тип в то, что провайдер реально умеет хранить: enum в string, value object в JSON или bytes, специальный идентификатор в число и т.д. EF Core принимает две функции - в базу и обратно - и сам вставляет их в pipeline чтения/записи.

Но есть важная деталь: если тип mutable или хранится как коллекция, почти всегда нужен <code>ValueComparer</code>. Без него EF может неправильно решать, поменялось значение или нет.

Для этой темы полезно держать в голове простую формулу: converter отвечает за форму хранения, comparer - за корректное сравнение в памяти.
`, [
          link("Value conversions", "https://learn.microsoft.com/en-us/ef/core/modeling/value-conversions"),
          link("Value comparers", "https://learn.microsoft.com/en-us/ef/core/modeling/value-comparers"),
          link("Change detection and notifications", "https://learn.microsoft.com/en-us/ef/core/change-tracking/change-detection")
        ]),
            topic("PK: составной ключ", `Составной ключ нужен тогда, когда уникальность естественно описывается несколькими полями вместе: например, <code>State + LicensePlate</code> или ключ join-таблицы.

В EF Core составной ключ задается явно через <code>HasKey(x =&gt; new { ... })</code>. Порядок полей важен, потому что он должен совпасть с порядком ключа в схеме базы.

Хороший ориентир такой: если ключ нужен только для связки и не несет бизнес-смысла, он может быть составным. Если же у сущности есть отдельная идентичность, лучше дать ей простой суррогатный ключ.
`, [
          link("Keys", "https://learn.microsoft.com/en-us/ef/core/modeling/keys"),
          link("Foreign and principal keys in relationships", "https://learn.microsoft.com/en-us/ef/core/modeling/relationships/foreign-and-principal-keys")
        ]),
            topic("Кластерный индекс (MSSQL)", `В SQL Server clustered index определяет физический порядок строк. У таблицы может быть только один clustered index, а primary key по умолчанию обычно получает именно такую реализацию, если вы явно не выбрали другое.

В EF Core SQL Server provider это можно управлять через <code>IsClustered()</code>. Идея здесь не в магии ORM, а в том, что правильный порядок хранения может заметно ускорить чтение, но иногда осложняет запись и перестройку индексов.

Если clustered index приходится ставить не на ключ, а на другой столбец, это нужно делать осознанно: быстрое чтение по этому полю должно перевешивать цену на insert/update.
`, [
          link("SQL Server provider indexes", "https://learn.microsoft.com/en-us/ef/core/providers/sql-server/indexes"),
          link("Create a clustered index - SQL Server", "https://learn.microsoft.com/en-us/sql/relational-databases/indexes/create-clustered-indexes"),
          link("Efficient querying", "https://learn.microsoft.com/en-us/ef/core/performance/efficient-querying")
        ]),
            topic("HiLo генерация ключей", `HiLo стоит понимать как способ раздачи ключей блоками: приложение берет у базы не один номер, а целый диапазон, а потом использует его локально без round-trip на каждый insert. В EF Core документация чаще говорит не про отдельную магическую кнопку, а про sequences и provider value generation - это и есть тот механизм, на котором обычно строится HiLo-подобная схема.

Такой подход особенно полезен, когда новые дочерние объекты должны получить ключ еще до сохранения, а лишние походы в базу нежелательны. На практике это помогает уменьшить задержку и разгрузить БД при массовых insert.

Коротко: если нужна производительная генерация идентификаторов, смотрите в сторону sequence-backed value generation и провайдерных возможностей, а не только в сторону identity columns.
`, [
          link("Sequences", "https://learn.microsoft.com/en-us/ef/core/modeling/sequences"),
          link("Generated values", "https://learn.microsoft.com/en-us/ef/core/modeling/generated-properties"),
          link("SQL Server value generation", "https://learn.microsoft.com/en-us/ef/core/providers/sql-server/value-generation")
        ]),
            topic("Concurrency Tokens", `<img src="/assets/diagrams/efcore/concurrency-conflict.svg" alt="Конфликт конкурентного обновления" style="max-width:100%;height:auto;display:block;margin:12px 0;border:1px solid rgba(255,255,255,0.08);border-radius:12px;background:#0b1020" />

Concurrency token нужен для optimistic concurrency: EF Core помнит значение, которое было прочитано, и при сохранении проверяет, не изменил ли строку кто-то еще. Если проверка не проходит, вы получаете <code>DbUpdateConcurrencyException</code>.

Обычно это решается через <code>rowversion</code> или другой токен версии. После конфликта приложение либо перезагружает данные и повторяет попытку, либо показывает пользователю явный конфликт и просит принять решение.

Это особенно полезно там, где несколько операторов или процессов могут редактировать одну и ту же запись одновременно.
`, [
          link("Handling concurrency conflicts", "https://learn.microsoft.com/en-us/ef/core/saving/concurrency"),
          link("Generated values", "https://learn.microsoft.com/en-us/ef/core/modeling/generated-properties"),
          link("SQL Server value generation", "https://learn.microsoft.com/en-us/ef/core/providers/sql-server/value-generation")
        ]),
            topic("Tracking vs No-Tracking", `<img src="/assets/diagrams/efcore/tracking-vs-notracking.svg" alt="Tracking versus no-tracking" style="max-width:100%;height:auto;display:block;margin:12px 0;border:1px solid rgba(255,255,255,0.08);border-radius:12px;background:#0b1020" />

Tracking query полезен, когда результат будет изменяться и возвращаться в <code>SaveChanges</code>. EF Core держит экземпляр в change tracker, делает identity resolution и умеет аккуратно применить изменения к базе.

<code>AsNoTracking()</code> лучше подходит для чистых read-only сценариев: список, отчет, API projection, экран поиска. Такой запрос обычно легче и быстрее, потому что не нужно строить состояние для изменения.

Если нужен компромисс, есть <code>AsNoTrackingWithIdentityResolution()</code>: чтение остается без tracking, но одинаковые сущности не размножаются в результате.
`, [
          link("Tracking vs. no-tracking queries", "https://learn.microsoft.com/en-us/ef/core/querying/tracking"),
          link("Change tracking in EF Core", "https://learn.microsoft.com/en-us/ef/core/change-tracking/"),
          link("Efficient querying", "https://learn.microsoft.com/en-us/ef/core/performance/efficient-querying")
        ]),
            topic("Загрузка связанных данных", `<img src="/assets/diagrams/efcore/loading-strategies.svg" alt="Стратегии загрузки связанных данных" style="max-width:100%;height:auto;display:block;margin:12px 0;border:1px solid rgba(255,255,255,0.08);border-radius:12px;background:#0b1020" />

У EF Core есть три базовые стратегии: eager, explicit и lazy loading. Eager loading через <code>Include</code> удобен, когда форма графа известна заранее. Explicit loading через <code>Entry(...).LoadAsync()</code> хорош, когда связь нужна только в отдельных ветках кода. Lazy loading через proxies или <code>ILazyLoader</code> удобно, но легко приводит к скрытому N+1.

Правильный выбор обычно определяется не вкусом, а характером сценария: если связь почти всегда нужна, грузите сразу; если нужна редко, грузите явно; если совсем лениво - включайте lazy loading очень осознанно.
`, [
          link("Eager loading of related data", "https://learn.microsoft.com/en-us/ef/core/querying/related-data/eager"),
          link("Explicit loading of related data", "https://learn.microsoft.com/en-us/ef/core/querying/related-data/explicit"),
          link("Lazy loading of related data", "https://learn.microsoft.com/en-us/ef/core/querying/related-data/lazy")
        ]),
            topic("Split Queries", `<img src="/assets/diagrams/efcore/split-query-vs-single.svg" alt="Single query versus split query" style="max-width:100%;height:auto;display:block;margin:12px 0;border:1px solid rgba(255,255,255,0.08);border-radius:12px;background:#0b1020" />

<code>AsSplitQuery()</code> ломает один большой JOIN-запрос на несколько более мелких SQL-запросов. Это помогает избежать cartesian explosion и лишнего дублирования больших столбцов, когда вы тянете несколько коллекций через <code>Include</code>.

Цена у подхода тоже есть: несколько round-trip'ов вместо одного и потенциальные нюансы консистентности, если данные меняются между запросами. Поэтому split query - не универсально "лучше", а лучше именно для определенного класса проблем.

Хорошее правило: если видите большой граф и рост строк на JOIN-ах, посмотрите в сторону split queries.
`, [
          link("Single vs. split queries", "https://learn.microsoft.com/en-us/ef/core/querying/single-split-queries"),
          link("Eager loading of related data", "https://learn.microsoft.com/en-us/ef/core/querying/related-data/eager"),
          link("What's New in EF Core 5.0", "https://learn.microsoft.com/en-us/ef/core/what-is-new/ef-core-5.0/whatsnew")
        ]),
            topic("Функции базы данных", `Если бизнес-логика уже живет в SQL-функции, EF Core может подключиться к ней через <code>HasDbFunction</code>. Это полезно, когда у вас есть проверенная серверная логика и вы хотите вызывать ее из LINQ, а не переписывать в C#.

При этом стоит помнить границу: если выражение можно нормально написать в LINQ - лучше написать его в LINQ. SQL-функции хороши как мост к существующей БД-логике, а не как замена всему query layer.

Если нужна совсем произвольная SQL-форма, тогда уже смотрят в сторону <code>FromSql</code> и <code>SqlQuery</code>.
`, [
          link("User-defined function mapping", "https://learn.microsoft.com/en-us/ef/core/querying/user-defined-function-mapping"),
          link("SQL Queries", "https://learn.microsoft.com/en-us/ef/core/querying/sql-queries")
        ]),
            topic("Отслеживание изменений", `<img src="/assets/diagrams/efcore/change-tracker-states.svg" alt="Состояния change tracker" style="max-width:100%;height:auto;display:block;margin:12px 0;border:1px solid rgba(255,255,255,0.08);border-radius:12px;background:#0b1020" />

Change tracker - это сердце update pipeline в EF Core. Он хранит состояние сущности, ее original values и решает, что именно отправить в базу: insert, update или delete.

На практике важны четыре вещи: tracked entities живут внутри short-lived <code>DbContext</code>, <code>DetectChanges()</code> находит изменения, <code>EntityState</code> показывает состояние, а value comparer помогает корректно сравнивать сложные или mutable типы.

Если сущностей очень много, change detection может стать заметным по времени, но для большинства приложений это все еще нормальный и очень удобный default.
`, [
          link("Change tracking in EF Core", "https://learn.microsoft.com/en-us/ef/core/change-tracking/"),
          link("Change detection and notifications", "https://learn.microsoft.com/en-us/ef/core/change-tracking/change-detection"),
          link("Value comparers", "https://learn.microsoft.com/en-us/ef/core/modeling/value-comparers")
        ]),
            topic("Получить SQL текст запроса", `Когда надо понять, во что EF Core превратил ваш LINQ, самый удобный инструмент - <code>ToQueryString()</code>. Он показывает SQL до выполнения и помогает быстро увидеть, не распух ли запрос или не уехала ли фильтрация не туда.

<code>LogTo()</code> отвечает уже за runtime-диагностику: показывает реальные команды и время выполнения. В паре они закрывают два разных вопроса: "что EF сгенерировал?" и "что реально ушло в базу?".

Если запрос неожиданно медленный, сначала посмотрите на SQL, потом на количество round-trip'ов, а уже потом на микротюнинг.
`, [
          link("What's New in EF Core 5.0", "https://learn.microsoft.com/en-us/ef/core/what-is-new/ef-core-5.0/whatsnew"),
          link("Performance diagnosis", "https://learn.microsoft.com/en-us/ef/core/performance/performance-diagnosis"),
          link("SQL Queries", "https://learn.microsoft.com/en-us/ef/core/querying/sql-queries")
        ]),
            topic("Тестирование с EF Core", `Для тестов лучше не подменять реальную БД полностью фиктивной. EF Core прямо предупреждает, что <code>InMemory</code> provider не подходит для production и даже для части тестов часто дает ложное чувство уверенности.

Более надежный путь - SQLite in-memory или вообще реальный provider, если вам важны поведение SQL, транзакции и провайдерные особенности. Если же нужно именно изолировать бизнес-логику, часто лучше вынести EF Core за репозиторий и тестировать его отдельно.

Главная мысль простая: тест должен проверять то, что вы реально собираетесь запускать в production, а не только красивую имитацию запроса.
`, [
          link("Choosing a testing strategy", "https://learn.microsoft.com/en-us/ef/core/testing/choosing-a-testing-strategy"),
          link("Testing without your Production Database System", "https://learn.microsoft.com/en-us/ef/core/testing/testing-without-the-database"),
          link("In-memory database provider", "https://learn.microsoft.com/en-us/ef/core/providers/in-memory/")
        ]),
            topic("Проблемы производительности", `На performance-профиле EF Core почти всегда всплывают одни и те же вещи: лишние столбцы, слишком широкие JOIN-ы, <code>N+1</code>, отсутствие индексов и слишком большой tracking overhead.

Полезный порядок проверки такой: сначала projection и фильтры, потом количество запросов, потом split query или eager loading, потом индексы и, только если действительно нужно, уход в raw SQL. EF Core performance docs прямо советуют смотреть на форму запроса, а не только на ORM.

Если запросы логируются, неожиданные round-trip'ы видно сразу - это часто самый быстрый способ поймать реальную причину тормозов.
`, [
          link("Efficient querying", "https://learn.microsoft.com/en-us/ef/core/performance/efficient-querying"),
          link("Performance diagnosis", "https://learn.microsoft.com/en-us/ef/core/performance/performance-diagnosis")
        ]),
            topic("Параллелизм в APP слое", `<img src="/assets/diagrams/efcore/parallel-dbcontext.svg" alt="Параллельные операции и DbContext" style="max-width:100%;height:auto;display:block;margin:12px 0;border:1px solid rgba(255,255,255,0.08);border-radius:12px;background:#0b1020" />

<code>DbContext</code> не потокобезопасен. Это означает, что один и тот же экземпляр нельзя использовать для нескольких параллельных операций: нужно дождаться завершения одного async-вызова, прежде чем начинать следующий.

Если в application layer нужна параллельность, создавайте отдельный <code>DbContext</code> для каждой задачи через scope или <code>IDbContextFactory&lt;TContext&gt;</code>. Так вы сохраняете и корректность, и читаемую границу unit of work.

Хорошее правило: параллелить можно работу, но не один и тот же context instance.
`, [
          link("DbContext lifetime, configuration, and initialization", "https://learn.microsoft.com/en-us/ef/core/dbcontext-configuration/"),
          link("Asynchronous programming", "https://learn.microsoft.com/en-us/ef/core/miscellaneous/async")
        ])
    ]
  },  {
    id: "webapi", title: "WebAPI (ASP.NET Core)", icon: "&#9656;", color: "green",
    rows: [
            topic("Configure() vs ConfigureServices()", `![Поток запуска](/assets/diagrams/webapi/startup-pipeline.svg)

## Идея
В классическом ASP.NET Core деление очень простое: **ConfigureServices** собирает DI-контейнер, а **Configure** строит HTTP-пайплайн. В минимальном хостинге это же деление читается как **builder.Services** и **app.Use(...)**.

## Практика
Сначала регистрируем сервисы, потом собираем middleware и endpoints. Так проще держать в голове границу между конфигурацией инфраструктуры и обработкой запроса.

## Что запомнить
- сервисы живут выше маршрутизации;
- порядок middleware важен;
- DI сначала, pipeline потом.`, [
          link("Startup in ASP.NET Core", "https://learn.microsoft.com/en-us/aspnet/core/fundamentals/startup?view=aspnetcore-9.0"),
          link("Service lifetimes (dependency injection)", "https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection/service-lifetimes"),
          link("Developing ASP.NET Core MVC apps", "https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/develop-asp-net-core-mvc-apps")
        ]),
            topic("Кастомный Middleware", `![Пайплайн middleware](/assets/diagrams/webapi/middleware-pipeline.svg)

## Идея
Кастомный middleware — это маленький участник конвейера: он получает HttpContext, делает работу до и после следующего шага и при необходимости останавливает цепочку.

## Практика
Хороший middleware делает одну вещь: логирование, auth, корреляцию, rate limit, трейсинг, заголовки или преобразование ответа. Если нужны scoped-зависимости, удобнее использовать фабричную активацию или IMiddleware.

## Что запомнить
- порядок регистрации определяет поведение;
- терминальный Run не вызывает следующий шаг;
- после старта ответа заголовки менять поздно.`, [
          link("Middleware in ASP.NET Core", "https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware?view=aspnetcore-9.0"),
          link("Middleware activation and lifetime", "https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware/extensibility?view=aspnetcore-9.0"),
          link("HttpResponse.HasStarted", "https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.http.httpresponse.hasstarted?view=aspnetcore-10.0")
        ]),
            topic("HttpContext.Response events", `![Жизненный цикл ответа](/assets/diagrams/webapi/request-lifecycle.svg)

## Идея
OnStarting и OnCompleted задают границы ответа: до первого байта можно менять заголовки, после завершения — чистить ресурсы, закрывать метрики и логировать итог.

## Практика
Это удобно для correlation-id, cookie, audit log и аккуратного teardown. Если ответ уже начал уходить, заголовки трогать нельзя, поэтому сначала смотрят HasStarted.

## Что запомнить
- OnStarting — последний безопасный момент для заголовков;
- OnCompleted — хороший слот для cleanup;
- обработка должна быть быстрой и без блокировок.`, [
          link("HttpResponse API", "https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.http.httpresponse?view=aspnetcore-10.0"),
          link("HttpResponse.OnStarting", "https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.http.httpresponse.onstarting?view=aspnetcore-10.0"),
          link("HttpResponse.OnCompleted", "https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.http.httpresponse.oncompleted?view=aspnetcore-10.0")
        ]),
            topic("Kestrel WebHost", `![Схема Kestrel](/assets/diagrams/webapi/kestrel-stack.svg)

## Идея
Kestrel — встроенный кроссплатформенный HTTP-сервер ASP.NET Core. Он может работать напрямую или за reverse proxy, а приложение настраивает либо сам сервер, либо хост, который его запускает.

## Практика
Важно помнить две вещи: Kestrel обрабатывает сетевой трафик, а middleware уже живёт выше него. Поэтому порты, сертификаты, HTTP/2, HTTP/3 и proxy-сценарии настраиваются в зоне Kestrel или host config, а не в контроллерах.

## Что запомнить
- Kestrel — серверный край приложения;
- за proxy он всё равно остаётся тем, кто обслуживает запросы;
- лимиты и диагностика тоже здесь.`, [
          link("Kestrel web server in ASP.NET Core", "https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/kestrel?view=aspnetcore-9.0"),
          link("When to use Kestrel with a reverse proxy", "https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/kestrel/when-to-use-a-reverse-proxy?view=aspnetcore-9.0"),
          link("Developing ASP.NET Core MVC apps", "https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/develop-asp-net-core-mvc-apps")
        ]),
            topic("KestrelServerOptions: Limits", `![Ограничения Kestrel](/assets/diagrams/webapi/kestrel-stack.svg)

## Идея
KestrelServerOptions.Limits — это не про "подкрутить пару чисел", а про защиту сервера от слишком больших запросов и чрезмерного параллелизма. Здесь живут лимиты тела запроса, строки запроса, заголовков, keep-alive, минимальной скорости и количества соединений.

## Практика
Настраивайте их осознанно: под реальные payload'ы, reverse proxy и особенности загрузки файлов. Если большой запрос нужен только в одной операции, лучше ограничить его точечно на endpoint или action, а не раздувать весь сервер.

## Что запомнить
- server-wide limits — это линия обороны;
- per-endpoint overrides должны быть исключением;
- лимит лучше объяснить в коде, чем ловить 413 в проде.`, [
          link("KestrelServerOptions.Limits", "https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.server.kestrel.core.kestrelserveroptions.limits?view=aspnetcore-10.0"),
          link("KestrelServerLimits.MaxRequestBodySize", "https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.server.kestrel.core.kestrelserverlimits.maxrequestbodysize?view=aspnetcore-9.0"),
          link("Kestrel web server in ASP.NET Core", "https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/kestrel?view=aspnetcore-9.0")
        ]),
            topic("Метрики Kestrel: KestrelEventSource", `Kestrel публикует EventCounters, которые удобно смотреть через dotnet-counters или любой telemetry stack, понимающий EventSource. Это быстрый способ увидеть очередь соединений, текущие соединения, TLS-handshake и request queue без тяжёлого APM.

## Практика
Если растёт latency, сначала смотрят не только CPU, но и очереди Kestrel: есть ли saturation на входе, не копятся ли TLS-handshake, не забита ли request queue. Такой срез помогает понять, проблема в приложении, сети или самом сервере.

## Что запомнить
- counters — это дешёвый живой сигнал;
- KestrelEventSource полезен до полного профилирования;
- сначала наблюдаем очередь и соединения, потом копаем глубже.`, [
          link("Kestrel diagnostics", "https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/kestrel/diagnostics?view=aspnetcore-9.0"),
          link("Well-known EventCounters in .NET", "https://learn.microsoft.com/en-us/dotnet/core/diagnostics/available-counters"),
          link("dotnet-counters diagnostic tool", "https://learn.microsoft.com/en-us/dotnet/core/diagnostics/dotnet-counters")
        ]),
            topic("Formatters для MVC", `![Content negotiation](/assets/diagrams/webapi/content-negotiation.svg)

## Идея
Форматтеры MVC разделяют две задачи: чтение входа и запись ответа. Один и тот же endpoint может принять JSON, form-data или другой формат, а вернуть то, что умеет выбранный output formatter.

## Практика
Когда API должно жить не только на JSON, форматтеры становятся точкой расширения: можно добавить XML, особый текстовый формат или собственную сериализацию. Это лучше, чем вручную конвертировать всё в контроллере.

## Что запомнить
- формат ответа выбирается по метаданным и содержимому запроса;
- input и output форматтеры решают разные задачи;
- ObjectResult обычно идёт через negotiation, а не через жёстко зашитый MIME type.`, [
          link("Formatting in ASP.NET Core Web API", "https://learn.microsoft.com/en-us/aspnet/core/web-api/advanced/formatting?view=aspnetcore-9.0"),
          link("ObjectResult class", "https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.mvc.objectresult?view=aspnetcore-9.0"),
          link("FormatFilterAttribute", "https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.mvc.formatfilterattribute?view=aspnetcore-9.0")
        ]),
            topic("Форсирование формата ObjectResult", `Если negotiation слишком открытый, его можно сузить. Для endpoints, которые обязаны отдавать конкретный media type, используют ObjectResult.ContentTypes, FormatFilterAttribute или вовсе возвращают конкретный result-тип вместо выбора между несколькими форматерами.

## Практика
Это полезно, когда контракт важнее гибкости: фиксированный экспорт, версионированный media type или UI, который зависит от стабильной формы ответа. Если клиентов немного и формат известен заранее, явное решение читается лучше, чем скрытая магия.

## Что запомнить
- forcing format — это решение про контракт;
- ContentTypes сужает выбор;
- явный result обычно понятнее, чем неявная догадка MVC.`, [
          link("ObjectResult.ContentTypes", "https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.mvc.objectresult.contenttypes?view=aspnetcore-10.0"),
          link("FormatFilterAttribute", "https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.mvc.formatfilterattribute?view=aspnetcore-9.0"),
          link("Action return types in ASP.NET Core Web API", "https://learn.microsoft.com/en-us/aspnet/core/web-api/action-return-types?view=aspnetcore-10.0")
        ]),
            topic("HealthChecks", `![Health checks](/assets/diagrams/webapi/healthchecks.svg)

## Идея
Health checks — это не просто 200 OK на /health. Обычно их делят на liveness и readiness, отдельно выбирают какие проверки запускать, и настраивают собственный ответ для оркестратора или балансировщика.

## Практика
В реальном приложении endpoint может проверять БД, кэш, очереди и внешние зависимости, но при этом не должен сам становиться тяжёлой проверкой. Хороший health endpoint быстрый, предсказуемый и полезный для автоматики.

## Что запомнить
- отдельный endpoint лучше размытых ping'ов;
- теги помогают разделить readiness и liveness;
- статус-коды и формат ответа настраиваются явно.`, [
          link("Health checks in ASP.NET Core", "https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/health-checks?view=aspnetcore-9.0"),
          link("MapHealthChecks", "https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.builder.healthcheckendpointroutebuilderextensions.maphealthchecks?view=aspnetcore-10.0"),
          link("UseHealthChecks", "https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.builder.healthcheckapplicationbuilderextensions.usehealthchecks?view=aspnetcore-9.0")
        ]),
            topic("Swagger (OpenAPI)", `Swagger/OpenAPI — это контракт, из которого можно сгенерировать документацию, клиенты и тестовые сценарии. В ASP.NET Core метаданные собираются из маршрутов, типов возврата, атрибутов и XML-комментариев; Swashbuckle или встроенный OpenAPI слой лишь превращают это в удобный UI и JSON.

## Практика
Полезнее всего Swagger тогда, когда контракт поддерживается кодом: ProducesResponseType, Consumes, DTO-схемы, summaries и versioning. Тогда документация не живёт отдельно от API, а вырастает из него.

## Что запомнить
- это документация от кода, а не рядом с кодом;
- метаданные endpoint'ов важнее красивого UI;
- чем точнее контракт, тем меньше сюрпризов у клиентов.`, [
          link("Include OpenAPI metadata in an ASP.NET Core app", "https://learn.microsoft.com/en-us/aspnet/core/fundamentals/openapi/include-metadata?view=aspnetcore-10.0"),
          link("Get started with Swashbuckle and ASP.NET Core", "https://learn.microsoft.com/en-us/aspnet/core/tutorials/getting-started-with-swashbuckle?view=aspnetcore-8.0"),
          link("Action return types in ASP.NET Core Web API", "https://learn.microsoft.com/en-us/aspnet/core/web-api/action-return-types?view=aspnetcore-10.0")
        ]),
            topic("Время жизни контроллера", `Контроллер в ASP.NET Core обычно живёт в рамках одного запроса: его создаёт MVC, в него внедряются зависимости, а после ответа экземпляр больше не нужен. Поэтому состояние лучше держать в scoped-сервисах или в самом запросе, а не в полях контроллера.

## Практика
Если в контроллере хочется хранить кэш, очередь или пользовательский контекст между запросами, это почти всегда знак, что такое состояние должно жить в сервисе с подходящим lifetime. Для stateless endpoints контроллер должен оставаться тонким.

## Что запомнить
- контроллер — оркестратор, не хранилище состояния;
- AddScoped хорошо совпадает с request scope;
- Singleton и mutable state в контроллере почти всегда плохая идея.`, [
          link("Service lifetimes (dependency injection)", "https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection/service-lifetimes"),
          link("Developing ASP.NET Core MVC apps", "https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/develop-asp-net-core-mvc-apps"),
          link("Dependency injection basics quickstart", "https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection-basics")
        ]),
            topic("FromService, FromRoute и др.", `![Binding sources](/assets/diagrams/webapi/model-binding.svg)

## Идея
Атрибуты FromRoute, FromQuery, FromHeader, FromBody, FromForm и FromServices убирают двусмысленность. Вместо гадания, откуда брать значение, endpoint явно говорит, какой источник нужен для каждого параметра.

## Практика
Для простых типизированных данных используйте route/query, для сложного тела запроса — body, для инфраструктурных зависимостей — services. Это особенно полезно, когда параметр может быть собран сразу из нескольких источников, а вы хотите сделать контракт читаемым.

## Что запомнить
- явный источник уменьшает магию;
- DI-зависимость — это не часть payload;
- FromServices хорошо читается в контроллерах и минимальных API.`, [
          link("FromServicesAttribute", "https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.mvc.fromservicesattribute?view=aspnetcore-9.0"),
          link("FromRouteAttribute", "https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.mvc.fromrouteattribute?view=aspnetcore-9.0"),
          link("FromQueryAttribute", "https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.mvc.fromqueryattribute?view=aspnetcore-9.0")
        ]),
            topic("ModelBinding", `![Binding flow](/assets/diagrams/webapi/model-binding.svg)

## Идея
Model binding — это конвейер, который превращает входящие строки запроса в параметры action'ов и сложные типы. Он проходит по источникам данных, пробует сконструировать объект, а затем передаёт результат в валидацию.

## Практика
Когда binding становится неожиданным, причина обычно в неявном источнике или в несоответствии имён. Поэтому полезно держать DTO простыми, имена — стабильными, а сложные преобразования делать в отдельном слое, а не в контроллере.

## Что запомнить
- binding — это не бизнес-логика;
- имена и типы важны не меньше маршрутов;
- ошибки binding'а лучше ловить на границе API, а не глубже.`, [
          link("Model binding in ASP.NET Core", "https://learn.microsoft.com/en-us/aspnet/core/mvc/models/model-binding?view=aspnetcore-9.0"),
          link("Web API overview", "https://learn.microsoft.com/en-us/aspnet/core/web-api/?view=aspnetcore-9.0"),
          link("Parameter binding in minimal APIs", "https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/parameter-binding?view=aspnetcore-9.0")
        ]),
            topic("CancellationToken в async/await", `![HTTP request lifecycle](/assets/diagrams/webapi/request-lifecycle.svg)

## Идея
В WebAPI CancellationToken нужен не для красоты, а чтобы запрос мог остановить работу, если клиент ушёл или соединение оборвалось. В ASP.NET Core токен обычно приходит из HttpContext.RequestAborted и должен протекать дальше в I/O, EF Core и внешние вызовы.

## Практика
Самая полезная привычка — принимать token в handler'ах и методах репозитория как первый класс сигнала отмены. Тогда система быстрее освобождает ресурсы, не держит лишние запросы и лучше переживает пики нагрузки.

## Что запомнить
- отмена должна идти вниз по стеку;
- игнорирование токена делает async только наполовину;
- долгие операции без отмены — частая причина лишней нагрузки.`, [
          link("HttpContext.RequestAborted", "https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.http.httpcontext.requestaborted?view=aspnetcore-10.0"),
          link("Cancellation in Managed Threads", "https://learn.microsoft.com/en-us/dotnet/standard/threading/cancellation-in-managed-threads"),
          link("Task Cancellation", "https://learn.microsoft.com/en-us/dotnet/standard/parallel-programming/task-cancellation")
        ])
    ]
  },  {
    id: "api", title: "Разработка API", icon: "&#8644;", color: "orange",
    rows: [
            topic("Идемпотентность", `## Что это
Идемпотентность означает, что повтор одного и того же запроса не меняет итог больше одного раза. Для \`GET\`, \`PUT\` и \`DELETE\` это свойство ожидается по смыслу метода, а для \`POST\` его обычно приходится проектировать отдельно.

![Схема идемпотентности](/assets/diagrams/api/idempotency.svg)

## Когда это важно
Сетевые ретраи, повторная отправка формы, двойной клик, повтор webhook и сбой между записью в БД и ответом клиенту.

## Как делать на практике
- Выделяйте натуральный ключ операции: номер заказа, внешний idempotency key, correlation id.
- Храните результат первой успешной обработки и возвращайте его повторным запросам.
- Если операция создаёт ресурс, привязывайте повтор к тому же URI или к тому же ключу дедупликации.
- Для асинхронных операций возвращайте \`202 Accepted\`, если реальный результат будет позже.

## Что помнить
- Ретраи без идемпотентности опасны.
- Идемпотентность нужна не только для API, но и для интеграций между сервисами.`, [
          link("Azure API Design - Idempotent operations", "https://learn.microsoft.com/en-us/azure/architecture/microservices/design/api-design"),
          link("RFC 9110 - HTTP Semantics", "https://www.rfc-editor.org/rfc/rfc9110"),
          link("Idempotency-Key HTTP header draft", "https://datatracker.ietf.org/doc/html/draft-ietf-httpapi-idempotency-key-header")
        ]),
            topic("Корректные HTTP статус коды", `## Что это
Статус-код должен говорить правду о результате операции: создан ресурс, запрос принят в работу, входные данные плохие, ресурс уже существует, нужна аутентификация или произошла внутренняя ошибка.

## Практический ориентир
- \`200\`, \`201\`, \`204\` для успешных сценариев.
- \`202\` когда работа принята, но завершится позже.
- \`400\` для невалидного запроса, \`401\` для отсутствующей аутентификации, \`403\` для запрета, \`404\` если ресурса нет, \`409\` при конфликте состояния, \`415\` если тип тела неподходящий.
- Для машинного описания ошибки возвращайте \`application/problem+json\` по RFC 9457.

## Что не делать
Не прятать ошибки в \`200 OK\`, не отдавать \`500\` для ожидаемых бизнес-конфликтов и не выбирать статус на глаз. Чем точнее код, тем проще ретраи, клиентская логика и мониторинг.`, [
          link("RFC 9110 - HTTP Semantics", "https://www.rfc-editor.org/rfc/rfc9110"),
          link("RFC 9457 - Problem Details for HTTP APIs", "https://www.rfc-editor.org/rfc/rfc9457"),
          link("Azure API Design - response status codes", "https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design")
        ]),
            topic("Отдача статики отдельно", `## Что это
Статические файлы лучше отдавать не через бизнес-эндпоинты, а отдельным путём, CDN или edge layer. API должен концентрироваться на данных и командах, а не на доставке картинок, JS и CSS.

## Почему так
- Снижается нагрузка на API-процесс и БД.
- У статических файлов проще выставить длинный \`Cache-Control\`, \`immutable\`, \`ETag\` и CDN-политику.
- Внешний мир получает стабильные URL, а backend остаётся свободным для изменений.
- В ASP.NET Core это обычно делают через \`UseStaticFiles\` или \`MapStaticAssets\`, а не через контроллеры.

## Хорошая схема
\`app\` выдаёт данные и ссылки, а статику обслуживает отдельный static host, Front Door или CDN. Если нужен доступ вне \`wwwroot\`, лучше явно настроить отдельный static path, чем смешивать его с API.`, [
          link("ASP.NET Core static files", "https://learn.microsoft.com/en-us/aspnet/core/fundamentals/static-files?view=aspnetcore-9.0"),
          link("Azure Front Door caching", "https://learn.microsoft.com/en-us/azure/frontdoor/front-door-caching"),
          link("RFC 9111 - HTTP Caching", "https://www.rfc-editor.org/rfc/rfc9111")
        ]),
            topic("API Gateway", `## Что это
API Gateway - единая точка входа перед внутренними сервисами. Он маршрутизирует запросы, скрывает внутреннюю топологию и держит на себе общие обязанности: auth, throttling, caching, observability и aggregation.

![Схема API Gateway](/assets/diagrams/api/gateway.svg)

## Когда нужен
Когда клиенту приходится ходить в несколько сервисов, когда надо убрать знание о внутренней схеме из внешнего контракта и когда общие политики лучше централизовать, чем дублировать в каждом сервисе.

## Практика
- Используйте gateway как фасад, а не как место для бизнес-логики.
- Не давайте клиентам знать внутренние URI сервисов.
- Сложную агрегацию держите тонкой: gateway собирает ответы, но не заменяет domain/application слой.
- Для .NET экосистемы часто хватает APIM, YARP или ingress/controller на уровне платформы.`, [
          link("API gateways - Azure Architecture Center", "https://learn.microsoft.com/en-us/azure/architecture/microservices/design/gateway"),
          link("Azure API Management - key concepts", "https://learn.microsoft.com/en-us/azure/api-management/api-management-key-concepts"),
          link("AKS microservices reference architecture", "https://learn.microsoft.com/en-us/azure/architecture/reference-architectures/containers/aks-microservices/aks-microservices")
        ]),
            topic("Кэширование", `## Что это
Кэширование хранит часто повторяемый ответ ближе к клиенту или приложению. У HTTP это не магия ускорения, а набор правил о свежести, валидации и сроках жизни.

![HTTP cache flow](/assets/diagrams/api/cache.svg)

## Что полезно помнить
- \`Cache-Control\` задаёт политику, \`ETag\` и \`Last-Modified\` помогают переиспользовать ответ безопасно.
- \`304 Not Modified\` дешевле, чем повторная доставка тела.
- Для неизменяемых статических ресурсов полезны \`immutable\` и длинные TTL.
- Если ресурс зависит от пользователя, региона или авторизации, кэшируйте очень осторожно или не кэшируйте вовсе.

## Практика
Разделяйте edge cache для публичных ответов и локальный in-memory cache для внутренних повторов. У API и CDN разные задачи: один уменьшает работу origin, другой уменьшает латентность для потребителя.`, [
          link("RFC 9111 - HTTP Caching", "https://www.rfc-editor.org/rfc/rfc9111"),
          link("RFC 8246 - HTTP Immutable Responses", "https://www.rfc-editor.org/rfc/rfc8246"),
          link("Azure Front Door caching", "https://learn.microsoft.com/en-us/azure/frontdoor/front-door-caching")
        ]),
            topic("Rate Limiting", `## Что это
Rate limiting ограничивает скорость запросов по ключу, пользователю, IP или маршруту. Это не про наказание клиента, а про защиту системы от всплесков и обеспечение предсказуемости.

![Схема rate limiting](/assets/diagrams/api/rate-limit.svg)

## Как читать политику
Лимит обычно описывается тремя вещами: окно, объём и что делать при превышении. Отдельно важно поведение при burst-трафике и то, какие заголовки получает клиент после отказа.

## Практика
- Возвращайте \`429 Too Many Requests\`.
- Добавляйте \`Retry-After\`, а где уместно и поля из стандарта \`RateLimit\`.
- Выбирайте алгоритм под задачу: fixed window проще, token bucket мягче к всплескам, sliding window часто даёт лучший баланс.
- Если система распределённая, храните состояние лимитов там, где его увидят все инстансы.

## Не путать
Rate limiting защищает от перегруза, но не гарантирует, что каждая лишняя операция когда-нибудь будет обработана. Для "не терять данные" нужен буфер, очередь и асинхронная обработка.`, [
          link("Rate limiting middleware in ASP.NET Core", "https://learn.microsoft.com/en-us/aspnet/core/performance/rate-limit?view=aspnetcore-9.0"),
          link("RFC 9331 - RateLimit Fields", "https://www.rfc-editor.org/info/rfc9331"),
          link(".NET resilience overview", "https://learn.microsoft.com/en-us/dotnet/core/resilience/")
        ]),
            topic("Защита от перегрузки", `## Что это
Защита от перегрузки собирает несколько механизмов: timeout, retry with backoff, circuit breaker, bulkhead isolation, fallback и очередь. Цель одна - не дать медленной или падающей зависимости утянуть весь API вниз.

## Как думать
- Timeout ограничивает время ожидания.
- Circuit breaker быстро режет повторные неудачи.
- Bulkhead изолирует пулы и очереди для разных типов нагрузки.
- Queue и \`202 Accepted\` нужны там, где операция может ждать, но не должна терять данные.

## Практика
Защиту от перегрузки лучше ставить и на входе API, и на исходящих вызовах к БД, HTTP и очередям. Один только retry почти всегда ухудшает ситуацию, если не ограничить его таймаутом и количеством попыток.

## Что помнить
Плохой dependency management превращает API в цепочку отказов. Хорошая защита от перегрузки делает отказ локальным и коротким.`, [
          link("Circuit Breaker pattern", "https://learn.microsoft.com/en-us/azure/architecture/patterns/circuit-breaker"),
          link(".NET resilient HTTP apps", "https://learn.microsoft.com/en-us/dotnet/core/resilience/http-resilience"),
          link("Polly resilience library", "https://www.pollydocs.org/")
        ]),
            topic("Пагинация", `## Что это
Пагинация делит большой набор данных на порции, чтобы API не отдавал бесконечный список целиком. Для живых данных курсорная пагинация обычно надёжнее offset-подхода, потому что меньше страдает от вставок и удалений между запросами.

![Схема пагинации](/assets/diagrams/api/pagination.svg)

## Практика
- Для небольших справочников допустим \`offset\` и \`limit\`.
- Для больших и изменяющихся наборов лучше cursor или continuation token.
- Всегда задавайте стабильную сортировку, иначе следующая страница станет недетерминированной.
- Возвращайте \`nextLink\` или token, а не заставляйте клиента вычислять смещение самостоятельно.

## Не забыть
Если API уже использует page/size, добавляйте ограничения на размер страницы и явно документируйте максимумы. Иначе клиент быстро превратит пагинацию в "вытяни мне всё".`, [
          link("RFC 8288 - Web Linking", "https://www.rfc-editor.org/rfc/rfc8288.html"),
          link("Data API Builder pagination", "https://learn.microsoft.com/en-us/azure/data-api-builder/concept/api/pagination"),
          link("API Best Practices - pagination and filtering", "https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design")
        ]),
            topic("Observability API", `## Что это
Observability API - это контракт на то, чтобы запрос можно было проследить от входа до всех внутренних вызовов. Обычно сюда входят корреляционные id, trace context, метрики и структурированные логи.

## Как делать
- Пропагируйте \`traceparent\` / \`tracestate\` или хотя бы \`Correlation-ID\` / \`X-Request-ID\`.
- Сшивайте логи, метрики и трассы одним идентификатором запроса.
- Отмечайте длительность, коды ответа, dependency и размер ответа.
- Для ошибок возвращайте не только текст, но и полезный problem detail.

## Практика
Хорошая observability не даёт больше шума, она сокращает время поиска причины. Если по API нельзя восстановить путь одного запроса, значит он плохо наблюдаем.`, [
          link("OpenTelemetry", "https://opentelemetry.io/"),
          link("Azure Monitor OpenTelemetry", "https://learn.microsoft.com/en-us/azure/azure-monitor/app/opentelemetry"),
          link("Azure API Design - trace context in APIs", "https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design")
        ])
    ]
  },  {
    id: "security", title: "Безопасность", icon: "&#9919;", color: "rose",
    rows: [
            topic("OWASP Top 10", `## Что это
OWASP Top 10 - это не полный каталог всех уязвимостей, а короткий список самых частых и дорогих классов ошибок, вокруг которых удобно строить базовую модель рисков для web-приложения и API.

## Как этим пользоваться в 2026
На момент апреля 2026 на сайте OWASP последней web-редакцией остаётся **Top 10:2025**. На практике Top 10 полезен не как "прошли чек-лист и забыли", а как словарь для разговоров между разработкой, QA, архитектурой и безопасностью.

## Как применять к карточкам проекта
- проходить по каждому пользовательскому сценарию, а не только по endpoint'ам;
- отдельно смотреть доступ к объектам, криптографию, конфигурацию, supply chain и логирование;
- связывать Top 10 с более детальным стандартом вроде ASVS и профильными cheat sheets.

## Где команды чаще ошибаются
Самая частая ошибка - думать, что Top 10 заменяет threat modeling. Он хорошо подсвечивает типовые зоны риска, но не знает ничего о ваших бизнес-операциях, интеграциях и внутренней модели доступа.

## Что запомнить
- Top 10 нужен для приоритизации, а не для галочки.
- Самые дорогие проблемы обычно появляются там, где доступ, данные и конфигурация были спроектированы слишком оптимистично.`, [
          link("OWASP Top 10: 2025 Introduction", "https://owasp.org/Top10/2025/0x00_2025-Introduction/"),
          link("OWASP Top 10 Project", "https://owasp.org/www-project-top-ten/"),
          link("OWASP ASVS", "https://owasp.org/www-project-application-security-verification-standard/")
        ]),
            topic("OAuth 2.0", `![Поток Authorization Code + PKCE](/assets/diagrams/security/oauth-authorization-code-pkce.svg)

## Что это
OAuth 2.0 описывает делегированный доступ: клиент получает право вызывать защищённый ресурс не по паролю пользователя, а по токену, который выпустил authorization server.

## Что важно различать
- **OAuth 2.0** отвечает за выдачу и использование токенов доступа.
- **OpenID Connect** добавляет поверх OAuth слой идентичности и пользовательского логина.
- Сам API чаще всего выступает **resource server**: он принимает access token, но не хранит пользовательский пароль.

## Какой поток считать основным
Для браузерных и серверных приложений основной вариант сегодня - **Authorization Code + PKCE**. Для service-to-service сценариев обычно используется **Client Credentials**. Старые схемы вроде implicit flow или передачи пароля приложению не стоит тащить в новые системы.

## Что должен проверять API
Подпись токена, issuer, audience, срок жизни, scopes/roles и правила для конкретной операции. Сам факт наличия JWT ещё не означает, что доступ выдан корректно.

## Что запомнить
- OAuth - это про делегирование доступа, не про "включить JWT".
- Чем короче срок жизни bearer-token и чем яснее его аудитория, тем проще держать систему под контролем.`, [
          link("RFC 6749 - OAuth 2.0 Authorization Framework", "https://www.rfc-editor.org/rfc/rfc6749"),
          link("RFC 9700 - Best Current Practice for OAuth 2.0 Security", "https://www.rfc-editor.org/rfc/rfc9700"),
          link("RFC 6750 - Bearer Token Usage", "https://www.rfc-editor.org/rfc/rfc6750")
        ]),
            topic("Единая точка аутентификации (SSO)", `![Цепочка SSO-сессии](/assets/diagrams/security/sso-session-chain.svg)

## Что это
SSO означает, что несколько приложений доверяют одному identity provider и получают аутентификацию из общего центра. Пользователь логинится один раз, а дальше новые приложения переиспользуют сессию IdP.

## Важный нюанс
Обычно приложения **не делят одну и ту же cookie между собой**. Они делят доверие к одному провайдеру входа, который уже знает пользователя и может быстро выпустить новую сессию или токены для следующего приложения.

## Из чего состоит хорошая SSO-схема
- единый IdP с MFA, Conditional Access и аудитом;
- приложения как доверенные relying parties / clients;
- понятные правила logout, lifetime и re-authentication для чувствительных операций;
- минимальный набор claims, который действительно нужен приложению.

## Где чаще ломаются проекты
Проблемы появляются на logout, долгоживущих сессиях и избыточных claims. SSO не должен превращаться в "если ты однажды вошёл, тебе теперь всё можно везде".

## Что запомнить
- SSO снижает фрикцию входа, но усиливает требования к самому identity provider.
- Компрометация IdP или его сессии становится системным риском для всего набора приложений.`, [
          link("OpenID Connect Core 1.0", "https://openid.net/specs/openid-connect-core-1_0.html"),
          link("Microsoft Entra - Web App Sign-In Overview", "https://learn.microsoft.com/en-us/entra/identity-platform/scenario-web-app-sign-user-overview")
        ]),
            topic("Авторизация на уровне объектов", `![Проверка доступа к объекту](/assets/diagrams/security/object-authorization-check.svg)

## Что это
Проверка идёт не только на уровне "пользователь вошёл в endpoint", но и на уровне конкретного объекта: заказа, документа, счёта, файла или комментария.

## Почему это критично
Именно здесь рождается классическая проблема **Broken Object Level Authorization**: пользователь подменяет чужой id и получает данные, которые формально лежат за тем же endpoint'ом.

## Правильный порядок проверки
1. API принимает идентификатор ресурса.
2. Сервер сам загружает объект или его security-метаданные.
3. Policy/handler проверяет владельца, tenant, роль, состояние объекта и допустимую операцию.
4. Только после этого приложение возвращает данные или выполняет изменение.

## Практический ориентир
В ASP.NET Core для этого хорошо подходят resource-based policies: авторизация принимает не только пользователя, но и сам объект домена или DTO с нужными полями безопасности.

## Что запомнить
- Авторизация к объекту почти всегда важнее, чем авторизация к самому URL.
- Не стоит доверять тому, что клиент "честно" передал свой id или свою роль.`, [
          link("OWASP API1:2023 - Broken Object Level Authorization", "https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/"),
          link("ASP.NET Core Resource-Based Authorization", "https://learn.microsoft.com/en-us/aspnet/core/security/authorization/resourcebased?view=aspnetcore-9.0"),
          link("OWASP Authorization Cheat Sheet", "https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html")
        ]),
            topic("Парадигма: всё закрыто по умолчанию", `## Что это
Безопасная позиция по умолчанию - считать любой новый маршрут, handler и background endpoint закрытым, пока он явно не объявлен публичным.

## Зачем это нужно
Большая часть неприятных инцидентов здесь рождается не из сложной криптографии, а из банального рефакторинга: новый маршрут появился, атрибут забыли, тесты смотрят только на happy-path, и в итоге в систему уехал лишний публичный вход.

## Как выглядит хорошая практика
- глобальная fallback-policy требует аутентификацию;
- публичные точки вроде login, callback, health/public status и webhooks помечаются явно;
- у админских и внутренних маршрутов есть отдельные policy, а не только факт логина;
- negative tests проверяют, что без прав доступ действительно закрыт.

## Где это особенно важно
Модульные монолиты, внутренние панели, GraphQL/BFF, технические endpoints, долгоживущие проекты после нескольких волн рефакторинга.

## Что запомнить
- Fail closed почти всегда дешевле, чем потом искать, какой маршрут остался открытым.
- Удобство разработки не должно означать "в dev всё открыто, а потом как-нибудь закроем".`, [
          link("OWASP Authorization Cheat Sheet", "https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html"),
          link("ASP.NET Core AuthorizationOptions.FallbackPolicy", "https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.authorization.authorizationoptions.fallbackpolicy?view=aspnetcore-9.0"),
          link("OWASP ASVS", "https://owasp.org/www-project-application-security-verification-standard/")
        ]),
            topic("JWT (JSON Web Token)", `## Что это
JWT - это компактный формат токена, в котором есть claims и криптографическая защита. Обычно API получает такой токен в заголовке Authorization и проверяет его локально, без серверной сессии.

## Что важно понимать
JWT может быть **подписанным** и доказать, кто его выпустил, но сам по себе не обязан быть зашифрованным. Поэтому нельзя складывать туда то, что не должно попасть в логи, браузерные инструменты или сторонние сервисы.

## Что обязательно проверять
- допустимый алгоритм подписи;
- issuer и audience;
- сроки exp и nbf;
- ключ подписи и его ротацию;
- claims, которые реально дают право на конкретную операцию.

## Где команды ошибаются
Чаще всего проблемы возникают из-за слишком долгого lifetime, отсутствия проверки audience, наивной веры любому токену с знакомым claim и хранения в токене лишней бизнес-информации.

## Что запомнить
- JWT удобен для stateless-проверки, но отзыв и принудительный logout становятся отдельной задачей.
- Без строгой валидации библиотека превращается из защиты в ложное чувство безопасности.`, [
          link("RFC 7519 - JSON Web Token", "https://www.rfc-editor.org/rfc/rfc7519"),
          link("RFC 8725 - JSON Web Token Best Current Practices", "https://www.rfc-editor.org/rfc/rfc8725"),
          link("ASP.NET Core JWT Bearer Authentication", "https://learn.microsoft.com/en-us/aspnet/core/security/authentication/configure-jwt-bearer-authentication?view=aspnetcore-9.0")
        ]),
            topic("Cookies Policy", `![Матрица флагов cookie](/assets/diagrams/security/cookie-attributes-matrix.svg)

## Что это
Политика cookie определяет, кто может увидеть cookie и когда браузер её отправит: только ли по HTTPS, доступна ли она JavaScript, можно ли унести её в cross-site запрос и на какие домены она распространяется.

## На что смотреть в первую очередь
- **Secure**: cookie не должна уходить по HTTP;
- **HttpOnly**: JavaScript не должен читать auth-cookie;
- **SameSite**: контролирует cross-site отправку;
- **Domain / Path / Prefixes**: ограничивают область действия.

## Практический базовый профиль
Для аутентификационной cookie почти всегда нужен минимум: Secure, HttpOnly, осмысленный SameSite, короткий lifetime и, где возможно, префикс __Host- для host-only режима без лишнего доменного scope.

## Где важно не ошибиться
Если SPA или внешний IdP действительно требуют cross-site cookie, придётся идти на SameSite=None; Secure, но это решение должно быть осознанным и сопровождаться дополнительной защитой от CSRF.

## Что запомнить
- Cookie - это часть модели безопасности, а не просто транспорт для сессии.
- Слишком широкий domain scope и слабые флаги превращают локальную уязвимость в межсервисную.`, [
          link("MDN - Set-Cookie", "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie"),
          link("ASP.NET Core SameSite", "https://learn.microsoft.com/en-us/aspnet/core/security/samesite?view=aspnetcore-9.0")
        ]),
            topic("HSTS", `## Что это
HSTS (HTTP Strict Transport Security) - это заголовок, который говорит браузеру: этот сайт нужно открывать только по HTTPS, больше не пробуй откатываться на HTTP.

## Что он реально защищает
Он снижает риск downgrade-атак и ошибок вида "пользователь однажды зашёл по http:// и попал в небезопасную цепочку редиректов". После получения политики браузер сам поднимает схему до HTTPS.

## Что нужно учитывать перед включением
- все рабочие поддомены действительно должны поддерживать HTTPS;
- includeSubDomains и особенно preload нужно включать только после полной готовности домена;
- в development HSTS обычно отключают, чтобы не ломать локальные сценарии.

## Частое заблуждение
HSTS не заменяет TLS-настройку и не спасает самый первый визит на домен, если сайт ещё не находится в preload-списке браузеров.

## Что запомнить
- HSTS хорош как усиление уже правильно настроенного HTTPS.
- Для production-домена это одна из тех настроек, которые лучше принять как стандарт, а не как опциональную доработку.`, [
          link("RFC 6797 - HTTP Strict Transport Security", "https://www.rfc-editor.org/rfc/rfc6797"),
          link("ASP.NET Core Enforce HTTPS / HSTS", "https://learn.microsoft.com/en-us/aspnet/core/security/enforcing-ssl?view=aspnetcore-9.0")
        ]),
            topic("Secret Storage / Vault", `![Поток загрузки секретов](/assets/diagrams/security/secret-sources.svg)

## Что это
Секреты - это пароли, connection strings, signing keys, client secrets и токены, которые нельзя хранить рядом с кодом и конфигурацией, попадающей в git.

## Как выглядит зрелая схема
- в локальной разработке используются user secrets или локальные secure stores;
- в CI и runtime секреты приходят через environment/provider-интеграции;
- production получает их из vault-сервиса по managed identity или другому короткоживущему механизму доверия;
- ротация и аудит происходят вне приложения.

## Что важно для .NET-проектов
Хорошая практика - строить конфигурацию как слой providers: appsettings для несекретных значений, user secrets для dev, environment variables для deployment, Key Vault / Vault / Secrets Manager для production.

## Где команды ошибаются
Секреты протекают не только в git. Они часто оказываются в логах, дампах, docker-образах, wiki и CI-артефактах, если вокруг них нет дисциплины доступа и маскирования.

## Что запомнить
- Лучший секрет - тот, который приложение получает в runtime и не знает заранее.
- Vault полезен не только хранением, но и политиками доступа, аудитом и ротацией.`, [
          link("OWASP Secrets Management Cheat Sheet", "https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html"),
          link("ASP.NET Core App Secrets", "https://learn.microsoft.com/en-us/aspnet/core/security/app-secrets?view=aspnetcore-9.0"),
          link("ASP.NET Core Key Vault Configuration Provider", "https://learn.microsoft.com/en-us/aspnet/core/security/key-vault-configuration?view=aspnetcore-9.0")
        ]),
            topic("CSRF / Antiforgery", `![Защита от CSRF](/assets/diagrams/security/csrf-defense.svg)

## Что это
CSRF возникает там, где браузер сам прикладывает учётные данные к запросу: обычно cookie или встроенную browser-auth схему. Злоумышленнику достаточно заставить браузер жертвы отправить запрос на доверенный сайт.

## Когда риск особенно реален
Cookie-based MVC, Razor Pages, BFF, административные панели и любые формы, где браузер уже "авторизован" и может silently отправить POST/PUT/DELETE на ваш origin.

## Как защищаются на практике
- antiforgery token или специальный заголовок с проверкой происхождения;
- осмысленный SameSite для cookie;
- проверка Origin/Referer там, где это уместно;
- разделение read-only и state-changing запросов.

## Важный нюанс
Если фронтенд использует короткоживущий bearer-token в заголовке Authorization и не опирается на автоматически отправляемые cookies, то классический CSRF-риск сильно ниже. Но это не отменяет других угроз, например XSS.

## Что запомнить
- Antiforgery нужен не "вообще для всех API", а там, где браузер способен отправить аутентифицированный запрос без участия пользователя.
- SameSite помогает, но не должен быть единственной линией защиты.`, [
          link("OWASP CSRF Prevention Cheat Sheet", "https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html"),
          link("ASP.NET Core Antiforgery", "https://learn.microsoft.com/en-us/aspnet/core/security/anti-request-forgery?view=aspnetcore-9.0")
        ]),
            topic("CORS", `![CORS и preflight](/assets/diagrams/security/cors-preflight.svg)

## Что это
CORS - это браузерный механизм, который решает, может ли JavaScript одного origin читать ответ от другого origin. Он работает поверх HTTP-заголовков и часто включает preflight-запрос OPTIONS.

## Что CORS не делает
CORS не является заменой аутентификации и авторизации. Если запрос идёт из curl, Postman или серверного кода, браузерных ограничений просто нет. Поэтому политика CORS не должна восприниматься как защита от неавторизованного вызова API.

## Как настраивать безопасно
- перечислять точные origins вместо широких масок;
- разрешать только нужные методы и заголовки;
- не комбинировать credentials с AllowAnyOrigin;
- помнить, что preflight кешируется браузером и влияет на UX.

## Где команды чаще ошибаются
Типичный анти-паттерн - открыть CORS максимально широко, чтобы "быстро заработало", а потом забыть вернуть политику в нормальное состояние. Второй - путать проблемы SPA-интеграции с реальной моделью доступа к данным.

## Что запомнить
- CORS решает вопрос доступа браузерного кода к ответу, а не вопрос того, кто имеет право вызвать бизнес-операцию.
- Чем уже allowlist origins, тем меньше шанс случайно открыть лишний front-end канал.`, [
          link("MDN - Cross-Origin Resource Sharing", "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS"),
          link("ASP.NET Core CORS", "https://learn.microsoft.com/en-us/aspnet/core/security/cors?view=aspnetcore-9.0")
        ])
    ]
  }
];

// ── Config ────────────────────────────────────────────────────────────────────
const SHEETS_URL = 'https://script.google.com/macros/s/AKfycbw9J7VGBV5hLNVVNM1KpCg6Zy0Nf2dzNkHQ_ZLBpYe9JiJZH1zogdVvUAMo08oICszLUw/exec';
const STORAGE_KEY = 'devkb_learned';

// ── Local state ───────────────────────────────────────────────────────────────
let learned = {};
try { learned = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch(e) {}
function saveLearned() { localStorage.setItem(STORAGE_KEY, JSON.stringify(learned)); }

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

async function deleteCommentFromSheets(payload) {
  const params = new URLSearchParams({ action: 'deleteComment' });
  Object.entries(payload).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') params.set(k, String(v));
  });

  try {
    const r = await fetch(`${SHEETS_URL}?${params.toString()}`, { signal: AbortSignal.timeout(8000) });
    if (!r.ok) throw new Error('Не удалось удалить комментарий');

    const d = await r.json();
    if (!d || typeof d !== 'object')
      throw new Error('Не удалось удалить комментарий');

    if (d.error) {
      if (String(d.error).toLowerCase().includes('unknown action')) {
        throw new Error('Удаление комментариев пока не поддерживается на сервере');
      }

      throw new Error(String(d.error));
    }

    return d;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error('Не удалось удалить комментарий');
  }
}

function normalizeComment(comment) {
  return {
    id: comment.id || `${comment.topicKey}-${comment.createdAt || Date.now()}`,
    topicKey: comment.topicKey || '',
    topicTitle: comment.topicTitle || '',
    sectionId: comment.sectionId || '',
    sectionTitle: comment.sectionTitle || '',
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

function removeCommentLocally({ topicKey, id, createdAt }) {
  const comments = commentsByTopic[topicKey];
  if (!Array.isArray(comments) || comments.length === 0) return null;

  const index = comments.findIndex(comment =>
    (id !== undefined && id !== null && String(comment.id) === String(id)) ||
    (createdAt && comment.createdAt === createdAt));

  if (index === -1) return null;

  const [removed] = comments.splice(index, 1);
  return removed ?? null;
}

async function submitComment(payload) {
  const trimmedComment = (payload.comment || '').trim();

  if (!payload.topicKey) throw new Error('topicKey is required');
  if (!trimmedComment) throw new Error('comment is required');

  const remote = await addCommentToSheets({
    topicKey: payload.topicKey,
    topicTitle: payload.topicTitle,
    sectionId: payload.sectionId,
    sectionTitle: payload.sectionTitle,
    comment: trimmedComment
  });

  if (!remote) throw new Error('Не удалось сохранить комментарий');

  return rememberCommentLocally({
    topicKey: payload.topicKey,
    topicTitle: payload.topicTitle,
    sectionId: payload.sectionId,
    sectionTitle: payload.sectionTitle,
    comment: remote.comment || trimmedComment,
    createdAt: remote.createdAt || new Date().toISOString()
  });
}

async function deleteComment(payload) {
  if (!payload.topicKey) throw new Error('topicKey is required');
  if (
    (payload.id === undefined || payload.id === null || payload.id === '') &&
    !payload.createdAt
  ) {
    throw new Error('comment identifier is required');
  }

  await deleteCommentFromSheets({
    id: payload.id,
    topicKey: payload.topicKey,
    createdAt: payload.createdAt
  });

  return removeCommentLocally({
    topicKey: payload.topicKey,
    id: payload.id,
    createdAt: payload.createdAt
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







