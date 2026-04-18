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
const md = (...lines) => lines.join("\n");

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
            topic("Entity", [
              '# DDD Entity в C# .NET — описание и примеры',
              '',
              '## Введение',
              '',
              'В Domain-Driven Design (DDD) **Entity** — это объект, который определяется своей **идентичностью**, а не только значением.',
              '',
              'Простое правило:',
              '',
              '> Если два объекта могут иметь одинаковые данные, но это всё равно разные объекты — это Entity.',
              '',
              'Примеры:',
              '',
              '* Пользователь (`User`)',
              '* Заказ (`Order`)',
              '* Товар в заказе (`OrderItem`)',
              '* Банковский счёт (`BankAccount`)',
              '',
              'Даже если все поля совпадают, это всё равно разные сущности, если у них разные идентификаторы.',
              '',
              '---',
              '',
              '## Основные характеристики Entity',
              '',
              '### 1. Идентичность (Identity)',
              '',
              'Каждая сущность имеет уникальный идентификатор:',
              '',
              '```csharp',
              'public Guid Id { get; protected set; }',
              '```',
              '',
              'Именно `Id`, а не набор полей, определяет равенство.',
              '',
              '---',
              '',
              '### 2. Жизненный цикл',
              '',
              'Entity существует во времени:',
              '',
              '* создаётся;',
              '* изменяется;',
              '* может быть удалена;',
              '* может хранить историю изменений.',
              '',
              '---',
              '',
              '### 3. Изменяемость',
              '',
              'В отличие от Value Object, Entity — изменяемая:',
              '',
              '```csharp',
              'user.ChangeEmail("new@email.com");',
              '```',
              '',
              '---',
              '',
              '### 4. Поведение, а не только данные',
              '',
              'Entity должна содержать бизнес-логику:',
              '',
              'Плохо:',
              '',
              '```csharp',
              'user.Email = "test@mail.com";',
              '```',
              '',
              'Хорошо:',
              '',
              '```csharp',
              'user.ChangeEmail("test@mail.com");',
              '```',
              '',
              '---',
              '',
              '## Entity vs Value Object',
              '',
              '| Характеристика | Entity | Value Object |',
              '| -------------- | ------ | ------------ |',
              '| Идентичность | Есть | Нет |',
              '| Изменяемость | Да | Нет (immutable) |',
              '| Сравнение | По Id | По значениям |',
              '| Жизненный цикл | Есть | Нет |',
              '',
              '---',
              '',
              '# Базовый класс Entity',
              '',
              '## Минимальная реализация',
              '',
              '```csharp',
              'namespace Demo.Domain.Abstractions;',
              '',
              'public abstract class Entity<TId>',
              '    where TId : notnull',
              '{',
              '    public TId Id { get; protected set; } = default!;',
              '}',
              '```',
              '',
              '---',
              '',
              '## Расширенная версия (с equality)',
              '',
              '```csharp',
              'namespace Demo.Domain.Abstractions;',
              '',
              'public abstract class Entity<TId>',
              '    where TId : notnull',
              '{',
              '    public TId Id { get; protected set; } = default!;',
              '',
              '    public override bool Equals(object? obj)',
              '    {',
              '        if (obj is not Entity<TId> other)',
              '            return false;',
              '',
              '        if (ReferenceEquals(this, other))',
              '            return true;',
              '',
              '        return Id.Equals(other.Id);',
              '    }',
              '',
              '    public override int GetHashCode()',
              '    {',
              '        return Id.GetHashCode();',
              '    }',
              '}',
              '```',
              '',
              '### Почему equality по Id',
              '',
              'Потому что:',
              '',
              '```csharp',
              'var user1 = new User(id: 1, "A");',
              'var user2 = new User(id: 1, "B");',
              '',
              '// это одна и та же сущность',
              '```',
              '',
              '---',
              '',
              '# Пример простой Entity: User',
              '',
              '```csharp',
              'using Demo.Domain.Abstractions;',
              '',
              'namespace Demo.Domain.Users;',
              '',
              'public sealed class User : Entity<Guid>',
              '{',
              '    public string Email { get; private set; }',
              '    public string Name { get; private set; }',
              '',
              '    private User()',
              '    {',
              '    }',
              '',
              '    public User(Guid id, string email, string name)',
              '    {',
              '        Id = id;',
              '        ChangeEmail(email);',
              '        ChangeName(name);',
              '    }',
              '',
              '    public void ChangeEmail(string email)',
              '    {',
              '        if (string.IsNullOrWhiteSpace(email))',
              '            throw new DomainException("Email is required.");',
              '',
              '        Email = email;',
              '    }',
              '',
              '    public void ChangeName(string name)',
              '    {',
              '        if (string.IsNullOrWhiteSpace(name))',
              '            throw new DomainException("Name is required.");',
              '',
              '        Name = name;',
              '    }',
              '}',
              '```',
              '',
              '---',
              '',
              '# Entity внутри Aggregate Root',
              '',
              'Очень важно:',
              '',
              '> Большинство Entity живут внутри Aggregate Root и не используются напрямую снаружи.',
              '',
              'Пример: `OrderItem` внутри `Order`.',
              '',
              '## Пример',
              '',
              '```csharp',
              'public sealed class OrderItem : Entity<Guid>',
              '{',
              '    public Guid ProductId { get; private set; }',
              '    public int Quantity { get; private set; }',
              '',
              '    internal OrderItem(Guid productId, int quantity)',
              '    {',
              '        if (quantity <= 0)',
              '            throw new DomainException("Quantity must be greater than zero.");',
              '',
              '        Id = Guid.NewGuid();',
              '        ProductId = productId;',
              '        Quantity = quantity;',
              '    }',
              '',
              '    internal void ChangeQuantity(int quantity)',
              '    {',
              '        if (quantity <= 0)',
              '            throw new DomainException("Quantity must be greater than zero.");',
              '',
              '        Quantity = quantity;',
              '    }',
              '}',
              '```',
              '',
              '### Почему `internal`',
              '',
              'Чтобы запретить изменение сущности извне агрегата:',
              '',
              '```csharp',
              'orderItem.ChangeQuantity(10); // нельзя из application слоя',
              '```',
              '',
              'Только Aggregate Root управляет:',
              '',
              '```csharp',
              'order.ChangeItemQuantity(productId, 10);',
              '```',
              '',
              '---',
              '',
              '# Entity и инварианты',
              '',
              'Entity может иметь собственные инварианты:',
              '',
              '```csharp',
              'if (quantity <= 0)',
              '    throw new DomainException("Quantity must be greater than zero.");',
              '```',
              '',
              'Но:',
              '',
              '* локальные правила — внутри Entity;',
              '* глобальные правила агрегата — в Aggregate Root.',
              '',
              '---',
              '',
              '# Entity и Domain Events',
              '',
              'Есть 2 подхода:',
              '',
              '## Подход 1 (рекомендуемый)',
              '',
              'Entity не генерирует события напрямую.',
              '',
              'Aggregate Root делает это:',
              '',
              '```csharp',
              'item.ChangeQuantity(quantity);',
              'RaiseDomainEvent(...);',
              '```',
              '',
              '## Подход 2',
              '',
              'Entity генерирует события, а root их собирает.',
              '',
              'Это сложнее и используется реже.',
              '',
              '---',
              '',
              '# Пример использования в CQRS',
              '',
              '## Команда',
              '',
              '```csharp',
              'public record ChangeUserEmailCommand(Guid UserId, string Email);',
              '```',
              '',
              '## Handler',
              '',
              '```csharp',
              'public class ChangeUserEmailHandler',
              '{',
              '    private readonly IUserRepository _repository;',
              '    private readonly IUnitOfWork _uow;',
              '',
              '    public ChangeUserEmailHandler(IUserRepository repository, IUnitOfWork uow)',
              '    {',
              '        _repository = repository;',
              '        _uow = uow;',
              '    }',
              '',
              '    public async Task Handle(ChangeUserEmailCommand command)',
              '    {',
              '        var user = await _repository.GetByIdAsync(command.UserId)',
              '            ?? throw new DomainException("User not found");',
              '',
              '        user.ChangeEmail(command.Email);',
              '',
              '        await _uow.SaveChangesAsync();',
              '    }',
              '}',
              '```',
              '',
              '### Важно',
              '',
              '* handler НЕ содержит бизнес-логики;',
              '* вся логика внутри Entity;',
              '* handler только orchestrates.',
              '',
              '---',
              '',
              '# Частые ошибки',
              '',
              '## 1. Анемичная Entity',
              '',
              'Плохо:',
              '',
              '```csharp',
              'public class User',
              '{',
              '    public string Email { get; set; }',
              '}',
              '```',
              '',
              'Хорошо:',
              '',
              '```csharp',
              'public void ChangeEmail(string email)',
              '```',
              '',
              '---',
              '',
              '## 2. Публичные set-теры',
              '',
              '```csharp',
              'public string Email { get; set; }',
              '```',
              '',
              'Ломает инварианты.',
              '',
              '---',
              '',
              '## 3. Сравнение по всем полям',
              '',
              'Entity сравнивается только по `Id`.',
              '',
              '---',
              '',
              '## 4. Использование Entity как DTO',
              '',
              'Entity — это не просто контейнер данных.',
              '',
              '---',
              '',
              '## 5. Нарушение границ агрегата',
              '',
              'Работа с Entity напрямую:',
              '',
              '```csharp',
              'orderItemRepository.Save(item);',
              '```',
              '',
              'Это ломает DDD.',
              '',
              '---',
              '',
              '# Практические рекомендации',
              '',
              '## Когда делать Entity',
              '',
              'Используй Entity, если:',
              '',
              '* нужен уникальный Id;',
              '* есть жизненный цикл;',
              '* есть поведение;',
              '* состояние меняется со временем.',
              '',
              '---',
              '',
              '## Когда НЕ делать Entity',
              '',
              'Не нужно, если:',
              '',
              '* объект описывается только значением;',
              '* нет жизненного цикла;',
              '* нет идентичности.',
              '',
              'Тогда это Value Object.',
              '',
              '---',
              '',
              '## Где создавать Entity',
              '',
              '* внутри Aggregate Root;',
              '* через фабричные методы;',
              '* с валидацией.',
              '',
              '---',
              '',
              '## Как ограничивать доступ',
              '',
              '* `private set`;',
              '* `internal` методы;',
              '* отсутствие публичных коллекций;',
              '',
              '---',
              '',
              '# Итог',
              '',
              'Entity в DDD — это:',
              '',
              '* объект с идентичностью;',
              '* изменяемый во времени;',
              '* содержащий бизнес-логику;',
              '* защищающий свои инварианты;',
              '* управляемый через Aggregate Root (если входит в агрегат).',
              '',
              'Хорошая Entity:',
              '',
              '* имеет `Id`;',
              '* не раскрывает set-теры;',
              '* содержит методы с бизнес-смыслом;',
              '* валидирует входные данные;',
              '* не используется как DTO;',
              '* не нарушает границы агрегата.'
            ].join('\n'), [
          link("Martin Fowler — Domain Driven Design", "https://martinfowler.com/bliki/DomainDrivenDesign.html"),
          link("Martin Fowler — Evans Classification", "https://martinfowler.com/bliki/EvansClassification.html"),
          link("Microsoft Learn — microservice domain model", "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/net-core-microservice-domain-model"),
          link("Microsoft Learn — domain model validations", "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/domain-model-layer-validations")
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
            topic("Миграции", [
              '<img src="/assets/diagrams/efcore/migrations-pipeline.svg" alt="Как работают миграции EF Core" style="max-width:100%;height:auto;display:block;margin:12px 0;border:1px solid rgba(255,255,255,0.08);border-radius:12px;background:#0b1020" />',
              '',
              '## Обзор',
              'Миграции в Entity Framework Core - это механизм управления схемой базы данных через код приложения.',
              '',
              'Они позволяют:',
              '',
              '- версионировать структуру БД',
              '- автоматически применять изменения',
              '- синхронизировать модель и базу',
              '',
              '## Как это работает',
              'EF Core отслеживает изменения между текущей моделью `DbContext` и последним сохраненным состоянием `ModelSnapshot`. На основе этого diff генерируется миграция, а факт применения хранится в таблице `__EFMigrationsHistory`.',
              '',
              'На практике это означает две вещи: миграция хранит C#-операции `Up()` и `Down()`, а SQL получается уже под конкретный провайдер в момент генерации скрипта, bundle или применения к базе.',
              '',
              '| Артефакт | Роль |',
              '| --- | --- |',
              '| `DbContext` и конфигурации | Описывают актуальную модель данных |',
              '| `ModelSnapshot` | Хранит последнее состояние модели для вычисления diff |',
              '| Класс миграции | Содержит операции `Up()` и `Down()` |',
              '| `__EFMigrationsHistory` | Показывает, какие миграции уже применены к конкретной базе |',
              '',
              '## Структура миграции',
              '```csharp',
              'public partial class AddUsers : Migration',
              '{',
              '    protected override void Up(MigrationBuilder migrationBuilder)',
              '    {',
              '        migrationBuilder.CreateTable(',
              '            name: "users",',
              '            columns: table => new',
              '            {',
              '                Id = table.Column<Guid>(nullable: false),',
              '                Name = table.Column<string>(nullable: false)',
              '            },',
              '            constraints: table =>',
              '            {',
              '                table.PrimaryKey("PK_users", x => x.Id);',
              '            });',
              '    }',
              '',
              '    protected override void Down(MigrationBuilder migrationBuilder)',
              '    {',
              '        migrationBuilder.DropTable("users");',
              '    }',
              '}',
              '```',
              '',
              '| Метод | Назначение |',
              '| --- | --- |',
              '| `Up()` | Применяет изменение схемы |',
              '| `Down()` | Откатывает изменение |',
              '',
              '## Основные команды',
              '```bash',
              'dotnet ef migrations add AddUsers',
              'dotnet ef database update',
              'dotnet ef migrations bundle',
              '```',
              '',
              'Обычный безопасный цикл такой: создать миграцию, прочитать сгенерированный код и SQL, затем применять ее в нужной среде.',
              '',
              '## Конфигурация сущностей через Fluent API',
              'В DDD-проектах конфигурации обычно выносят в слой `Infrastructure`, а доменные сущности не засоряют EF-атрибутами.',
              '',
              '```csharp',
              'public class UserConfiguration : IEntityTypeConfiguration<User>',
              '{',
              '    public void Configure(EntityTypeBuilder<User> builder)',
              '    {',
              '        builder.ToTable("users");',
              '',
              '        builder.HasKey(x => x.Id);',
              '',
              '        builder.Property(x => x.Name)',
              '            .HasMaxLength(100)',
              '            .IsRequired();',
              '',
              '        builder.HasIndex(x => x.Name);',
              '    }',
              '}',
              '```',
              '',
              'Подключение конфигураций:',
              '',
              '```csharp',
              'protected override void OnModelCreating(ModelBuilder modelBuilder)',
              '{',
              '    modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);',
              '}',
              '```',
              '',
              '## Работа с DDD',
              'Ключевая идея: домен не должен зависеть от EF Core. EF знает про домен, но не наоборот.',
              '',
              '```csharp',
              'public class Order',
              '{',
              '    private readonly List<OrderItem> _items = new();',
              '',
              '    public IReadOnlyCollection<OrderItem> Items => _items;',
              '',
              '    public decimal Amount { get; private set; }',
              '}',
              '```',
              '',
              '```csharp',
              'builder.OwnsMany(typeof(OrderItem), "_items", b =>',
              '{',
              '    b.ToTable("order_items");',
              '    b.WithOwner().HasForeignKey("OrderId");',
              '});',
              '```',
              '',
              'Практически это означает:',
              '',
              '- конфигурации лежат в `Infrastructure`',
              '- инкапсуляция доменной модели сохраняется',
              '- owned-коллекции и приватные поля можно маппить без раскрытия внутреннего состояния наружу',
              '',
              '## Структура проекта',
              '```text',
              'Domain',
              'Application',
              'Infrastructure',
              ' ├── DbContext',
              ' ├── Configurations',
              ' └── Migrations',
              'API',
              '```',
              '',
              '<img src="/assets/diagrams/efcore/migrations-deployment-options.svg" alt="Способы применения миграций в production" style="max-width:100%;height:auto;display:block;margin:16px 0 12px;border:1px solid rgba(255,255,255,0.08);border-radius:12px;background:#0b1020" />',
              '',
              '## Применение миграций в CI/CD',
              'В production чаще используют два подхода.',
              '',
              '### 1. Migration Bundle',
              'Рекомендуемый вариант, когда нужен отдельный исполняемый файл без зависимости от установленного .NET SDK.',
              '',
              'Создание:',
              '',
              '```bash',
              'dotnet ef migrations bundle -o efbundle.exe',
              '```',
              '',
              'Запуск:',
              '',
              '```bash',
              './efbundle.exe --connection "CONNECTION_STRING"',
              '```',
              '',
              'Особенности:',
              '',
              '- единый исполняемый файл',
              '- не требует .NET SDK на целевой машине',
              '- удобен для production и отдельного deployment job',
              '',
              '### 2. Migrations Runner',
              'Подходит, когда нужен больший контроль: отдельное приложение поднимает `DbContext` и вызывает `Database.Migrate()`.',
              '',
              '```csharp',
              'var services = new ServiceCollection();',
              '',
              'services.AddDbContext<AppDbContext>(options =>',
              '    options.UseSqlServer(Environment.GetEnvironmentVariable("CONNECTION_STRING")));',
              '',
              'var provider = services.BuildServiceProvider();',
              '',
              'using var scope = provider.CreateScope();',
              'var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();',
              '',
              'db.Database.Migrate();',
              '```',
              '',
              'Запуск:',
              '',
              '```bash',
              'dotnet MyApp.MigrationsRunner.dll',
              '```',
              '',
              'Особенности:',
              '',
              '- требует установленный runtime',
              '- его лучше запускать отдельным job или отдельным контейнером',
              '- важно исключить параллельное выполнение миграций',
              '- `Database.Migrate()` в основном приложении лучше не использовать как production-default',
              '',
              '| Критерий | Bundle | Runner |',
              '| --- | --- | --- |',
              '| Простота запуска | Да | Да |',
              '| Контроль над процессом | Ограниченный | Выше |',
              '| Работа без SDK | Да | Нет |',
              '| Гибкость сценариев | Ниже | Выше |',
              '',
              'Пример шага CI/CD для bundle:',
              '',
              '```yaml',
              '- name: Run EF bundle',
              '  run: ./efbundle.exe --connection $CONNECTION_STRING',
              '```',
              '',
              'Пример шага CI/CD для runner:',
              '',
              '```yaml',
              '- name: Run migrations runner',
              '  run: dotnet MyApp.MigrationsRunner.dll',
              '```',
              '',
              '## Типичные ошибки',
              '',
              '- ручные изменения схемы в базе в обход миграций приводят к рассинхронизации',
              '- редактирование старых миграций ломает воспроизводимость истории',
              '- конфликтующие миграции надо осознанно мерджить или пересоздавать, а не оставлять две независимые ветки изменений',
              '',
              '## Best Practices',
              '',
              '- одна миграция - одно осмысленное изменение',
              '- используйте понятные имена вроде `AddOrderStatus`',
              '- не переписывайте уже примененные миграции',
              '- держите конфигурации в `Infrastructure` и описывайте модель через Fluent API',
              '- перед production-применением просматривайте миграцию, SQL-скрипт или bundle',
              '',
              '## Рекомендуемый workflow',
              '1. Разработка',
              '',
              '```bash',
              'dotnet ef migrations add AddFeature',
              '```',
              '',
              '2. CI',
              '',
              '```bash',
              'dotnet ef migrations bundle',
              '```',
              '',
              '3. CD',
              '',
              'Вариант 1:',
              '',
              '```bash',
              './efbundle.exe',
              '```',
              '',
              'Вариант 2:',
              '',
              '```bash',
              'dotnet MyApp.MigrationsRunner.dll',
              '```',
              '',
              '## Итог',
              'Миграции в EF Core дают контроль версий схемы, автоматизацию изменений базы и предсказуемый путь выкладки. Для production-процесса безопаснее использовать Fluent API и применять миграции через bundle, script или отдельный runner, а не вызывать `Database.Migrate()` внутри основного приложения.'
            ].join("\n"), [
          link("Migrations overview", "https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/"),
          link("Managing migrations", "https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/managing"),
          link("Applying migrations", "https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/applying"),
          link("Custom migrations history table", "https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/history-table")
        ]),
            topic("Миграции как сырой SQL", md(
              '## Обзор',
              'Встроенных операций EF Core хватает не всегда. Как только нужно сделать backfill данных, создать `VIEW`, `PROCEDURE`, триггер, нестандартный индекс или выполнить провайдер-специфичную команду, в миграции появляется `migrationBuilder.Sql()`.',
              '',
              'Это не альтернатива миграциям, а расширение миграции. Основная идея такая: структура схемы по-прежнему описывается через EF-операции, а точечные вещи, которые EF выразить не умеет, добавляются как явный SQL.',
              '',
              '## Когда это действительно нужно',
              '- перенос данных между старой и новой схемой',
              '- вычисление значений перед добавлением `NOT NULL` или нового индекса',
              '- создание объектов базы, которые EF не моделирует напрямую',
              '- использование возможностей конкретного провайдера, которых нет в абстракции EF Core',
              '',
              '## Пример',
              '```csharp',
              'protected override void Up(MigrationBuilder migrationBuilder)',
              '{',
              '    migrationBuilder.AddColumn<string>(',
              '        name: "NormalizedName",',
              '        table: "users",',
              '        nullable: true);',
              '',
              '    migrationBuilder.Sql("""',
              '        UPDATE users',
              '        SET NormalizedName = UPPER(Name)',
              '        WHERE NormalizedName IS NULL',
              '        """);',
              '',
              '    migrationBuilder.AlterColumn<string>(',
              '        name: "NormalizedName",',
              '        table: "users",',
              '        nullable: false);',
              '}',
              '```',
              '',
              '## Важные правила',
              '- держите SQL маленьким, детерминированным и рядом с тем изменением схемы, ради которого он появился',
              '- если операция не может идти в транзакции, используйте `suppressTransaction: true`, но только осознанно',
              '- не превращайте миграцию в непрозрачный SQL-файл на сотни строк, который никто не читает перед запуском',
              '- `Sql()` не параметризует код как обычный LINQ, поэтому внутри миграций безопаснее держать только статический, заранее проверенный SQL',
              '',
              '## Что помнить про откат',
              'Для `Down()` нужно заранее решить, обратима ли операция вообще. Создание `VIEW` или индекса обычно можно откатить, а вот потеря данных после `DELETE` или агрегации часто уже необратима. Если откат неэквивалентен, это нужно понимать до выкладки, а не после.',
              '',
              '## Практика',
              'Хорошая миграция с raw SQL читается так: сначала схема подготавливается, затем SQL аккуратно переносит данные, затем схема ужесточается окончательно. Такой порядок почти всегда безопаснее, чем попытка сделать все одной командой.'
            ), [
          link("Custom migrations operations", "https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/operations"),
          link("Managing migrations", "https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/managing")
        ]),
            topic("Скрипты CI", md(
              '## Обзор',
              'Когда миграции применяются в CI/CD, часто нужен не прямой вызов `database update`, а SQL-скрипт, который можно проверить, согласовать и выполнить отдельным шагом. В EF Core для этого есть `dotnet ef migrations script`.',
              '',
              '## Зачем это нужно',
              '- SQL можно прочитать до запуска и понять, что реально изменится в БД',
              '- script удобно хранить как артефакт pipeline',
              '- его можно передать DBA или security-review',
              '- он уменьшает риск случайного запуска миграций с локальной машины разработчика',
              '',
              '## Основные команды',
              '```bash',
              'dotnet ef migrations script',
              'dotnet ef migrations script InitialCreate AddUsers',
              'dotnet ef migrations script --idempotent',
              '```',
              '',
              'Типовые варианты:',
              '',
              '| Команда | Когда использовать |',
              '| --- | --- |',
              '| `script` | получить полный путь от начала истории до последней миграции |',
              '| `script from to` | сгенерировать SQL только между двумя версиями |',
              '| `script --idempotent` | одна и та же база в окружениях может находиться на разной миграции |',
              '',
              '## Как это обычно выглядит в pipeline',
              '1. На CI собирается приложение и генерируется SQL-скрипт.',
              '2. Скрипт проверяется на staging или тестовой копии базы.',
              '3. На CD запускается именно этот проверенный артефакт.',
              '',
              '## На что обратить внимание',
              '- script всегда провайдер-специфичен: SQL Server и PostgreSQL получат разный SQL',
              '- идемпотентность решает только вопрос истории миграций, но не лечит ручной drift схемы',
              '- если миграция содержит сырой SQL, его особенно важно смотреть глазами до production',
              '',
              '## Практика',
              'Если в компании миграции проходят через DBA или change-management, скрипты почти всегда удобнее bundle и почти всегда безопаснее прямого `database update` из runtime-приложения.'
            ), [
          link("Applying migrations", "https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/applying"),
          link("Managing migrations", "https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/managing"),
          link("Custom migrations history table", "https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/history-table")
        ]),
            topic("CRUD + транзакции", md(
              '## Обзор',
              'В EF Core единица работы обычно выглядит как `DbContext` + один или несколько вызовов `SaveChanges()`. По умолчанию один `SaveChanges()` уже оборачивается в транзакцию, поэтому обычный create/update/delete-сценарий чаще всего не требует ручного `BEGIN TRANSACTION`.',
              '',
              '## Когда достаточно стандартного поведения',
              '- один `DbContext`',
              '- один вызов `SaveChanges()`',
              '- нет дополнительного raw SQL или внешних побочных эффектов внутри той же атомарной операции',
              '',
              '## Когда нужна явная транзакция',
              '- несколько `SaveChanges()` должны либо пройти вместе, либо откатиться вместе',
              '- между ними есть чтение, проверка инварианта или raw SQL',
              '- нужно синхронизировать несколько репозиториев в рамках одного use case',
              '',
              '```csharp',
              'await using var tx = await db.Database.BeginTransactionAsync();',
              '',
              'var order = new Order(...);',
              'db.Orders.Add(order);',
              'await db.SaveChangesAsync();',
              '',
              'await db.Database.ExecuteSqlRawAsync(',
              '    "UPDATE inventory SET Reserved = Reserved + {0} WHERE ProductId = {1}",',
              '    quantity, productId);',
              '',
              'order.MarkAsConfirmed();',
              'await db.SaveChangesAsync();',
              '',
              'await tx.CommitAsync();',
              '```',
              '',
              '## Важные детали',
              '- внутри уже открытой транзакции EF Core может использовать savepoint перед `SaveChanges()`, чтобы частичная ошибка не убила всю долгую транзакцию сразу',
              '- ручные транзакции надо держать короткими: чем дольше они живут, тем выше конкуренция и блокировки',
              '- retrying execution strategies и ручное управление транзакцией требуют отдельного внимания, иначе ретраи могут работать не так, как ожидается',
              '',
              '## Что важно в DDD/APP слое',
              'Транзакция должна совпадать с business use case, а не с количеством репозиториев. Если сценарий постоянно требует несколько раз пересекать границу агрегата в одной транзакции, это часто сигнал, что модель или orchestration стоит пересмотреть.',
              '',
              '## Практика',
              'Хорошее правило простое: сначала доверьтесь стандартному `SaveChanges()`, а ручную транзакцию добавляйте только тогда, когда у вас действительно больше одной точки записи в рамках одного атомарного сценария.'
            ), [
          link("Transactions", "https://learn.microsoft.com/en-us/ef/core/saving/transactions"),
          link("DbContext lifetime and configuration", "https://learn.microsoft.com/en-us/ef/core/dbcontext-configuration/")
        ]),
            topic("Модели отношений", md(
              '<img src="/assets/diagrams/efcore/relationships-map.svg" alt="Карта отношений" style="max-width:100%;height:auto;display:block;margin:12px 0;border:1px solid rgba(255,255,255,0.08);border-radius:12px;background:#0b1020" />',
              '',
              '## Обзор',
              'Отношения в EF Core строятся вокруг foreign key. Один конец связи является `principal`, другой `dependent`, а модель выражается через навигации, ключи и правила удаления.',
              '',
              '## Что нужно держать в голове',
              '- кардинальность определяет форму связи: one-to-one, one-to-many, many-to-many',
              '- FK определяет, где физически хранится ссылка',
              '- навигации делают граф удобным для кода, но не заменяют сам FK',
              '- optional/required отношение влияет на `NULL`, каскадное удаление и доменные ограничения',
              '',
              '## Пример one-to-many',
              '```csharp',
              'builder.HasMany(x => x.Items)',
              '    .WithOne()',
              '    .HasForeignKey("OrderId")',
              '    .IsRequired()',
              '    .OnDelete(DeleteBehavior.Cascade);',
              '```',
              '',
              '## Практические сценарии',
              '| Тип | Когда уместен |',
              '| --- | --- |',
              '| one-to-many | агрегат с коллекцией дочерних объектов |',
              '| one-to-one | зависимая часть с тем же жизненным циклом |',
              '| many-to-many | связь между двумя наборами сущностей, если у самой связи нет отдельного поведения |',
              '',
              'Если у many-to-many появляется payload вроде даты присоединения, роли или статуса, лучше делать явную join-сущность, а не полагаться только на skip navigations.',
              '',
              '## Частые ошибки',
              '- пытаться моделировать отношение только через навигации без явного понимания, где FK',
              '- не замечать, что required-связь меняет поведение удаления',
              '- тащить через отношение данные, которые по смыслу должны быть просто value object или owned type',
              '',
              '## Что важно для DDD',
              'Не каждую связь из базы стоит экспонировать в доменной модели как прямую навигацию. Иногда для агрегата важнее держать только идентификатор внешнего объекта и не размывать границы загрузкой большого графа.'
            ), [
          link("Relationships overview", "https://learn.microsoft.com/en-us/ef/core/modeling/relationships"),
          link("Foreign and principal keys in relationships", "https://learn.microsoft.com/en-us/ef/core/modeling/relationships/foreign-and-principal-keys"),
          link("Relationship navigations", "https://learn.microsoft.com/en-us/ef/core/modeling/relationships/navigations")
        ]),
            topic("Варианты хранения подсущности", md(
              '<img src="/assets/diagrams/efcore/owned-types-storage.svg" alt="Варианты хранения owned type" style="max-width:100%;height:auto;display:block;margin:12px 0;border:1px solid rgba(255,255,255,0.08);border-radius:12px;background:#0b1020" />',
              '',
              '## Обзор',
              'Когда часть модели не имеет собственной идентичности и живет только вместе с владельцем, в EF Core для этого обычно используют owned types. Это хороший способ маппить value object или вложенную часть агрегата, не превращая ее в отдельный самостоятельный root.',
              '',
              '## Основные варианты хранения',
              '| Вариант | Когда подходит |',
              '| --- | --- |',
              '| та же таблица | маленький value object, всегда читается вместе с владельцем |',
              '| отдельная таблица | данных много или это коллекция `OwnsMany` |',
              '| JSON-колонка | провайдер поддерживает JSON, а структура логически вложенная и не требует полноценной реляционной формы |',
              '',
              '## Пример',
              '```csharp',
              'builder.OwnsOne(x => x.Address, b =>',
              '{',
              '    b.Property(x => x.City).HasMaxLength(100);',
              '    b.Property(x => x.Street).HasMaxLength(200);',
              '});',
              '',
              'builder.OwnsMany(x => x.Items, b =>',
              '{',
              '    b.ToTable("order_items");',
              '    b.WithOwner().HasForeignKey("OrderId");',
              '});',
              '```',
              '',
              '## Что важно понимать',
              '- owned type не живет отдельно от владельца и не должен иметь собственный `DbSet`',
              '- для `OwnsMany` EF все равно нужен ключ строки в таблице, даже если в доменной модели это не самостоятельная сущность',
              '- если вложенный объект начинает жить отдельной жизнью, иметь собственные ссылки и самостоятельные сценарии загрузки, это уже кандидат в обычную сущность',
              '',
              '## Практика',
              'Хороший стартовый вопрос такой: существует ли этот объект сам по себе вне владельца? Если нет, owned type почти всегда сильнее, чем отдельная таблица с самостоятельным репозиторием.'
            ), [
          link("Owned entity types", "https://learn.microsoft.com/en-us/ef/core/modeling/owned-entities"),
          link("What's New in EF Core 7.0", "https://learn.microsoft.com/en-us/ef/core/what-is-new/ef-core-7.0/whatsnew")
        ]),
            topic("Сложные свойства (Value Conversions)", md(
              '<img src="/assets/diagrams/efcore/value-conversion-flow.svg" alt="Поток value conversion" style="max-width:100%;height:auto;display:block;margin:12px 0;border:1px solid rgba(255,255,255,0.08);border-radius:12px;background:#0b1020" />',
              '',
              '## Обзор',
              '`ValueConverter` нужен, когда доменный тип отличается от того, что база реально умеет хранить. EF Core получает функцию преобразования в сторону провайдера и обратно и вставляет их в pipeline чтения и записи.',
              '',
              '## Типовые случаи',
              '- enum хранится как строка, а не как число',
              '- strongly typed id оборачивает `Guid`, `int` или `long`',
              '- value object сериализуется в строку, JSON или набор байтов',
              '',
              '## Пример',
              '```csharp',
              'builder.Property(x => x.Status)',
              '    .HasConversion<string>();',
              '',
              'builder.Property(x => x.CustomerId)',
              '    .HasConversion(',
              '        id => id.Value,',
              '        value => new CustomerId(value));',
              '```',
              '',
              '## Где часто ошибаются',
              'Если тип mutable, ссылочный или представляет собой коллекцию, одного converter мало. Change tracker должен еще уметь корректно сравнивать значения, и здесь появляется `ValueComparer`.',
              '',
              '```csharp',
              'builder.Property(x => x.Tags)',
              '    .HasConversion(',
              '        v => string.Join(";", v),',
              '        v => v.Split(";", StringSplitOptions.RemoveEmptyEntries).ToList())',
              '    .Metadata.SetValueComparer(new ValueComparer<List<string>>(',
              '        (a, b) => a.SequenceEqual(b),',
              '        v => v.Aggregate(0, (h, x) => HashCode.Combine(h, x.GetHashCode())),',
              '        v => v.ToList()));',
              '```',
              '',
              '## Что важно знать заранее',
              '- converter меняет форму хранения, а comparer отвечает за сравнение в памяти',
              '- не всякая сложная сериализация хорошо подходит для индексов и SQL-фильтрации',
              '- чем более специальный формат хранения вы выбираете, тем сильнее модель привязывается к конкретному способу запросов',
              '',
              '## Практика',
              'Для value conversions лучше всего работают маленькие, immutable типы с ясной семантикой. Если свойство часто фильтруется, сортируется или индексируется, заранее подумайте, не станет ли простая колонка или owned type лучше, чем сериализация.'
            ), [
          link("Value conversions", "https://learn.microsoft.com/en-us/ef/core/modeling/value-conversions"),
          link("Value comparers", "https://learn.microsoft.com/en-us/ef/core/modeling/value-comparers"),
          link("Change detection and notifications", "https://learn.microsoft.com/en-us/ef/core/change-tracking/change-detection")
        ]),
            topic("PK: составной ключ", md(
              '## Обзор',
              'Составной первичный ключ нужен там, где идентичность строки естественно описывается несколькими полями вместе: например, join-таблица, строка детализации внутри документа или естественный ключ наподобие `CountryCode + TaxNumber`.',
              '',
              '## Пример',
              '```csharp',
              'builder.HasKey(x => new { x.OrderId, x.LineNo });',
              '```',
              '',
              '## Что важно знать',
              '- порядок полей в составном ключе важен и должен совпадать с порядком в FK и индексе',
              '- каждый внешний ключ на такую сущность тоже становится составным',
              '- изменить значение части PK обычно гораздо больнее, чем значение обычной колонки',
              '',
              '## Когда это хороший выбор',
              '- техническая join-таблица many-to-many',
              '- owned-коллекция, где элемент естественно идентифицируется владельцем и локальным номером',
              '- естественный ключ действительно стабилен и не меняется со временем',
              '',
              '## Когда лучше не делать так',
              'Если у сущности есть самостоятельная жизнь, внешний API, ссылки из других модулей и вероятность изменения одного из полей ключа, простой суррогатный ключ плюс уникальный индекс обычно практичнее, чем составной PK.',
              '',
              '## Практика',
              'Составной ключ хорошо работает как структурный инструмент, но редко хорош как основной идентификатор бизнес-сущности, которая живет долго и участвует во многих связях.'
            ), [
          link("Keys", "https://learn.microsoft.com/en-us/ef/core/modeling/keys"),
          link("Foreign and principal keys in relationships", "https://learn.microsoft.com/en-us/ef/core/modeling/relationships/foreign-and-principal-keys")
        ]),
            topic("Кластерный индекс (MSSQL)", md(
              '## Обзор',
              'В SQL Server clustered index определяет физический порядок строк в таблице. У таблицы может быть только один clustered index, и по умолчанию им часто становится primary key.',
              '',
              'Тема провайдер-специфичная: это не общий механизм EF Core, а возможность SQL Server provider.',
              '',
              '## Пример',
              '```csharp',
              'builder.HasKey(x => x.Id).IsClustered(false);',
              '',
              'builder.HasIndex(x => x.CreatedAt).IsClustered();',
              '```',
              '',
              '## Почему это важно',
              '- clustered key влияет на порядок хранения строк и на структуру некластерных индексов',
              '- случайные ключи вроде обычного `Guid` могут усиливать page split и fragmentation',
              '- последовательный ключ или дата могут быть лучше для insert-heavy таблиц, если по ним же часто читают',
              '',
              '## Когда думать об этом',
              '- очень большая таблица на SQL Server',
              '- важен порядок вставки или типовые range-запросы',
              '- primary key не лучший кандидат на физический порядок хранения',
              '',
              '## Практика',
              'Не стоит настраивать clustered index в каждой таблице просто потому, что можно. Это уже уровень физического дизайна БД, и менять его имеет смысл только под реальные профили чтения и записи.'
            ), [
          link("SQL Server provider indexes", "https://learn.microsoft.com/en-us/ef/core/providers/sql-server/indexes"),
          link("Create a clustered index - SQL Server", "https://learn.microsoft.com/en-us/sql/relational-databases/indexes/create-clustered-indexes"),
          link("Efficient querying", "https://learn.microsoft.com/en-us/ef/core/performance/efficient-querying")
        ]),
            topic("HiLo генерация ключей", md(
              '## HiLo Pattern в EF Core (.NET / C#) - описание и правила использования',
              '',
              '## Введение',
              'HiLo (High-Low) - это стратегия генерации идентификаторов, при которой:',
              '',
              '- база данных выдает редкое значение (`Hi`) через sequence',
              '- приложение генерирует несколько ID (`Low`) в памяти',
              '',
              'Это позволяет:',
              '',
              '- получать ID до вставки в БД',
              '- уменьшить количество запросов к базе',
              '- повысить производительность',
              '',
              '## Как работает HiLo',
              'Алгоритм:',
              '',
              '1. EF Core запрашивает у БД значение `Hi`.',
              '2. В памяти создается диапазон ID: `ID = Hi * blockSize + Low`.',
              '3. `Low` увеличивается локально.',
              '4. При исчерпании диапазона берется новый `Hi`.',
              '',
              '## Пример генерации',
              'При:',
              '',
              '- `blockSize = 100`',
              '- `Hi = 1`',
              '',
              'генерируются ID:',
              '',
              '- `100-199`',
              '',
              '## Поведение ID и порядок',
              '### Гарантии',
              'HiLo гарантирует:',
              '',
              '- уникальность ID',
              '- монотонный рост внутри одного диапазона',
              '',
              '### Не гарантируется',
              '- глобальный порядок вставки',
              '- отсутствие пропусков',
              '- строгая последовательность',
              '',
              '## Сценарии поведения',
              '### 1. Один инстанс приложения',
              '`100, 101, 102, 103...`',
              '',
              '- последовательность соблюдается',
              '- но возможны пропуски при перезапуске',
              '',
              '### 2. Перезапуск приложения',
              'До падения:',
              '',
              '- `100-120`',
              '',
              'После рестарта:',
              '',
              '- `200-299`',
              '',
              'Итог:',
              '',
              '- `100-120`, потом `200+`',
              '- пропущен диапазон `121-199`',
              '',
              '### 3. Несколько инстансов приложения',
              '- `Instance A -> 100-199`',
              '- `Instance B -> 200-299`',
              '',
              'Вставки могут идти так:',
              '',
              '- `100, 200, 101, 201, 102`',
              '',
              'Важно:',
              '',
              '- порядок вставки перемешивается',
              '- ID не возвращаются назад',
              '- но выглядят "несортированными"',
              '',
              '## Ключевой вывод',
              'ID всегда растут внутри блока, но глобальный порядок не гарантирован.',
              '',
              'Поэтому ID нельзя использовать как показатель времени или порядка.',
              '',
              '## Когда использовать',
              '- DDD / Aggregate Root',
              '- Domain Events, когда ID нужен до сохранения',
              '- CQRS',
              '- high-load системы',
              '- оптимизация работы с БД',
              '',
              '## Когда не использовать',
              '- нужен строго последовательный ID',
              '- ID имеет бизнес-смысл',
              '- важен порядок вставки',
              '- нужны "красивые" номера',
              '',
              '## Настройка в EF Core',
              '### Sequence',
              '```csharp',
              'modelBuilder.HasSequence<long>("EntityHiLoSequence")',
              '    .StartsAt(1)',
              '    .IncrementsBy(100);',
              '```',
              '',
              '### Конфигурация сущности',
              '```csharp',
              'modelBuilder.Entity<Order>()',
              '    .Property(x => x.Id)',
              '    .UseHiLo("EntityHiLoSequence");',
              '```',
              '',
              '### Пример Aggregate Root',
              '```csharp',
              'public class Order : AggregateRoot',
              '{',
              '    public long Id { get; private set; }',
              '',
              '    public string Number { get; private set; }',
              '',
              '    private Order() { }',
              '',
              '    public Order(string number)',
              '    {',
              '        Number = number;',
              '',
              '        AddDomainEvent(new OrderCreatedEvent(this));',
              '    }',
              '}',
              '```',
              '',
              '### Использование',
              '```csharp',
              'var order = new Order("ORD-001");',
              '',
              'context.Orders.Add(order);',
              '',
              '// ID уже есть до SaveChanges',
              'Console.WriteLine(order.Id);',
              '',
              'await context.SaveChangesAsync();',
              '```',
              '',
              '## Правила использования',
              '### 1. Только для numeric ID',
              '- `long` предпочтителен',
              '- не использовать `GUID`',
              '',
              '### 2. Размер блока (`blockSize`)',
              '- `10-100` -> стандарт',
              '- `100-1000` -> high-load',
              '',
              '### 3. Не использовать ID как бизнес-значение',
              'Плохо:',
              '',
              '- `OrderId = номер заказа`',
              '',
              'Хорошо:',
              '',
              '- `OrderNumber = отдельное поле`',
              '',
              '### 4. Допускать пропуски ID',
              'Пропуски - это нормальное поведение, а не ошибка.',
              '',
              '### 5. Использовать с Domain Events',
              '```csharp',
              'AddDomainEvent(new OrderCreatedEvent(Id));',
              '```',
              '',
              '### 6. Использовать с Unit of Work / Outbox',
              'HiLo хорошо сочетается с:',
              '',
              '- Unit of Work',
              '- Outbox Pattern',
              '- CQRS',
              '',
              '## Подводные камни',
              '### 1. Пропуски ID',
              'Причины:',
              '',
              '- падение приложения',
              '- неиспользованный диапазон',
              '- масштабирование',
              '',
              '### 2. Перемешанный порядок вставки',
              'Особенно при:',
              '',
              '- нескольких инстансах',
              '- асинхронной обработке',
              '',
              '### 3. Рост ID скачками',
              '- `100 -> 200 -> 300`',
              '',
              '### 4. Зависимость от sequence',
              'Требуется поддержка sequence в БД.',
              '',
              '## Лучшие практики',
              '- использовать `long`',
              '- не полагаться на порядок ID',
              '- хранить `CreatedAt` для сортировки',
              '- использовать отдельные sequence при необходимости',
              '- применять в high-load системах',
              '',
              '## Итог',
              'HiLo - это:',
              '',
              '- генерация ID без постоянного обращения к БД',
              '- удобство для DDD и Domain Events',
              '- высокая производительность',
              '',
              'Но:',
              '',
              '- порядок ID не гарантирован',
              '- возможны пропуски',
              '- нельзя использовать как бизнес-идентификатор'
            ), [
          link("Sequences", "https://learn.microsoft.com/en-us/ef/core/modeling/sequences"),
          link("Generated values", "https://learn.microsoft.com/en-us/ef/core/modeling/generated-properties"),
          link("SQL Server value generation", "https://learn.microsoft.com/en-us/ef/core/providers/sql-server/value-generation")
        ]),
            topic("Concurrency Tokens", md(
              '<img src="/assets/diagrams/efcore/concurrency-conflict.svg" alt="Конфликт конкурентного обновления" style="max-width:100%;height:auto;display:block;margin:12px 0;border:1px solid rgba(255,255,255,0.08);border-radius:12px;background:#0b1020" />',
              '',
              '## Обзор',
              'Concurrency Tokens в Entity Framework Core — это механизм оптимистической блокировки (optimistic concurrency control), который предотвращает потерю данных при одновременном обновлении одной и той же записи.',
              '',
              'Основная задача — обнаружить конфликт изменений и не допустить "тихого перезаписывания" данных.',
              '',
              '---',
              '',
              '## Проблема (Lost Update)',
              '',
              'Сценарий:',
              '',
              '1. Два пользователя читают одну и ту же запись',
              '2. Первый пользователь изменяет и сохраняет',
              '3. Второй пользователь сохраняет свои изменения',
              '4. Изменения первого пользователя теряются',
              '',
              '---',
              '',
              '## Как работает Concurrency Token',
              '',
              'EF Core добавляет проверку в SQL-запрос:',
              '',
              '```sql',
              'UPDATE users',
              'SET Name = @name',
              'WHERE Id = @id AND Version = @originalVersion',
              '```',
              '',
              'Если `Version` изменился:',
              '',
              '- `UPDATE` не затронет ни одной строки',
              '- EF Core выбросит `DbUpdateConcurrencyException`',
              '',
              '---',
              '',
              '## Варианты реализации',
              '',
              '### 1. RowVersion (рекомендуется для SQL Server)',
              '',
              '#### Сущность',
              '',
              '```csharp',
              'public class User',
              '{',
              '    public Guid Id { get; private set; }',
              '',
              '    public string Name { get; private set; }',
              '',
              '    public string Email { get; private set; }',
              '',
              '    public byte[] RowVersion { get; private set; }',
              '}',
              '```',
              '',
              '#### Конфигурация',
              '',
              '```csharp',
              'public class UserConfiguration : IEntityTypeConfiguration<User>',
              '{',
              '    public void Configure(EntityTypeBuilder<User> builder)',
              '    {',
              '        builder.Property(x => x.RowVersion)',
              '            .IsRowVersion();',
              '    }',
              '}',
              '```',
              '',
              'Особенности:',
              '',
              '- генерируется и обновляется базой данных',
              '- не требует ручного контроля',
              '- работает только в SQL Server',
              '',
              '---',
              '',
              '### 2. Guid Version (универсальный вариант)',
              '',
              'Используется, если нужна независимость от БД или микросервисная архитектура.',
              '',
              '#### Сущность',
              '',
              '```csharp',
              'public class User',
              '{',
              '    public Guid Id { get; private set; }',
              '',
              '    public string Name { get; private set; }',
              '',
              '    public string Email { get; private set; }',
              '',
              '    public Guid Version { get; private set; }',
              '',
              '    private User() { }',
              '',
              '    public User(string name, string email)',
              '    {',
              '        Id = Guid.NewGuid();',
              '        Name = name;',
              '        Email = email;',
              '        Version = Guid.NewGuid();',
              '    }',
              '',
              '    public void UpdateProfile(string name, string email)',
              '    {',
              '        Name = name;',
              '        Email = email;',
              '',
              '        Version = Guid.NewGuid();',
              '    }',
              '}',
              '```',
              '',
              '#### Конфигурация',
              '',
              '```csharp',
              'builder.Property(x => x.Version)',
              '    .IsConcurrencyToken();',
              '```',
              '',
              'Особенности:',
              '',
              '- версия обновляется вручную',
              '- не зависит от конкретной БД',
              '- подходит для микросервисов и event-driven систем',
              '',
              '---',
              '',
              '## Использование в Application слое',
              '',
              '### Команда',
              '',
              '```csharp',
              'public record UpdateUserCommand(',
              '    Guid Id,',
              '    string Name,',
              '    string Email,',
              '    Guid Version',
              ');',
              '```',
              '',
              '### Handler',
              '',
              '```csharp',
              'public class UpdateUserHandler : IRequestHandler<UpdateUserCommand>',
              '{',
              '    private readonly AppDbContext _context;',
              '',
              '    public UpdateUserHandler(AppDbContext context)',
              '    {',
              '        _context = context;',
              '    }',
              '',
              '    public async Task Handle(UpdateUserCommand request, CancellationToken ct)',
              '    {',
              '        var user = await _context.Users',
              '            .FirstOrDefaultAsync(x => x.Id == request.Id, ct);',
              '',
              '        if (user == null)',
              '            throw new Exception("User not found");',
              '',
              '        _context.Entry(user)',
              '            .Property(x => x.Version)',
              '            .OriginalValue = request.Version;',
              '',
              '        user.UpdateProfile(request.Name, request.Email);',
              '',
              '        await _context.SaveChangesAsync(ct);',
              '    }',
              '}',
              '```',
              '',
              'Ключевой момент:',
              '',
              '- обязательно установить `OriginalValue` для concurrency token',
              '',
              '---',
              '',
              '## Обработка конфликтов',
              '',
              '```csharp',
              'try',
              '{',
              '    await _context.SaveChangesAsync(ct);',
              '}',
              'catch (DbUpdateConcurrencyException ex)',
              '{',
              '    var entry = ex.Entries.Single();',
              '',
              '    var databaseValues = await entry.GetDatabaseValuesAsync(ct);',
              '',
              '    if (databaseValues == null)',
              '        throw new Exception("Entity was deleted");',
              '',
              '    var dbUser = (User)databaseValues.ToObject();',
              '',
              '    throw new ConcurrencyException(',
              '        "Entity was modified by another process",',
              '        dbUser.Version',
              '    );',
              '}',
              '```',
              '',
              '---',
              '',
              '## Использование в API',
              '',
              '### Response',
              '',
              '```json',
              '{',
              '  "id": "user-id",',
              '  "name": "John",',
              '  "version": "guid-or-base64"',
              '}',
              '```',
              '',
              '### Request',
              '',
              '```json',
              '{',
              '  "id": "user-id",',
              '  "name": "New Name",',
              '  "version": "guid-or-base64"',
              '}',
              '```',
              '',
              'Клиент обязан:',
              '',
              '- передавать `version` обратно при обновлении',
              '- обрабатывать конфликт',
              '',
              '---',
              '',
              '## Частые ошибки',
              '',
              '### 1. Не передается Version',
              '',
              'Без `Version`:',
              '',
              '- защита от конфликтов не работает',
              '',
              '---',
              '',
              '### 2. Использование AsNoTracking',
              '',
              '```csharp',
              'context.Users.AsNoTracking()',
              '```',
              '',
              'EF не отслеживает OriginalValues -> concurrency check не работает',
              '',
              '---',
              '',
              '### 3. Bulk операции',
              '',
              '```csharp',
              'context.Database.ExecuteSqlRaw(...)',
              '```',
              '',
              'Обходят механизм EF -> нет проверки',
              '',
              '---',
              '',
              '### 4. Не обновляется Version (Guid вариант)',
              '',
              'Если забыть:',
              '',
              '```csharp',
              'Version = Guid.NewGuid();',
              '```',
              '',
              'то:',
              '',
              '- конфликт не будет обнаружен',
              '',
              '---',
              '',
              '## RowVersion vs Guid',
              '',
              '| Критерий | RowVersion | Guid Version |',
              '| --- | --- | --- |',
              '| Генерация | БД | приложение |',
              '| Простота | высокая | средняя |',
              '| Контроль | низкий | высокий |',
              '| Кросс-БД | нет | да |',
              '| Подходит для микросервисов | ограниченно | да |',
              '',
              '---',
              '',
              '## Concurrency в микросервисной архитектуре',
              '',
              'Тот же принцип применяется за пределами БД.',
              '',
              '### 1. Версия агрегата (DDD)',
              '',
              '```csharp',
              'public abstract class AggregateRoot',
              '{',
              '    public Guid Version { get; protected set; }',
              '',
              '    protected void UpdateVersion()',
              '    {',
              '        Version = Guid.NewGuid();',
              '    }',
              '}',
              '```',
              '',
              '---',
              '',
              '### 2. События',
              '',
              '```json',
              '{',
              '  "entityId": "123",',
              '  "version": "guid",',
              '  "event": "Updated"',
              '}',
              '```',
              '',
              'Consumer:',
              '',
              '```csharp',
              'if (incoming.Version == current.Version)',
              '{',
              '    // применяем',
              '}',
              '```',
              '',
              'или:',
              '',
              '```csharp',
              'if (incoming.Version != expected)',
              '{',
              '    // конфликт или устаревшее событие',
              '}',
              '```',
              '',
              '---',
              '',
              '### 3. HTTP (ETag)',
              '',
              '```http',
              'ETag: "guid-or-base64"',
              'If-Match: "guid-or-base64"',
              '```',
              '',
              'Это тот же concurrency token на уровне API.',
              '',
              '---',
              '',
              '## Итог',
              '',
              'Concurrency Tokens:',
              '',
              '- решают проблему lost update',
              '- работают через проверку версии в `UPDATE`',
              '- требуют передачи версии между слоями',
              '- выбрасывают `DbUpdateConcurrencyException` при конфликте',
              '',
              'RowVersion:',
              '',
              '- проще и надежнее',
              '- привязан к SQL Server',
              '',
              'Guid Version:',
              '',
              '- гибче и универсальнее',
              '- требует ручного контроля',
              '',
              'В микросервисной архитектуре этот механизм расширяется до:',
              '',
              '- версии агрегатов',
              '- версий событий',
              '- `ETag` в API',
              '',
              'Это один и тот же паттерн контроля состояния, применяемый на разных уровнях системы.'
            ), [
          link("Handling concurrency conflicts", "https://learn.microsoft.com/en-us/ef/core/saving/concurrency"),
          link("Generated values", "https://learn.microsoft.com/en-us/ef/core/modeling/generated-properties"),
          link("SQL Server value generation", "https://learn.microsoft.com/en-us/ef/core/providers/sql-server/value-generation")
        ]),
            topic("Tracking vs No-Tracking", md(
              '<img src="/assets/diagrams/efcore/tracking-vs-notracking.svg" alt="Tracking versus no-tracking" style="max-width:100%;height:auto;display:block;margin:12px 0;border:1px solid rgba(255,255,255,0.08);border-radius:12px;background:#0b1020" />',
              '',
              '## Обзор',
              'Tracking query сохраняет сущности в change tracker, а no-tracking query просто материализует результат и ничего не готовит для будущего `SaveChanges()`. Это одно из самых важных решений в query layer, потому что оно влияет и на производительность, и на корректность последующего обновления.',
              '',
              '## Когда использовать tracking',
              '- запрос читается ради последующего изменения сущности',
              '- важен один экземпляр сущности в рамках `DbContext`',
              '- вы используете identity resolution и хотите работать с графом как с единым объектным состоянием',
              '',
              '## Когда использовать no-tracking',
              '- read-only API',
              '- списки, отчеты, поиск, projection в DTO',
              '- большие выборки, где tracking только тратит память и CPU',
              '',
              '## Варианты',
              '| Режим | Что дает |',
              '| --- | --- |',
              '| tracking | изменение и сохранение сущностей |',
              '| `AsNoTracking()` | минимальная цена чтения |',
              '| `AsNoTrackingWithIdentityResolution()` | без tracking, но с устранением дубликатов сущностей в результате |',
              '',
              '## Частая ошибка',
              'Прочитать сущность через no-tracking, изменить ее в памяти и ожидать, что `SaveChanges()` все поймет сам. Если запрос был no-tracking, EF не знает про этот экземпляр, и его нужно либо явно `Attach/Update`, либо сначала читать tracking-сценарием.',
              '',
              '## Практика',
              'Для большинства приложений полезный default такой: команды читают tracking, запросы на чтение - no-tracking или сразу проецируются в DTO.'
            ), [
          link("Tracking vs. no-tracking queries", "https://learn.microsoft.com/en-us/ef/core/querying/tracking"),
          link("Change tracking in EF Core", "https://learn.microsoft.com/en-us/ef/core/change-tracking/"),
          link("Efficient querying", "https://learn.microsoft.com/en-us/ef/core/performance/efficient-querying")
        ]),
            topic("Загрузка связанных данных", md(
              '<img src="/assets/diagrams/efcore/loading-strategies.svg" alt="Стратегии загрузки связанных данных" style="max-width:100%;height:auto;display:block;margin:12px 0;border:1px solid rgba(255,255,255,0.08);border-radius:12px;background:#0b1020" />',
              '',
              '## Обзор',
              'У EF Core есть три основные стратегии загрузки графа: eager, explicit и lazy loading. Они решают не одну и ту же задачу и отличаются прежде всего тем, когда именно выполняется SQL.',
              '',
              '| Стратегия | Как работает | Когда хороша |',
              '| --- | --- | --- |',
              '| eager | `Include` заранее описывает нужный граф | форма ответа известна сразу |',
              '| explicit | связь подгружается отдельным явным вызовом | связь нужна только в отдельных ветках логики |',
              '| lazy | SQL запускается в момент обращения к навигации | редко и очень осознанно, когда цена скрытых запросов понятна |',
              '',
              '## Примеры',
              '```csharp',
              'var order = await db.Orders',
              '    .Include(x => x.Items)',
              '    .FirstAsync(x => x.Id == id);',
              '',
              'await db.Entry(order)',
              '    .Collection(x => x.Items)',
              '    .LoadAsync();',
              '```',
              '',
              '## Где чаще всего возникают проблемы',
              '- `Include` тянет слишком широкий граф и раздувает SQL',
              '- lazy loading незаметно порождает N+1',
              '- команда не различает domain-graph для инвариантов и read-model для API-ответа',
              '',
              '## Практика',
              'Если форма данных известна заранее, eager loading или projection в DTO почти всегда понятнее. Explicit loading хорош там, где связь реально нужна не всегда. Lazy loading стоит включать только когда команда понимает цену каждого скрытого запроса и умеет ее диагностировать.'
            ), [
          link("Eager loading of related data", "https://learn.microsoft.com/en-us/ef/core/querying/related-data/eager"),
          link("Explicit loading of related data", "https://learn.microsoft.com/en-us/ef/core/querying/related-data/explicit"),
          link("Lazy loading of related data", "https://learn.microsoft.com/en-us/ef/core/querying/related-data/lazy")
        ]),
            topic("Split Queries", md(
              '<img src="/assets/diagrams/efcore/split-query-vs-single.svg" alt="Single query versus split query" style="max-width:100%;height:auto;display:block;margin:12px 0;border:1px solid rgba(255,255,255,0.08);border-radius:12px;background:#0b1020" />',
              '',
              '## 1. Обзор',
              '',
              'Split Query в Entity Framework Core — это стратегия выполнения запросов с `Include`, при которой один сложный SQL-запрос разбивается на несколько отдельных.',
              '',
              'Цель:',
              '',
              '- снизить нагрузку на БД и избежать избыточного дублирования данных при `JOIN`',
              '',
              '## 2. Поведение по умолчанию',
              '',
              'По умолчанию EF Core использует `Single Query`:',
              '',
              '```csharp',
              'var orders = await context.Orders',
              '    .Include(o => o.Items)',
              '    .Include(o => o.Customer)',
              '    .ToListAsync();',
              '```',
              '',
              'Это приводит к одному SQL-запросу с `JOIN`.',
              '',
              '## 3. Проблема Single Query',
              '',
              'При нескольких `Include`, особенно с коллекциями:',
              '',
              '- возникает Cartesian Explosion',
              '- данные дублируются',
              '- увеличивается размер результата',
              '- ухудшается производительность',
              '',
              '### Пример',
              '',
              '- 1 `Order`',
              '- 10 `Items`',
              '- 5 `Comments`',
              '',
              'Результат `JOIN`:',
              '',
              '- `10 x 5 = 50` строк',
              '',
              '## 4. Как работает Split Query',
              '',
              '```csharp',
              'var orders = await context.Orders',
              '    .Include(o => o.Items)',
              '    .Include(o => o.Customer)',
              '    .AsSplitQuery()',
              '    .ToListAsync();',
              '```',
              '',
              'EF Core выполняет несколько запросов:',
              '',
              '```sql',
              'SELECT * FROM Orders;',
              'SELECT * FROM Items WHERE OrderId IN (...);',
              'SELECT * FROM Customers WHERE Id IN (...);',
              '```',
              '',
              '## 5. Преимущества',
              '',
              '### 5.1 Устранение дублирования данных',
              '',
              '- нет декартова произведения',
              '- меньше передаваемых данных',
              '',
              '### 5.2 Снижение нагрузки на память',
              '',
              '- меньше строк в результате',
              '- эффективнее materialization',
              '',
              '### 5.3 Лучшая масштабируемость',
              '',
              '- особенно при сложных графах данных',
              '- безопасно при множественных `Include`',
              '',
              '## 6. Недостатки',
              '',
              '### 6.1 Несколько запросов к БД',
              '',
              '- увеличивается latency (`round-trip`)',
              '',
              '### 6.2 Отсутствие snapshot consistency',
              '',
              '- данные могут измениться между запросами',
              '',
              '### 6.3 Потенциальные побочные эффекты',
              '',
              '- порядок данных не гарантирован',
              '- требуется явный `OrderBy`',
              '',
              '## 7. Когда использовать',
              '',
              '### Рекомендуется',
              '',
              '- несколько `Include` с коллекциями',
              '- большие объемы данных',
              '- сложные агрегаты (DDD)',
              '- read-heavy сценарии (CQRS Query side)',
              '',
              '```csharp',
              '.Include(o => o.Items)',
              '.Include(o => o.Comments)',
              '.Include(o => o.Payments)',
              '```',
              '',
              '### Не рекомендуется',
              '',
              '- маленькие выборки',
              '- один простой `Include`',
              '- сценарии с высокой требуемой консистентностью (финансы, транзакции)',
              '',
              '```csharp',
              '.Include(o => o.Customer)',
              '```',
              '',
              '## 8. Глобальная настройка',
              '',
              'Включение Split Query по умолчанию:',
              '',
              '```csharp',
              'options.UseSqlServer(connectionString,',
              '    o => o.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery));',
              '```',
              '',
              'Явное указание в запросе:',
              '',
              '```csharp',
              '.AsSplitQuery()',
              '```',
              '',
              'или',
              '',
              '```csharp',
              '.AsSingleQuery()',
              '```',
              '',
              '## 9. Внутренний механизм',
              '',
              'EF Core:',
              '',
              '- загружает root-сущности',
              '- выполняет дополнительные запросы для навигаций',
              '- использует Identity Map',
              '- собирает объектный граф в памяти',
              '',
              '## 10. Best Practices',
              '',
              '- явно указывать стратегию (`AsSplitQuery` / `AsSingleQuery`)',
              '- использовать для сложных графов',
              '- логировать SQL-запросы',
              '- добавлять `OrderBy` при необходимости',
              '- рассматривать `Select` (projection) как альтернативу `Include`',
              '',
              'Пример:',
              '',
              '```csharp',
              'var orders = await context.Orders',
              '    .Select(o => new OrderDto',
              '    {',
              '        Id = o.Id,',
              '        Items = o.Items.Select(i => new ItemDto { ... })',
              '    })',
              '    .ToListAsync();',
              '```',
              '',
              '## 11. Ключевое правило',
              '',
              'Split Query — это инструмент оптимизации для:',
              '',
              '- уменьшения нагрузки от `JOIN`',
              '- контроля размера результата',
              '',
              'Но:',
              '',
              '- увеличивает количество запросов',
              '- не гарантирует консистентность между ними',
              '',
              '## 12. Итог',
              '',
              '| Сценарий | Рекомендация |',
              '| --- | --- |',
              '| Много `Include` (коллекции) | Использовать Split Query |',
              '| Большие данные | Использовать |',
              '| Простые запросы | Не использовать |',
              '| Требуется строгая консистентность | Не использовать |',
              '| CQRS / Read Model | Использовать |'
            ), [
          link("Single vs. split queries", "https://learn.microsoft.com/en-us/ef/core/querying/single-split-queries"),
          link("Eager loading of related data", "https://learn.microsoft.com/en-us/ef/core/querying/related-data/eager"),
          link("What's New in EF Core 5.0", "https://learn.microsoft.com/en-us/ef/core/what-is-new/ef-core-5.0/whatsnew")
        ]),
            topic("Функции базы данных", md(
              '## 1. Что это такое',
              '',
              'Database Functions (`DbFunction` / UDF mapping) - это механизм, позволяющий использовать SQL-функции базы данных внутри LINQ-запросов.',
              '',
              'EF Core сопоставляет:',
              '',
              '- C# метод (CLR)',
              '- с функцией в базе данных',
              '',
              'При выполнении:',
              '',
              '- C# метод не вызывается',
              '- он заменяется на SQL-функцию',
              '',
              '## 2. Зачем это нужно',
              '',
              '### Производительность',
              '',
              'Вычисления выполняются на стороне БД:',
              '',
              '- быстрее',
              '- меньше данных передается',
              '',
              '### Повторное использование логики',
              '',
              'Одна функция:',
              '',
              '- используется в SQL',
              '- используется в EF Core',
              '',
              '### Сложные вычисления',
              '',
              'Подходит для:',
              '',
              '- скидок',
              '- налогов',
              '- рейтингов',
              '- аналитики',
              '',
              '## 3. Как это работает (pipeline)',
              '',
              '- есть функция в БД',
              '- создается C# метод-заглушка',
              '- EF Core маппит метод на SQL-функцию',
              '- LINQ -> SQL',
              '- в SQL вызывается функция',
              '',
              '## 4. Реальный пример',
              '',
              '### SQL функция',
              '',
              '```sql',
              'CREATE FUNCTION dbo.GetDiscountedPrice (@price decimal)',
              'RETURNS decimal',
              'AS',
              'BEGIN',
              '    RETURN @price * 0.9',
              'END',
              '```',
              '',
              '### C# метод (заглушка)',
              '',
              '```csharp',
              'public decimal GetDiscountedPrice(decimal price)',
              '    => throw new NotSupportedException();',
              '```',
              '',
              '### Регистрация',
              '',
              '```csharp',
              'protected override void OnModelCreating(ModelBuilder modelBuilder)',
              '{',
              '    modelBuilder',
              '        .HasDbFunction(typeof(AppDbContext)',
              '        .GetMethod(nameof(GetDiscountedPrice), new[] { typeof(decimal) }))',
              '        .HasName("GetDiscountedPrice");',
              '}',
              '```',
              '',
              '### Использование',
              '',
              '```csharp',
              'var products = context.Products',
              '    .Where(p => context.GetDiscountedPrice(p.Price) > 100)',
              '    .ToList();',
              '```',
              '',
              '### Генерируемый SQL',
              '',
              '```sql',
              'WHERE dbo.GetDiscountedPrice(p.Price) > 100',
              '```',
              '',
              '## 5. Важные правила',
              '',
              '### Метод не выполняется в C#',
              '',
              '```csharp',
              'context.GetDiscountedPrice(100); // ошибка',
              '```',
              '',
              '### Работает только в LINQ',
              '',
              'EF должен:',
              '',
              '- суметь перевести выражение в SQL',
              '',
              '### Метод = контракт, не логика',
              '',
              '- тело игнорируется',
              '- важна только сигнатура',
              '',
              '## 6. Варианты реализации',
              '',
              '### В `DbContext` (простой вариант)',
              '',
              '```csharp',
              'public class AppDbContext : DbContext',
              '{',
              '    public decimal GetDiscountedPrice(decimal price)',
              '        => throw new NotSupportedException();',
              '}',
              '```',
              '',
              '### В `static` классе (лучше для чистоты)',
              '',
              '```csharp',
              'public static class DbFuncExtensions',
              '{',
              '    public static decimal GetDiscountedPrice(decimal price)',
              '        => throw new NotSupportedException();',
              '}',
              '```',
              '',
              '## 7. Использование в репозитории (DDD)',
              '',
              '### Правильный подход',
              '',
              '```csharp',
              'public class ProductRepository',
              '{',
              '    private readonly AppDbContext _context;',
              '',
              '    public List<Product> GetExpensiveProducts()',
              '    {',
              '        return _context.Products',
              '            .Where(p => _context.GetDiscountedPrice(p.Price) > 100)',
              '            .ToList();',
              '    }',
              '}',
              '```',
              '',
              '### Неправильный подход',
              '',
              '```csharp',
              '// плохо: DbFunction внутри репозитория',
              'public decimal GetDiscountedPrice(decimal price)',
              '```',
              '',
              'Почему плохо:',
              '',
              '- нарушает DDD',
              '- привязывает домен к EF Core',
              '- метод не является бизнес-логикой',
              '',
              '## 8. Архитектура (DDD)',
              '',
              '### Где размещать',
              '',
              '| Слой | Что делать |',
              '| --- | --- |',
              '| Domain | ничего |',
              '| Application | ничего |',
              '| Infrastructure | DbFunction |',
              '',
              '### Рекомендуемая структура',
              '',
              '```text',
              'Infrastructure/',
              ' ├── Persistence/',
              ' │    ├── AppDbContext.cs',
              ' │    ├── DbFunctions/',
              ' │    │     └── DbFuncExtensions.cs',
              '```',
              '',
              '## 9. Когда использовать',
              '',
              'Когда:',
              '',
              '- логика уже в БД',
              '- нужны сложные вычисления',
              '- важна производительность',
              '',
              '## 10. Когда не использовать',
              '',
              'Когда:',
              '',
              '- можно решить обычным LINQ',
              '- логика должна быть в домене',
              '- ухудшается читаемость',
              '',
              '## 11. Альтернатива - `HasTranslation`',
              '',
              'EF Core позволяет:',
              '',
              '- не создавать функцию в БД',
              '- а описать SQL прямо в коде',
              '',
              '```csharp',
              '.HasTranslation(...)',
              '```',
              '',
              'Это:',
              '',
              '- более гибко',
              '- но сложнее',
              '',
              '## Итог',
              '',
              'DbFunction в EF Core - это:',
              '',
              '- мост между LINQ и SQL-функциями',
              '',
              'Ключевая мысль:',
              '',
              '- C# метод - это описание',
              '- SQL функция - это реальная логика',
              '- EF Core - это переводчик'
            ), [
          link("User-defined function mapping", "https://learn.microsoft.com/en-us/ef/core/querying/user-defined-function-mapping"),
          link("SQL Queries", "https://learn.microsoft.com/en-us/ef/core/querying/sql-queries")
        ]),
            topic("Отслеживание изменений", md(
              '<img src="/assets/diagrams/efcore/change-tracker-states.svg" alt="Состояния change tracker" style="max-width:100%;height:auto;display:block;margin:12px 0;border:1px solid rgba(255,255,255,0.08);border-radius:12px;background:#0b1020" />',
              '',
              '## 1. Что такое Change Tracker',
              '',
              'Change Tracker - это механизм внутри EF Core (`DbContext`), который:',
              '',
              '- отслеживает все загруженные и добавленные сущности',
              '- хранит их состояние',
              '- определяет изменения',
              '- генерирует SQL при `SaveChanges()`',
              '',
              'Основная идея:',
              '',
              '- `DbContext` = unit of work',
              '- `ChangeTracker` = механизм отслеживания изменений',
              '- `SaveChanges()` = фиксация изменений в базе и выполнение сгенерированного SQL',
              '',
              '## 2. Состояния сущностей',
              '',
              '```csharp',
              'public enum EntityState',
              '{',
              '    Detached,',
              '    Unchanged,',
              '    Added,',
              '    Modified,',
              '    Deleted',
              '}',
              '```',
              '',
              'Пример:',
              '',
              '```csharp',
              'var user = await context.Users.FindAsync(id);',
              '',
              'user.Name = "New Name";',
              '',
              'await context.SaveChangesAsync();',
              '```',
              '',
              'EF Core:',
              '',
              '- запоминает original values',
              '- фиксирует изменения',
              '- генерирует SQL (`UPDATE`)',
              '',
              '## 3. Как работает отслеживание',
              '',
              '### Snapshot tracking (по умолчанию)',
              '',
              'EF хранит:',
              '',
              '- `OriginalValues`',
              '- `CurrentValues`',
              '',
              'На `SaveChanges()`:',
              '',
              '- `Original != Current` -> `UPDATE`',
              '',
              '### DetectChanges',
              '',
              'Перед сохранением EF обычно вызывает:',
              '',
              '```csharp',
              'ChangeTracker.DetectChanges();',
              '```',
              '',
              'Он:',
              '',
              '- проходит по всем сущностям',
              '- сравнивает значения',
              '- обновляет состояния',
              '',
              '## 4. Change Tracker API',
              '',
              '### Получение tracked сущностей',
              '',
              '```csharp',
              'context.ChangeTracker.Entries()',
              '```',
              '',
              '### Фильтрация по типу',
              '',
              '```csharp',
              'context.ChangeTracker.Entries<AggregateRoot>()',
              '```',
              '',
              '### Фильтрация по состоянию',
              '',
              '```csharp',
              'context.ChangeTracker',
              '    .Entries<AggregateRoot>()',
              '    .Where(e => e.State == EntityState.Modified)',
              '```',
              '',
              '## 5. Связь с DDD',
              '',
              'Change Tracker позволяет автоматически находить измененные агрегаты.',
              '',
              '### AggregateRoot',
              '',
              '```csharp',
              'public abstract class AggregateRoot',
              '{',
              '    private readonly List<IDomainEvent> _events = new();',
              '',
              '    public IReadOnlyCollection<IDomainEvent> Events => _events;',
              '',
              '    protected void AddEvent(IDomainEvent @event)',
              '    {',
              '        _events.Add(@event);',
              '    }',
              '',
              '    public void ClearEvents() => _events.Clear();',
              '}',
              '```',
              '',
              'Пример:',
              '',
              '```csharp',
              'public class Order : AggregateRoot',
              '{',
              '    public Guid Id { get; private set; }',
              '',
              '    public void Create()',
              '    {',
              '        AddEvent(new OrderCreatedEvent(Id));',
              '    }',
              '}',
              '```',
              '',
              '## 6. Извлечение domain events через Change Tracker',
              '',
              '```csharp',
              'var domainEvents = context.ChangeTracker',
              '    .Entries<AggregateRoot>()',
              '    .SelectMany(e => e.Entity.Events)',
              '    .ToList();',
              '```',
              '',
              'Почему это работает:',
              '',
              '- EF уже знает, какие агрегаты находятся в контексте',
              '- change tracker можно использовать как источник истины для текущего unit of work',
              '',
              '## 7. Outbox Pattern через Change Tracker',
              '',
              'Цель:',
              '',
              '- атомарное сохранение данных',
              '- атомарное сохранение событий',
              '',
              '### OutboxMessage',
              '',
              '```csharp',
              'public class OutboxMessage',
              '{',
              '    public Guid Id { get; set; }',
              '    public DateTime OccurredOn { get; set; }',
              '',
              '    public string Type { get; set; }',
              '    public string Payload { get; set; }',
              '',
              '    public DateTime? ProcessedOn { get; set; }',
              '}',
              '```',
              '',
              '### Реализация через `SaveChanges` override',
              '',
              '```csharp',
              'public override async Task<int> SaveChangesAsync(',
              '    CancellationToken cancellationToken = default)',
              '{',
              '    var domainEvents = ChangeTracker',
              '        .Entries<AggregateRoot>()',
              '        .SelectMany(e => e.Entity.Events)',
              '        .ToList();',
              '',
              '    var outboxMessages = domainEvents.Select(e => new OutboxMessage',
              '    {',
              '        Id = Guid.NewGuid(),',
              '        OccurredOn = DateTime.UtcNow,',
              '        Type = e.GetType().AssemblyQualifiedName,',
              '        Payload = JsonSerializer.Serialize(e)',
              '    });',
              '',
              '    await OutboxMessages.AddRangeAsync(outboxMessages, cancellationToken);',
              '',
              '    var result = await base.SaveChangesAsync(cancellationToken);',
              '',
              '    foreach (var entry in ChangeTracker.Entries<AggregateRoot>())',
              '    {',
              '        entry.Entity.ClearEvents();',
              '    }',
              '',
              '    return result;',
              '}',
              '```',
              '',
              '## 8. Обработка Outbox в background worker',
              '',
              '```csharp',
              'public class OutboxProcessor : BackgroundService',
              '{',
              '    private readonly IServiceProvider _provider;',
              '',
              '    public OutboxProcessor(IServiceProvider provider)',
              '    {',
              '        _provider = provider;',
              '    }',
              '',
              '    protected override async Task ExecuteAsync(CancellationToken ct)',
              '    {',
              '        while (!ct.IsCancellationRequested)',
              '        {',
              '            using var scope = _provider.CreateScope();',
              '            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();',
              '            var publisher = scope.ServiceProvider.GetRequiredService<IPublisher>();',
              '',
              '            var messages = await context.OutboxMessages',
              '                .Where(x => x.ProcessedOn == null)',
              '                .Take(50)',
              '                .ToListAsync(ct);',
              '',
              '            foreach (var message in messages)',
              '            {',
              '                var type = Type.GetType(message.Type);',
              '',
              '                var domainEvent = JsonSerializer.Deserialize(message.Payload, type);',
              '',
              '                await publisher.Publish(domainEvent, ct);',
              '',
              '                message.ProcessedOn = DateTime.UtcNow;',
              '            }',
              '',
              '            await context.SaveChangesAsync(ct);',
              '        }',
              '    }',
              '}',
              '```',
              '',
              '## 9. Domain Event vs Integration Event',
              '',
              'Best practice:',
              '',
              '- domain events живут внутри транзакции и текущей модели',
              '- integration events публикуются наружу через outbox',
              '',
              'Рекомендуется:',
              '',
              '```csharp',
              'var integrationEvent = Map(domainEvent);',
              '',
              'await publisher.Publish(integrationEvent);',
              '```',
              '',
              '## 10. Performance и нагрузка',
              '',
              '### `Entries()`',
              '',
              '```csharp',
              'context.ChangeTracker.Entries()',
              '```',
              '',
              'Сложность:',
              '',
              '- `O(N)`',
              '',
              'где `N` = количество tracked entities.',
              '',
              '### `Entries<AggregateRoot>()`',
              '',
              '```csharp',
              'context.ChangeTracker.Entries<AggregateRoot>()',
              '```',
              '',
              'Все равно:',
              '',
              '- `O(N)`',
              '',
              'Фильтрация происходит после обхода.',
              '',
              '### `DetectChanges()`',
              '',
              '```csharp',
              'ChangeTracker.DetectChanges()',
              '```',
              '',
              'Сложность:',
              '',
              '- `O(N * P)`',
              '',
              'где `P` = количество свойств.',
              '',
              'Пример:',
              '',
              '- 1000 entities',
              '- 20 properties',
              '- около `20 000` сравнений плюс обход коллекции',
              '',
              'Итоговая нагрузка:',
              '',
              '- `SaveChanges() ~= O(N * P) + O(N)`',
              '',
              '## 11. Когда возникает проблема',
              '',
              '- long-lived `DbContext`',
              '- большое количество tracked entities',
              '- bulk операции',
              '- частые `SaveChanges()`',
              '- отключенный или неконтролируемый `DetectChanges`',
              '',
              '## 12. Оптимизации',
              '',
              '### 1. Фильтрация',
              '',
              '```csharp',
              'context.ChangeTracker',
              '    .Entries<AggregateRoot>()',
              '    .Where(e => e.State != EntityState.Unchanged)',
              '```',
              '',
              '### 2. Короткий lifetime `DbContext`',
              '',
              '- scoped per request',
              '',
              '### 3. Контроль `DetectChanges`',
              '',
              '```csharp',
              'context.ChangeTracker.AutoDetectChangesEnabled = false;',
              'context.ChangeTracker.DetectChanges();',
              '```',
              '',
              '### 4. Минимизировать количество tracked entities',
              '',
              '### 5. Альтернатива: Event Collector',
              '',
              '```csharp',
              'public interface IDomainEventCollector',
              '{',
              '    void Add(IDomainEvent e);',
              '    IReadOnlyList<IDomainEvent> GetAll();',
              '}',
              '```',
              '',
              '## 13. Сравнение подходов',
              '',
              '| Подход | Сложность | Когда использовать |',
              '| --- | --- | --- |',
              '| `ChangeTracker` | `O(N)` | стандартные сервисы |',
              '| `ChangeTracker` + фильтр | `O(N)` | средняя нагрузка |',
              '| Event Collector | `O(K)` | high-load системы |',
              '',
              '## 14. Рекомендации для production',
              '',
              'Использовать `ChangeTracker`, если:',
              '',
              '- обычный CRUD и умеренная нагрузка',
              '- небольшое количество сущностей в контексте',
              '',
              'Добавлять оптимизации, если:',
              '',
              '- средняя нагрузка',
              '- DDD + outbox',
              '',
              'Использовать Event Collector, если:',
              '',
              '- high-load',
              '- много агрегатов',
              '- критична производительность',
              '',
              '## 15. Итог',
              '',
              'Change Tracker - удобный и мощный механизм, который позволяет автоматически извлекать domain events и реализовать outbox без дополнительной инфраструктуры.',
              '',
              'Но:',
              '',
              '- он имеет `O(N)` overhead',
              '- он зависит от `DetectChanges()`',
              '',
              'Поэтому его нужно использовать осознанно, с учетом реальной нагрузки системы.'
            ), [
          link("Change tracking in EF Core", "https://learn.microsoft.com/en-us/ef/core/change-tracking/"),
          link("Change detection and notifications", "https://learn.microsoft.com/en-us/ef/core/change-tracking/change-detection"),
          link("Value comparers", "https://learn.microsoft.com/en-us/ef/core/modeling/value-comparers")
        ]),
            topic("Получить SQL текст запроса", md(
              '## 1. Получение SQL из LINQ',
              '',
              'Основной способ - `ToQueryString()`.',
              '',
              '```csharp',
              'var query = context.Users',
              '    .Where(x => x.Age > 18)',
              '    .OrderBy(x => x.Name);',
              '',
              'var sql = query.ToQueryString();',
              '',
              'Console.WriteLine(sql);',
              '```',
              '',
              '### Что важно',
              '',
              '- запрос не выполняется',
              '- генерируется реальный SQL, который пойдет в БД',
              '- параметры могут быть в inline-виде, в зависимости от провайдера',
              '',
              'Пример результата:',
              '',
              '```sql',
              'SELECT [u].[Id], [u].[Name], [u].[Age]',
              'FROM [Users] AS [u]',
              'WHERE [u].[Age] > 18',
              'ORDER BY [u].[Name]',
              '```',
              '',
              '### Когда использовать',
              '',
              '- отладка LINQ -> SQL',
              '- анализ performance: индексы, `JOIN` и форма запроса',
              '- тестирование запросов',
              '',
              '### Ограничения',
              '',
              'Не показывает:',
              '',
              '- execution time',
              '- реальные параметры, в некоторых случаях',
              '- ничего не дает для уже материализованного результата после `ToList()` и подобных вызовов',
              '',
              '## 2. Interceptors - контроль и метрики',
              '',
              'Это основной production-инструмент.',
              '',
              'Позволяет перехватывать:',
              '',
              '- SQL-команды',
              '- транзакции',
              '- `SaveChanges`',
              '- lifecycle соединения',
              '',
              '### Базовый interceptor',
              '',
              '```csharp',
              'public class SqlLoggingInterceptor : DbCommandInterceptor',
              '{',
              '    public override async ValueTask<InterceptionResult<DbDataReader>> ReaderExecutingAsync(',
              '        DbCommand command,',
              '        CommandEventData eventData,',
              '        InterceptionResult<DbDataReader> result,',
              '        CancellationToken cancellationToken = default)',
              '    {',
              '        Console.WriteLine("----- SQL -----");',
              '        Console.WriteLine(command.CommandText);',
              '',
              '        return await base.ReaderExecutingAsync(command, eventData, result, cancellationToken);',
              '    }',
              '}',
              '```',
              '',
              '### Подключение',
              '',
              '```csharp',
              'options.AddInterceptors(new SqlLoggingInterceptor());',
              '```',
              '',
              '## 3. Логирование SQL и время выполнения',
              '',
              '```csharp',
              'public class MetricsInterceptor : DbCommandInterceptor',
              '{',
              '    public override async ValueTask<InterceptionResult<DbDataReader>> ReaderExecutingAsync(',
              '        DbCommand command,',
              '        CommandEventData eventData,',
              '        InterceptionResult<DbDataReader> result,',
              '        CancellationToken cancellationToken = default)',
              '    {',
              '        var sw = Stopwatch.StartNew();',
              '',
              '        try',
              '        {',
              '            return await base.ReaderExecutingAsync(command, eventData, result, cancellationToken);',
              '        }',
              '        finally',
              '        {',
              '            sw.Stop();',
              '',
              '            Console.WriteLine($"SQL: {command.CommandText}");',
              '            Console.WriteLine($"Duration: {sw.ElapsedMilliseconds} ms");',
              '        }',
              '    }',
              '}',
              '```',
              '',
              '## 4. Перехват всех типов операций',
              '',
              '| Операция | Метод interceptor |',
              '| --- | --- |',
              '| `SELECT` | `ReaderExecutingAsync` |',
              '| `INSERT` / `UPDATE` / `DELETE` | `NonQueryExecutingAsync` |',
              '| scalar, например `COUNT` | `ScalarExecutingAsync` |',
              '',
              '### Универсальный interceptor',
              '',
              '```csharp',
              'public class FullSqlInterceptor : DbCommandInterceptor',
              '{',
              '    private void Log(DbCommand command)',
              '    {',
              '        Console.WriteLine("----- SQL -----");',
              '        Console.WriteLine(command.CommandText);',
              '    }',
              '',
              '    public override ValueTask<InterceptionResult<DbDataReader>> ReaderExecutingAsync(',
              '        DbCommand command, CommandEventData eventData,',
              '        InterceptionResult<DbDataReader> result, CancellationToken cancellationToken = default)',
              '    {',
              '        Log(command);',
              '        return base.ReaderExecutingAsync(command, eventData, result, cancellationToken);',
              '    }',
              '',
              '    public override ValueTask<InterceptionResult<int>> NonQueryExecutingAsync(',
              '        DbCommand command, CommandEventData eventData,',
              '        InterceptionResult<int> result, CancellationToken cancellationToken = default)',
              '    {',
              '        Log(command);',
              '        return base.NonQueryExecutingAsync(command, eventData, result, cancellationToken);',
              '    }',
              '',
              '    public override ValueTask<InterceptionResult<object>> ScalarExecutingAsync(',
              '        DbCommand command, CommandEventData eventData,',
              '        InterceptionResult<object> result, CancellationToken cancellationToken = default)',
              '    {',
              '        Log(command);',
              '        return base.ScalarExecutingAsync(command, eventData, result, cancellationToken);',
              '    }',
              '}',
              '```',
              '',
              '## 5. Доступ к параметрам запроса',
              '',
              '```csharp',
              'foreach (DbParameter param in command.Parameters)',
              '{',
              '    Console.WriteLine($"{param.ParameterName} = {param.Value}");',
              '}',
              '```',
              '',
              'Это дает:',
              '',
              '- реальные значения, в отличие от `ToQueryString()`',
              '- полный контроль над запросом',
              '',
              '## 6. Overhead и нюансы',
              '',
              '| Механизм | Overhead |',
              '| --- | --- |',
              '| `ToQueryString()` | почти 0 |',
              '| interceptor с логированием | низкий |',
              '| interceptor с тяжелой логикой | может быть заметный |',
              '',
              '### Ошибки',
              '',
              '- не логировать все подряд, иначе будут огромные логи',
              '- не делать тяжелую логику внутри interceptor, иначе замедлятся все запросы',
              '- не выполнять синхронные операции внутри async interceptor, иначе можно получить блокировки',
              '',
              '## 7. Рекомендуемый минимальный setup',
              '',
              '```csharp',
              'options.AddInterceptors(new MetricsInterceptor());',
              '```',
              '',
              'Логировать только:',
              '',
              '- медленные запросы, например больше `X` ms',
              '- ошибки',
              '',
              '## Итог',
              '',
              'Используй `ToQueryString()`:',
              '',
              '- локально',
              '- для анализа SQL',
              '',
              'Используй `DbCommandInterceptor`:',
              '',
              '- в production',
              '- для метрик',
              '- для логирования',
              '- для контроля SQL'
            ), [
          link("Simple logging", "https://learn.microsoft.com/en-us/ef/core/logging-events-diagnostics/simple-logging"),
          link("Performance diagnosis", "https://learn.microsoft.com/en-us/ef/core/performance/performance-diagnosis"),
          link("SQL Queries", "https://learn.microsoft.com/en-us/ef/core/querying/sql-queries")
        ]),
            topic("Тестирование с EF Core", md(
              '## Обзор',
              'У тестов с EF Core есть важная ловушка: слишком легко написать быстрый тест, который проходит на фейковом провайдере и ломается на настоящей production-базе. Поэтому главный вопрос здесь не "как быстрее поднять БД", а "какое поведение я реально хочу проверить".',
              '',
              '## Выбор стратегии',
              '| Подход | Когда подходит | Ограничение |',
              '| --- | --- | --- |',
              '| реальный provider | нужна максимальная достоверность SQL, индексов, транзакций и поведения провайдера | медленнее и тяжелее в инфраструктуре |',
              '| SQLite in-memory | нужен быстрый реляционный тест без полноценного сервера | поведение не идентично SQL Server/PostgreSQL |',
              '| EF InMemory provider | только очень узкие тесты на поверхностную логику | не проверяет настоящую реляционную семантику |',
              '',
              '## Что тестировать отдельно',
              '- доменные правила без EF Core вообще',
              '- mapping и запросы EF Core на максимально близком к production провайдере',
              '- migration scripts и критичные SQL-сценарии отдельно от unit-тестов',
              '',
              '## Практика',
              'Если важно, как реально поведет себя SQL, не используйте `InMemory` как суррогат production-базы. Он полезен только для очень узких сценариев и часто дает ложное чувство безопасности.'
            ), [
          link("Choosing a testing strategy", "https://learn.microsoft.com/en-us/ef/core/testing/choosing-a-testing-strategy"),
          link("Testing without your Production Database System", "https://learn.microsoft.com/en-us/ef/core/testing/testing-without-the-database"),
          link("In-memory database provider", "https://learn.microsoft.com/en-us/ef/core/providers/in-memory/")
        ]),
            topic("Проблемы производительности", md(
              '## Обзор',
              'У EF Core performance-проблемы обычно не магические. Почти всегда причина в форме запроса, количестве данных, количестве round-trips или неподходящем режиме materialization.',
              '',
              '## Что чаще всего тормозит',
              '- слишком широкие `SELECT` и отсутствие projection в DTO',
              '- N+1 из-за lazy loading или неявной подзагрузки',
              '- один гигантский `JOIN` с дублированием данных',
              '- отсутствие нужных индексов в самой базе',
              '- tracking там, где результат только читается',
              '',
              '## Порядок диагностики',
              '1. Посмотреть SQL и логи выполнения.',
              '2. Проверить форму запроса и projection.',
              '3. Посчитать количество запросов и round-trips.',
              '4. Проверить индексы и план выполнения в базе.',
              '5. Только потом решать, нужен ли split query, compiled query или raw SQL.',
              '',
              '## Практика',
              'Частая ошибка - сразу обвинять ORM и переписывать все на ручной SQL. На деле быстрее всего обычно помогает убрать лишние `Include`, сделать projection, переключить чтение в no-tracking или добавить отсутствующий индекс.'
            ), [
          link("Efficient querying", "https://learn.microsoft.com/en-us/ef/core/performance/efficient-querying"),
          link("Performance diagnosis", "https://learn.microsoft.com/en-us/ef/core/performance/performance-diagnosis")
        ]),
            topic("Параллелизм в APP слое", md(
              '<img src="/assets/diagrams/efcore/parallel-dbcontext.svg" alt="Параллельные операции и DbContext" style="max-width:100%;height:auto;display:block;margin:12px 0;border:1px solid rgba(255,255,255,0.08);border-radius:12px;background:#0b1020" />',
              '',
              '## Обзор',
              '`DbContext` не потокобезопасен. Один экземпляр нельзя использовать одновременно для нескольких параллельных операций, даже если все вызовы `async` и код визуально выглядит аккуратно.',
              '',
              '## Что это означает на практике',
              '- нельзя запускать два запроса через один и тот же `DbContext` одновременно',
              '- нельзя читать и писать через один `DbContext` из нескольких потоков',
              '- `await` должен завершить одну операцию до начала следующей на том же экземпляре',
              '',
              '## Как делать правильно',
              'Если нужна параллельность, создавайте отдельный `DbContext` на каждую независимую задачу через scope или `IDbContextFactory<TContext>`.',
              '',
              '## Важная граница',
              'Параллелизм и транзакционная целостность часто конфликтуют. Несколько контекстов можно выполнять параллельно, но они уже не представляют одну shared unit of work. Поэтому параллелить стоит независимые чтения или независимые операции, а не части одного атомарного сценария.',
              '',
              '## Практика',
              'Хорошее правило простое: параллелить можно работу приложения, но не один и тот же экземпляр `DbContext`.'
            ), [
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
            topic("Middleware в ASP.NET Core", `![Пайплайн middleware](/assets/diagrams/webapi/middleware-pipeline.svg)

## Что это
Middleware в ASP.NET Core — это компоненты HTTP pipeline. Каждый middleware получает \`HttpContext\`, может обработать запрос сам, передать его дальше или завершить цепочку, а также выполнить логику до и после следующего шага.

## Как работает pipeline

\`\`\`text
Middleware 1: before next()
  Middleware 2: before next()
    Middleware 3: before next()
      Endpoint
    Middleware 3: after next()
  Middleware 2: after next()
Middleware 1: after next()
\`\`\`

Так видно, что middleware не просто стоят в цепочке, а оборачивают следующий шаг. Запрос идет сверху вниз, а ответ возвращается снизу вверх в обратном порядке.

Порядок регистрации критически важен. Каждый вызов \`app.Use(...)\` вставляет новый шаг в конвейер, поэтому перестановка middleware часто меняет поведение приложения и может привести к багам безопасности.

## Как создают middleware
В проекте обычно встречаются три варианта:

1. **Inline middleware** через \`app.Use(...)\` для короткой локальной логики.
2. **Отдельный класс** с \`RequestDelegate\` и \`InvokeAsync(...)\` — основной рабочий вариант.
3. **Extension method** над \`IApplicationBuilder\`, чтобы регистрация читалась как \`app.UseLogging()\`.

\`\`\`csharp
public class LoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<LoggingMiddleware> _logger;

    public LoggingMiddleware(RequestDelegate next, ILogger<LoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        _logger.LogInformation("Request {Path}", context.Request.Path);

        await _next(context);

        _logger.LogInformation("Response {StatusCode}", context.Response.StatusCode);
    }
}

public static class LoggingMiddlewareExtensions
{
    public static IApplicationBuilder UseLogging(this IApplicationBuilder app)
        => app.UseMiddleware<LoggingMiddleware>();
}
\`\`\`

## До и после next
Middleware удобно использовать для логирования, метрик, таймингов и трейсинга, потому что один и тот же компонент видит и входящий запрос, и итоговый ответ.

\`\`\`csharp
public async Task InvokeAsync(HttpContext context)
{
    var startedAt = Stopwatch.StartNew();

    await _next(context);

    startedAt.Stop();
    Console.WriteLine($"Request took {startedAt.ElapsedMilliseconds} ms");
}
\`\`\`

## Когда цепочку прерывают
Если middleware не вызывает \`_next\`, pipeline останавливается. Это нормально для авторизации, валидации заголовков, rate limiting или короткого ответа на служебный маршрут.

\`\`\`csharp
public async Task InvokeAsync(HttpContext context)
{
    if (!context.Request.Headers.ContainsKey("X-API-KEY"))
    {
        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
        await context.Response.WriteAsync("Unauthorized");
        return;
    }

    await _next(context);
}
\`\`\`

## DI и время жизни
- Экземпляр обычного middleware создается один раз на приложение, поэтому в полях нельзя хранить состояние запроса.
- \`ILogger<T>\` и другие безопасные зависимости можно внедрять в конструктор.
- Scoped-сервисы лучше принимать параметрами \`InvokeAsync\` или использовать \`IMiddleware\`, чтобы не тащить request-scoped состояние в singleton-like объект.

## Middleware vs Filters vs Handlers

| Подход | Уровень | Когда использовать |
| --- | --- | --- |
| Middleware | Весь HTTP pipeline | Логирование, auth, headers, correlation id, глобальная обработка ошибок |
| Filters | MVC / Controllers | Валидация, action/result logic, кросс-срезы только для MVC |
| Handlers | Endpoint / Minimal API | Логика конкретного маршрута или endpoint filter |

## Практика и порядок
Типичный безопасный порядок часто выглядит так:

\`\`\`csharp
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
\`\`\`

Полезно помнить разницу:

| Метод | Поведение |
| --- | --- |
| \`Use\` | Выполняет код до и после следующего шага |
| \`Run\` | Терминальный middleware, дальше pipeline не идет |
| \`Map\` | Ветвление конвейера по условию или пути |

## Где middleware особенно полезен
- логирование запроса и ответа;
- глобальная обработка исключений;
- correlation id и trace id;
- security headers, CORS, compression, rate limiting;
- простая техническая авторизация до входа в endpoint.

## Что запомнить
- middleware управляет потоком запроса на уровне всего HTTP pipeline;
- порядок регистрации важнее, чем кажется;
- middleware должен делать одну техническую задачу, а не бизнес-логику;
- после старта ответа заголовки менять поздно, поэтому надо следить за \`HttpResponse.HasStarted\`.`, [
          link("Middleware in ASP.NET Core", "https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware?view=aspnetcore-9.0"),
          link("Middleware activation and lifetime", "https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware/extensibility?view=aspnetcore-9.0"),
          link("HttpResponse.HasStarted", "https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.http.httpresponse.hasstarted?view=aspnetcore-10.0")
        ]),
            topic("HttpContext.Response events", md(
              '![Жизненный цикл ответа](/assets/diagrams/webapi/request-lifecycle.svg)',
              '',
              '## Что это',
              '`OnStarting` и `OnCompleted` - это колбэки на `HttpResponse`, которые позволяют встроиться в финальную фазу ответа. Первый срабатывает прямо перед отправкой заголовков, второй - после завершения обработки ответа.',
              '',
              '## OnStarting',
              '### Что это',
              '`OnStarting` вызывается прямо перед тем, как ASP.NET Core отправит HTTP headers клиенту. Это последний безопасный момент, когда еще можно менять headers, cookies и другие метаданные ответа.',
              '',
              '### Когда вызывается',
              '- когда response готов начать отправку;',
              '- до первого байта body;',
              '- до того, как заголовки станут неизменяемыми.',
              '',
              '### Для чего используют',
              '- добавить headers;',
              '- установить cookies;',
              '- выполнить логику, которая зависит от финального состояния ответа.',
              '',
              '### Пример',
              '```csharp',
              'app.Use(async (context, next) =>',
              '{',
              '    context.Response.OnStarting(() =>',
              '    {',
              '        context.Response.Headers["X-Custom-Header"] = "OnStarting";',
              '        Console.WriteLine("OnStarting called");',
              '        return Task.CompletedTask;',
              '    });',
              '',
              '    await next();',
              '});',
              '```',
              '',
              '### Что важно',
              '- несколько `OnStarting`-колбэков выполняются в обратном порядке, то есть LIFO;',
              '- если response уже начался, менять headers поздно;',
              '- колбэк может быть асинхронным, но его стоит держать коротким.',
              '',
              '## OnCompleted',
              '### Что это',
              '`OnCompleted` вызывается после того, как обработка ответа завершена. Это место для cleanup, метрик и логирования, но не для изменения самого response.',
              '',
              '### Когда вызывается',
              '- после завершения response;',
              '- после записи body;',
              '- когда pipeline уже закончил работу с ответом.',
              '',
              '### Для чего используют',
              '- логирование;',
              '- метрики;',
              '- очистку ресурсов;',
              '- пост-обработку, которая не меняет ответ.',
              '',
              '### Пример',
              '```csharp',
              'app.Use(async (context, next) =>',
              '{',
              '    context.Response.OnCompleted(() =>',
              '    {',
              '        Console.WriteLine("Response completed");',
              '        return Task.CompletedTask;',
              '    });',
              '',
              '    await next();',
              '});',
              '```',
              '',
              '### Что важно',
              '- менять response здесь уже нельзя;',
              '- колбэк не должен быть тяжелым или блокирующим;',
              '- если несколько `OnCompleted`-колбэков завязаны друг на друга, порядок лучше проверить тестом и не полагаться на неявное поведение.',
              '',
              '## Ключевая разница',
              '',
              '| Событие | Когда | Можно менять response | Типичный use case |',
              '| --- | --- | --- | --- |',
              '| `OnStarting` | Перед отправкой headers | Да | Headers, cookies, correlation id |',
              '| `OnCompleted` | После завершения ответа | Нет | Логи, метрики, cleanup |',
              '',
              '## Как это идет в pipeline',
              '```text',
              'Middleware 1',
              '  -> Middleware 2',
              '    -> Controller / Endpoint',
              '    <- OnStarting callbacks',
              '  <- response body / flush',
              '<- OnCompleted callbacks',
              '```',
              '',
              '`OnStarting` ближе к моменту старта ответа. `OnCompleted` - уже после завершения response path.',
              '',
              '## Практический пример',
              '```csharp',
              'app.Use(async (context, next) =>',
              '{',
              '    var start = Stopwatch.GetTimestamp();',
              '',
              '    context.Response.OnStarting(() =>',
              '    {',
              '        context.Response.Headers["X-Request-Id"] = Guid.NewGuid().ToString();',
              '        return Task.CompletedTask;',
              '    });',
              '',
              '    context.Response.OnCompleted(() =>',
              '    {',
              '        var duration = Stopwatch.GetElapsedTime(start);',
              '        Console.WriteLine($"Request took {duration.TotalMilliseconds} ms");',
              '        return Task.CompletedTask;',
              '    });',
              '',
              '    await next();',
              '});',
              '```',
              '',
              '## Подводные камни',
              '### Порядок выполнения',
              '```csharp',
              'context.Response.OnStarting(() => { Console.WriteLine("1"); return Task.CompletedTask; });',
              'context.Response.OnStarting(() => { Console.WriteLine("2"); return Task.CompletedTask; });',
              '```',
              '',
              'Вывод будет таким:',
              '',
              '```text',
              '2',
              '1',
              '```',
              '',
              '### Нельзя трогать response в OnCompleted',
              '```csharp',
              'context.Response.OnCompleted(() =>',
              '{',
              '    context.Response.Headers["X-Test"] = "fail";',
              '    return Task.CompletedTask;',
              '});',
              '```',
              '',
              '### Исключения',
              '- ошибка в `OnStarting` может сорвать формирование ответа;',
              '- ошибка в `OnCompleted` уже не поможет изменить то, что ушло клиенту, поэтому такие колбэки особенно важно логировать аккуратно.',
              '',
              '## Где это особенно полезно',
              '- custom middleware;',
              '- logging middleware;',
              '- observability и tracing;',
              '- security headers и correlation id.',
              '',
              '## Что запомнить',
              '- `OnStarting` - последний шанс изменить response;',
              '- `OnCompleted` - реакция после завершения запроса;',
              '- оба колбэка должны быть короткими, надежными и без тяжелой синхронной работы.'
            ), [
          link("HttpResponse API", "https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.http.httpresponse?view=aspnetcore-10.0"),
          link("HttpResponse.OnStarting", "https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.http.httpresponse.onstarting?view=aspnetcore-10.0"),
          link("HttpResponse.OnCompleted", "https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.http.httpresponse.oncompleted?view=aspnetcore-10.0")
        ]),
            topic("Kestrel", md(
              '![Схема Kestrel](/assets/diagrams/webapi/kestrel-stack.svg)',
              '',
              '## Что такое Kestrel',
              '',
              'Kestrel - встроенный кроссплатформенный веб-сервер, который используется по умолчанию в ASP.NET Core.',
              '',
              'Он отвечает за:',
              '',
              '- прием HTTP-запросов;',
              '- работу с TCP и UDP соединениями;',
              '- разбор HTTP/1.1, HTTP/2 и HTTP/3;',
              '- создание `HttpContext`;',
              '- передачу запроса в middleware pipeline.',
              '',
              '## Архитектура',
              '',
              '```text',
              'Client -> Kestrel -> Middleware -> Endpoint -> Response',
              '```',
              '',
              'Kestrel - это низкоуровневый HTTP-сервер. Он принимает соединения, разбирает HTTP и запускает pipeline, но не содержит бизнес-логику приложения.',
              '',
              '## Зачем нужен Kestrel',
              '',
              'Главная задача Kestrel - быстро и эффективно обрабатывать HTTP-трафик.',
              '',
              'Почему он используется по умолчанию:',
              '',
              '- высокая производительность;',
              '- асинхронная модель через `async/await`;',
              '- минимизация лишних аллокаций;',
              '- поддержка современных протоколов: `HTTP/1.1`, `HTTP/2`, `HTTP/3`.',
              '',
              '## Где используется',
              '',
              'Kestrel может работать:',
              '',
              '- напрямую как standalone server для API, микросервисов, Docker и Kubernetes;',
              '- за reverse proxy, например `NGINX` или `IIS`.',
              '',
              'Reverse proxy обычно добавляют для SSL termination, безопасности, балансировки и внешней точки входа.',
              '',
              '## Как конфигурируется Kestrel',
              '',
              'Обычно есть два уровня настройки:',
              '',
              '1. Упрощенный - `UseUrls(...)` или `ASPNETCORE_URLS`.',
              '2. Нативный - `ConfigureKestrel(...)` и `Listen(...)`.',
              '',
              '## Где задаются адреса и порты',
              '',
              'Адреса и порты обычно задают через:',
              '',
              '- переменные окружения, например `ASPNETCORE_URLS`;',
              '- параметры командной строки, например `--urls`;',
              '- секцию `Kestrel` в `appsettings.json`;',
              '- код через `ConfigureKestrel(...)`;',
              '- `launchSettings.json` для локальной разработки.',
              '',
              'Пример переменной окружения:',
              '',
              '```bash',
              'ASPNETCORE_URLS=http://*:5000',
              '```',
              '',
              'Пример `appsettings.json`:',
              '',
              '```json',
              '{',
              '  "Kestrel": {',
              '    "Endpoints": {',
              '      "Http": {',
              '        "Url": "http://0.0.0.0:5000"',
              '      }',
              '    }',
              '  }',
              '}',
              '```',
              '',
              '## ConfigureKestrel - основной API',
              '',
              '```csharp',
              'builder.WebHost.ConfigureKestrel(options =>',
              '{',
              '    options.ListenAnyIP(5000);',
              '',
              '    options.ListenAnyIP(5001, o =>',
              '    {',
              '        o.UseHttps();',
              '    });',
              '});',
              '```',
              '',
              'Основные варианты `Listen`:',
              '',
              '| Метод | Что делает |',
              '| --- | --- |',
              '| `ListenAnyIP` | слушает все интерфейсы |',
              '| `ListenLocalhost` | слушает только `localhost` |',
              '| `Listen(IPAddress, port)` | слушает конкретный IP |',
              '| `ListenUnixSocket` | слушает Unix socket на Linux |',
              '',
              '## HTTPS',
              '',
              '```csharp',
              'options.ListenAnyIP(5001, o =>',
              '{',
              '    o.UseHttps("cert.pfx", "password");',
              '});',
              '```',
              '',
              '## Ограничения и безопасность',
              '',
              'Через `KestrelServerOptions.Limits` можно ограничивать соединения, размер запроса и таймауты.',
              '',
              '```csharp',
              'options.Limits.MaxConcurrentConnections = 100;',
              'options.Limits.MaxRequestBodySize = 10_000_000;',
              'options.Limits.RequestHeadersTimeout = TimeSpan.FromSeconds(30);',
              '```',
              '',
              'Такие лимиты помогают защищаться от перегрузки и атак вида slowloris.',
              '',
              '## UseUrls - упрощенная настройка',
              '',
              '```csharp',
              'builder.WebHost.UseUrls("http://*:5000");',
              '```',
              '',
              '`UseUrls` удобен, когда нужно просто задать адрес. Для HTTPS, limits и transport-level настройки обычно используют `ConfigureKestrel(...)`.',
              '',
              '## Kestrel в Docker',
              '',
              '```csharp',
              'options.ListenAnyIP(8080);',
              '```',
              '',
              '```dockerfile',
              'EXPOSE 8080',
              '```',
              '',
              '```bash',
              'docker run -p 5000:8080 image-name',
              '```',
              '',
              'Важно различать:',
              '',
              '- внутри контейнера приложение слушает `8080`;',
              '- снаружи контейнера запросы могут приходить, например, на `5000`.',
              '',
              '## Особый случай: Service Fabric',
              '',
              'В Azure Service Fabric Kestrel обычно не владеет портом напрямую. Схема выглядит так:',
              '',
              '```text',
              'Service Fabric -> CommunicationListener -> Kestrel',
              '```',
              '',
              'Runtime выделяет порт и передает готовый URL в `UseUrls(url)`.',
              '',
              '```csharp',
              'new KestrelCommunicationListener(',
              '    serviceContext,',
              '    "ServiceEndpoint",',
              '    (url, listener) =>',
              '    {',
              '        return new WebHostBuilder()',
              '            .UseKestrel()',
              '            .UseStartup<Startup>()',
              '            .UseUrls(url)',
              '            .Build();',
              '    });',
              '```',
              '',
              'Описание endpoint в манифесте может выглядеть так:',
              '',
              '```xml',
              '<Endpoint Name="ServiceEndpoint" Protocol="http" />',
              '```',
              '',
              'В таком сценарии:',
              '',
              '- порт назначает runtime Service Fabric;',
              '- `appsettings.json` обычно не управляет реальным портом сервиса;',
              '- основная привязка идет через `UseUrls(url)`.',
              '',
              'Если используется Service Fabric Reverse Proxy, клиент вообще не обязан знать реальный порт сервиса.',
              '',
              '## Когда использовать какой подход',
              '',
              '| Сценарий | Подход |',
              '| --- | --- |',
              '| простой API | `UseUrls` или `ASPNETCORE_URLS`, если нужна только привязка адреса |',
              '| production | `ConfigureKestrel`, если нужны HTTPS, limits и тонкая настройка |',
              '| Docker или Kubernetes | `ListenAnyIP(...)` + публикация порта контейнера |',
              '| reverse proxy | Kestrel за `NGINX` или `IIS` |',
              '| Service Fabric | `UseUrls(url)`, который передает runtime |',
              '',
              '## Что запомнить',
              '',
              '- Kestrel - это HTTP-сервер, а не фреймворк и не бизнес-логика;',
              '- он принимает соединения, создает `HttpContext` и запускает pipeline;',
              '- адреса и порты можно задавать через config, env и `Listen(...)`;',
              '- в production часто используется связка Kestrel + reverse proxy;',
              '- в Service Fabric порт обычно назначает не Kestrel, а runtime.'
            ), [
          link("Kestrel web server in ASP.NET Core", "https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/kestrel?view=aspnetcore-9.0"),
          link("When to use Kestrel with a reverse proxy", "https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/kestrel/when-to-use-a-reverse-proxy?view=aspnetcore-9.0"),
          link("Developing ASP.NET Core MVC apps", "https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/develop-asp-net-core-mvc-apps")
        ]),
            topic("KestrelServerOptions: Limits", md(
              '![Ограничения Kestrel](/assets/diagrams/webapi/kestrel-stack.svg)',
              '',
              '## Что такое KestrelServerOptions',
              '',
              '`KestrelServerOptions` - это основной объект конфигурации веб-сервера Kestrel.',
              '',
              'Обычно он настраивается в `Program.cs` через `ConfigureKestrel(...)`:',
              '',
              '```csharp',
              'builder.WebHost.ConfigureKestrel(options =>',
              '{',
              '    // настройка здесь',
              '});',
              '```',
              '',
              '## Limits - ограничения сервера',
              '',
              '`options.Limits` - это объект `KestrelServerLimits`, который управляет:',
              '',
              '- производительностью;',
              '- безопасностью;',
              '- защитой от DoS;',
              '- поведением соединений.',
              '',
              '## Основные настройки Limits',
              '',
              '### MaxRequestBodySize',
              '',
              'Максимальный размер тела запроса:',
              '',
              '```csharp',
              'options.Limits.MaxRequestBodySize = 10 * 1024 * 1024; // 10 MB',
              '```',
              '',
              'Что важно:',
              '',
              '- `null` означает отсутствие ограничения;',
              '- размер можно переопределить на уровне endpoint или controller;',
              '- частый override делают через атрибут `RequestSizeLimit`.',
              '',
              '```csharp',
              '[RequestSizeLimit(5_000_000)]',
              'public IActionResult Upload()',
              '{',
              '    return Ok();',
              '}',
              '```',
              '',
              '### KeepAliveTimeout',
              '',
              'Сколько держать соединение открытым:',
              '',
              '```csharp',
              'options.Limits.KeepAliveTimeout = TimeSpan.FromSeconds(120);',
              '```',
              '',
              'Если значение слишком большое:',
              '',
              '- дольше заняты ресурсы сервера;',
              '- выше риск connection exhaustion.',
              '',
              'Если значение слишком маленькое:',
              '',
              '- клиенты чаще переподключаются;',
              '- теряется часть выигрыша от keep-alive.',
              '',
              '### RequestHeadersTimeout',
              '',
              'Сколько ждать заголовки запроса:',
              '',
              '```csharp',
              'options.Limits.RequestHeadersTimeout = TimeSpan.FromSeconds(30);',
              '```',
              '',
              'Это защита от медленных клиентов и атак вида slowloris.',
              '',
              '### MaxConcurrentConnections',
              '',
              'Максимальное количество одновременных соединений:',
              '',
              '```csharp',
              'options.Limits.MaxConcurrentConnections = 100;',
              '```',
              '',
              'Такой лимит полезен, когда нужно ограничить нагрузку и не дать серверу захлебнуться на входе.',
              '',
              '### MaxConcurrentUpgradedConnections',
              '',
              'Ограничение для upgraded connections, например `WebSockets`:',
              '',
              '```csharp',
              'options.Limits.MaxConcurrentUpgradedConnections = 50;',
              '```',
              '',
              '### MaxRequestHeaderCount и MaxRequestHeadersTotalSize',
              '',
              'Ограничения на количество и суммарный размер заголовков:',
              '',
              '```csharp',
              'options.Limits.MaxRequestHeaderCount = 100;',
              'options.Limits.MaxRequestHeadersTotalSize = 32 * 1024;',
              '```',
              '',
              'Это помогает защищаться от header flooding атак.',
              '',
              '### MinRequestBodyDataRate и MinResponseDataRate',
              '',
              'Минимальная скорость передачи данных:',
              '',
              '```csharp',
              'options.Limits.MinRequestBodyDataRate =',
              '    new MinDataRate(bytesPerSecond: 100, gracePeriod: TimeSpan.FromSeconds(10));',
              '',
              'options.Limits.MinResponseDataRate =',
              '    new MinDataRate(bytesPerSecond: 100, gracePeriod: TimeSpan.FromSeconds(10));',
              '```',
              '',
              'Если клиент слишком медленный, соединение будет разорвано. Это защита от slow clients и resource starvation.',
              '',
              '## Что важно понимать про Limits',
              '',
              '- `Limits` применяются на уровне сервера;',
              '- их настраивают как часть линии обороны у HTTP-границы;',
              '- если исключение нужно только одному endpoint, лучше делать точечный override, а не ослаблять весь сервер.',
              '',
              '## AllowSynchronousIO',
              '',
              '```csharp',
              'options.AllowSynchronousIO = false;',
              '```',
              '',
              '`AllowSynchronousIO` разрешает или запрещает синхронный I/O, например:',
              '',
              '- `Stream.Read()`;',
              '- `Stream.Write()`;',
              '- синхронное чтение `HttpRequest.Body`.',
              '',
              'В ASP.NET Core синхронный I/O по умолчанию запрещен, потому что он:',
              '',
              '- блокирует поток;',
              '- плохо масштабируется;',
              '- снижает throughput;',
              '- может привести к thread pool starvation.',
              '',
              'Пример проблемного кода:',
              '',
              '```csharp',
              'var body = new StreamReader(Request.Body).ReadToEnd();',
              '```',
              '',
              'В таком случае приложение обычно получает исключение:',
              '',
              '```text',
              'InvalidOperationException: Synchronous operations are disallowed.',
              '```',
              '',
              'Если очень нужно, синхронный I/O можно включить:',
              '',
              '```csharp',
              'options.AllowSynchronousIO = true;',
              '```',
              '',
              'При хостинге через IIS это можно настраивать и так:',
              '',
              '```csharp',
              'services.Configure<IISServerOptions>(options =>',
              '{',
              '    options.AllowSynchronousIO = true;',
              '});',
              '```',
              '',
              'Когда это реально бывает нужно:',
              '',
              '- legacy-библиотеки;',
              '- старые sync API;',
              '- сторонние SDK без async-вариантов.',
              '',
              'Но включать это без необходимости не стоит: блокирующий I/O удерживает потоки, повышает latency и ухудшает масштабируемость сервиса.',
              '',
              '## Правильный подход',
              '',
              'По умолчанию стоит использовать async I/O:',
              '',
              '```csharp',
              'using var reader = new StreamReader(Request.Body);',
              'var body = await reader.ReadToEndAsync();',
              '```',
              '',
              '## Связь Limits и AllowSynchronousIO',
              '',
              '| Аспект | Limits | AllowSynchronousIO |',
              '| --- | --- | --- |',
              '| Назначение | Ограничения и защита | Управление I/O моделью |',
              '| Влияние | Безопасность и производительность | Масштабируемость и загрузка потоков |',
              '| По умолчанию | Базово настроены | `false` |',
              '| Основной риск | DoS и истощение ресурсов | Thread starvation |',
              '',
              '## Пример полной конфигурации',
              '',
              '```csharp',
              'builder.WebHost.ConfigureKestrel(options =>',
              '{',
              '    options.AllowSynchronousIO = false;',
              '',
              '    options.Limits.MaxRequestBodySize = 10 * 1024 * 1024;',
              '    options.Limits.KeepAliveTimeout = TimeSpan.FromSeconds(60);',
              '    options.Limits.RequestHeadersTimeout = TimeSpan.FromSeconds(30);',
              '',
              '    options.Limits.MaxConcurrentConnections = 100;',
              '    options.Limits.MaxConcurrentUpgradedConnections = 50;',
              '',
              '    options.Limits.MaxRequestHeaderCount = 100;',
              '    options.Limits.MaxRequestHeadersTotalSize = 32 * 1024;',
              '',
              '    options.Limits.MinRequestBodyDataRate =',
              '        new MinDataRate(100, TimeSpan.FromSeconds(10));',
              '',
              '    options.Limits.MinResponseDataRate =',
              '        new MinDataRate(100, TimeSpan.FromSeconds(10));',
              '});',
              '```',
              '',
              '## Best Practices',
              '',
              '### Безопасность',
              '- ограничивайте `MaxRequestBodySize`;',
              '- настраивайте `RequestHeadersTimeout`;',
              '- используйте `MinDataRate` там, где это оправдано.',
              '',
              '### Производительность',
              '- не увеличивайте `KeepAliveTimeout` без причины;',
              '- контролируйте `MaxConcurrentConnections` и upgraded connections;',
              '- подбирайте лимиты под реальный профиль трафика.',
              '',
              '### I/O',
              '- не включайте `AllowSynchronousIO` без реальной необходимости;',
              '- по умолчанию используйте `async/await`;',
              '- синхронный I/O оставляйте только как вынужденную совместимость.',
              '',
              '## Что запомнить',
              '',
              '- `KestrelServerOptions.Limits` - это контроль ресурсов и защита сервера;',
              '- `AllowSynchronousIO` - это переключатель архитектурного уровня;',
              '- `Limits` защищают сервер на входе;',
              '- async I/O делает его масштабируемым.'
            ), [
          link("KestrelServerOptions.Limits", "https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.server.kestrel.core.kestrelserveroptions.limits?view=aspnetcore-10.0"),
          link("KestrelServerLimits.MaxRequestBodySize", "https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.server.kestrel.core.kestrelserverlimits.maxrequestbodysize?view=aspnetcore-9.0"),
          link("Kestrel web server in ASP.NET Core", "https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/kestrel?view=aspnetcore-9.0")
        ]),
            topic("Метрики Kestrel: KestrelEventSource", md(
              '## Обзор',
              '',
              '`KestrelEventSource` - это встроенный механизм диагностики Kestrel, основанный на `EventSource`, `EventCounters` и `EventPipe`/`ETW`.',
              '',
              'Он публикует:',
              '',
              '- низкоуровневые метрики сервера;',
              '- внутренние события Kestrel;',
              '- диагностическую информацию для live-мониторинга и трассировки.',
              '',
              '## Архитектура',
              '',
              '```text',
              'Kestrel',
              '   |',
              '   v',
              'EventSource (Microsoft-AspNetCore-Server-Kestrel)',
              '   |',
              '   v',
              'EventCounters + Events',
              '   |',
              '   +-- dotnet-counters',
              '   +-- dotnet-trace',
              '   +-- EventListener (code)',
              '```',
              '',
              '## Типы данных',
              '',
              '### EventCounters',
              '',
              'Для самого `Microsoft-AspNetCore-Server-Kestrel` обычно смотрят такие counters:',
              '',
              '| Метрика | Описание |',
              '| --- | --- |',
              '| `current-connections` | активные соединения |',
              '| `connection-queue-length` | длина очереди соединений |',
              '| `request-queue-length` | длина очереди запросов |',
              '| `connections-per-second` | скорость новых соединений |',
              '| `tls-handshakes-per-second` | скорость TLS handshake |',
              '| `failed-tls-handshakes` | ошибки TLS handshake |',
              '',
              'Рядом с ними часто смотрят и hosting counters вроде `requests-per-second`, `total-requests` и `failed-requests`, но это уже соседний `EventSource`, а не сам `KestrelEventSource`.',
              '',
              '### Events',
              '',
              '- connection start/stop;',
              '- request start/stop;',
              '- ошибки;',
              '- таймауты.',
              '',
              '## Использование в production',
              '',
              '### dotnet-counters',
              '',
              'Realtime-метрики без перезапуска приложения.',
              '',
              '```bash',
              'dotnet MyApp.dll',
              'dotnet-counters ps',
              'dotnet-counters monitor -p <PID> Microsoft-AspNetCore-Server-Kestrel',
              '```',
              '',
              'Что видно в реальном времени:',
              '',
              '- connections;',
              '- queue;',
              '- TLS handshake;',
              '- другие counters Kestrel.',
              '',
              'Особенности:',
              '',
              '- работает с уже запущенным процессом;',
              '- не требует изменений кода;',
              '- обычно безопасен для краткого production-использования.',
              '',
              '### dotnet-trace',
              '',
              'Сбор подробного trace для анализа проблемы.',
              '',
              '```bash',
              'dotnet-trace collect -p <PID> --providers Microsoft-AspNetCore-Server-Kestrel',
              '```',
              '',
              'Обычный процесс такой:',
              '',
              '- запускают сбор;',
              '- воспроизводят проблему;',
              '- останавливают сбор;',
              '- открывают `trace.nettrace` в `PerfView`, `Visual Studio` или `SpeedScope`.',
              '',
              'Этот инструмент даёт более глубокую картину, но overhead у него выше, чем у counters, поэтому его обычно включают кратковременно.',
              '',
              '### EventListener',
              '',
              'Это подписка на `EventSource` прямо внутри приложения.',
              '',
              '```csharp',
              'public sealed class KestrelListener : EventListener',
              '{',
              '    protected override void OnEventSourceCreated(EventSource eventSource)',
              '    {',
              '        if (eventSource.Name == "Microsoft-AspNetCore-Server-Kestrel")',
              '        {',
              '            EnableEvents(',
              '                eventSource,',
              '                EventLevel.Informational,',
              '                EventKeywords.All,',
              '                new Dictionary<string, string>',
              '                {',
              '                    ["EventCounterIntervalSec"] = "1"',
              '                });',
              '        }',
              '    }',
              '',
              '    protected override void OnEventWritten(EventWrittenEventArgs eventData)',
              '    {',
              '        Console.WriteLine($"Event: {eventData.EventName}");',
              '    }',
              '}',
              '```',
              '',
              'Такой listener может получать и события, и counters, но вместе с ними приходит много низкоуровневого шума.',
              '',
              '## Регистрация в приложении',
              '',
              'Минимальный вариант - просто создать экземпляр:',
              '',
              '```csharp',
              'var listener = new KestrelListener();',
              '```',
              '',
              'Практичнее сразу фильтровать `EventCounters`:',
              '',
              '```csharp',
              'protected override void OnEventWritten(EventWrittenEventArgs eventData)',
              '{',
              '    if (eventData.EventName != "EventCounters" || eventData.Payload?.Count == 0)',
              '    {',
              '        return;',
              '    }',
              '',
              '    if (eventData.Payload[0] is IDictionary<string, object> payload)',
              '    {',
              '        var name = payload["Name"];',
              '        var value = payload.ContainsKey("Mean") ? payload["Mean"] : payload["Increment"];',
              '',
              '        Console.WriteLine($"{name}: {value}");',
              '    }',
              '}',
              '```',
              '',
              '## Production best practices',
              '',
              '| Инструмент | Когда использовать |',
              '| --- | --- |',
              '| `dotnet-counters` | live-мониторинг |',
              '| `dotnet-trace` | расследование проблемы и profiling |',
              '| `APM`, `OpenTelemetry`, `Prometheus` | постоянные метрики |',
              '',
              'Чего обычно не делают:',
              '',
              '- не используют `EventListener` в production как постоянный логгер;',
              '- не строят на `EventListener` основной контур метрик.',
              '',
              '## Реальный сценарий',
              '',
              'Если API начинает тормозить под нагрузкой, обычно идут в таком порядке:',
              '',
              '- смотрят `dotnet-counters`, чтобы проверить очереди, соединения и TLS-handshake;',
              '- рядом оценивают `requests-per-second` и `failed-requests` в hosting counters, чтобы понять общую картину по throughput;',
              '- если причина неочевидна, собирают `dotnet-trace` и уже там ищут CPU bottleneck, блокировки и медленные middleware.',
              '',
              '## Ограничения',
              '',
              '`KestrelEventSource` - это не бизнес-метрики, не SLA и не замена обычному логированию.',
              '',
              'Для работы нужен либо ручной запуск диагностических инструментов, либо интеграция с мониторингом.',
              '',
              '## Связь с другими механизмами',
              '',
              '| Механизм | Роль |',
              '| --- | --- |',
              '| `EventSource` | источник событий |',
              '| `EventCounters` | метрики |',
              '| `DiagnosticSource` | трассировка |',
              '| `ILogger` | логи |',
              '',
              '## Что запомнить',
              '',
              '- `KestrelEventSource` - это низкоуровневый механизм публикации метрик и событий Kestrel;',
              '- в production обычно используют `dotnet-counters` для быстрого среза и `dotnet-trace` для глубокого анализа;',
              '- без явной причины такой сбор не встраивают в код приложения.'
            ), [
          link("Kestrel diagnostics", "https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/kestrel/diagnostics?view=aspnetcore-9.0"),
          link("Well-known EventCounters in .NET", "https://learn.microsoft.com/en-us/dotnet/core/diagnostics/available-counters"),
          link("dotnet-counters diagnostic tool", "https://learn.microsoft.com/en-us/dotnet/core/diagnostics/dotnet-counters")
        ]),
            topic("Formatters для MVC", md(
              '```csharp',
              '[HttpPost]',
              'public IActionResult Create([FromBody] CreateUserRequest request)',
              '{',
              '    return Ok(new { Message = "User created" });',
              '}',
              '```',
              '',
              '## Что происходит под капотом',
              'Клиент отправляет JSON',
              '',
              'Input Formatter:',
              '- читает Content-Type: application/json',
              '- десериализует JSON → CreateUserRequest',
              '',
              'Контроллер работает с объектом',
              '',
              'Output Formatter:',
              '- сериализует результат → JSON',
              '- выставляет Content-Type',
              '',
              '## Типы Formatters',
              '### 1. Input Formatters (входящие)',
              'Отвечают за чтение тела запроса.',
              '',
              'Примеры:',
              '- JSON (по умолчанию через System.Text.Json)',
              '- XML (если подключен)',
              '- custom (например protobuf)',
              '',
              '### 2. Output Formatters (исходящие)',
              'Отвечают за формирование ответа.',
              '',
              'Примеры:',
              '- JSON',
              '- XML',
              '- plain text',
              '- custom форматы',
              '',
              '## Как выбирается Formatter',
              'Выбор происходит на основе:',
              '',
              '### Для Input',
              'Content-Type запроса',
              '',
              '- application/json → JSON formatter',
              '- application/xml → XML formatter',
              '',
              '### Для Output',
              'Accept header (content negotiation)',
              '',
              '```http',
              'Accept: application/xml',
              '```',
              '',
              '→ MVC попробует вернуть XML',
              '',
              '## Content Negotiation (очень важно)',
              'Это механизм выбора формата ответа.',
              '',
              '```http',
              'GET /users',
              'Accept: application/json',
              '```',
              '',
              'или',
              '',
              '```http',
              'Accept: application/xml',
              '```',
              '',
              'MVC:',
              '- смотрит Accept',
              '- ищет подходящий Output Formatter',
              '- если не найден — может вернуть 406 Not Acceptable',
              '',
              '## Настройка Formatters',
              'В Program.cs:',
              '',
              '```csharp',
              'builder.Services',
              '    .AddControllers(options =>',
              '    {',
              '        // удалить formatter',
              '        options.OutputFormatters.RemoveType<SystemTextJsonOutputFormatter>();',
              '',
              '        // добавить кастомный',
              '        options.InputFormatters.Add(new MyCustomFormatter());',
              '    });',
              '```',
              '',
              '## Добавление XML',
              '```csharp',
              'builder.Services',
              '    .AddControllers()',
              '    .AddXmlSerializerFormatters();',
              '```',
              '',
              '## Пример кастомного Formatter',
              'Input Formatter',
              '```csharp',
              'public class CustomTextInputFormatter : TextInputFormatter',
              '{',
              '    public CustomTextInputFormatter()',
              '    {',
              '        SupportedMediaTypes.Add("text/plain");',
              '        SupportedEncodings.Add(Encoding.UTF8);',
              '    }',
              '',
              '    protected override bool CanReadType(Type type)',
              '    {',
              '        return type == typeof(string);',
              '    }',
              '',
              '    public override async Task<InputFormatterResult> ReadRequestBodyAsync(',
              '        InputFormatterContext context, Encoding encoding)',
              '    {',
              '        using var reader = new StreamReader(context.HttpContext.Request.Body, encoding);',
              '        var content = await reader.ReadToEndAsync();',
              '        return await InputFormatterResult.SuccessAsync(content);',
              '    }',
              '}',
              '```',
              '',
              'Output Formatter',
              '```csharp',
              'public class CustomTextOutputFormatter : TextOutputFormatter',
              '{',
              '    public CustomTextOutputFormatter()',
              '    {',
              '        SupportedMediaTypes.Add("text/plain");',
              '        SupportedEncodings.Add(Encoding.UTF8);',
              '    }',
              '',
              '    protected override bool CanWriteType(Type type)',
              '    {',
              '        return true;',
              '    }',
              '',
              '    public override async Task WriteResponseBodyAsync(',
              '        OutputFormatterWriteContext context, Encoding encoding)',
              '    {',
              '        var response = context.HttpContext.Response;',
              '        await response.WriteAsync(context.Object?.ToString());',
              '    }',
              '}',
              '```',
              '',
              '## Когда это реально нужно',
              'Использовать formatters имеет смысл, если:',
              '',
              'Нужно:',
              '- поддержка XML / protobuf / custom формата',
              '- нестандартный формат API (например legacy)',
              '- строгий контроль сериализации',
              '- high-performance кастомная сериализация',
              '',
              'Не нужно:',
              '- обычные REST API → JSON достаточно',
              '- можно обойтись JsonSerializerOptions',
              '',
              '## Важные нюансы',
              '- Formatters работают только в MVC контроллерах',
              '- В Minimal API используется другой механизм (Results + serializers)',
              '- Порядок formatters имеет значение',
              '- Можно сломать content negotiation неправильной настройкой',
              '',
              '## Как это связано с Model Binding',
              'Model Binding → собирает данные из route, query, headers',
              'Formatters → работают только с Body',
              '',
              '```csharp',
              '[FromQuery]  // model binding',
              '[FromBody]   // formatter',
              '```',
              '',
              '## Итог',
              'Formatters = слой сериализации в MVC',
              '',
              'Они:',
              '- читают тело запроса → объект',
              '- пишут объект → HTTP ответ',
              '- участвуют в content negotiation',
              '- расширяются и кастомизируются'
            ), [
          link("Formatting in ASP.NET Core Web API", "https://learn.microsoft.com/en-us/aspnet/core/web-api/advanced/formatting?view=aspnetcore-9.0"),
          link("ObjectResult class", "https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.mvc.objectresult?view=aspnetcore-9.0"),
          link("FormatFilterAttribute", "https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.mvc.formatfilterattribute?view=aspnetcore-9.0"),
          link("Model binding in ASP.NET Core", "https://learn.microsoft.com/en-us/aspnet/core/mvc/models/model-binding?view=aspnetcore-9.0")
        ]),
            topic("Форсирование формата ObjectResult", md(
              '## 1. Что такое ObjectResult и Formatters',
              'Когда ты пишешь:',
              '',
              '```csharp',
              'return Ok(new User { Name = "John" });',
              '```',
              '',
              'под капотом происходит:',
              '- Возвращается OkObjectResult',
              '- Он наследуется от ObjectResult',
              '- ASP.NET Core ищет Output Formatter, чтобы сериализовать объект',
              '',
              'Форматтеры — это классы, которые:',
              '- берут object',
              '- превращают его в HTTP response body',
              '',
              '## Стандартные форматтеры',
              'Добавляются через:',
              '',
              '```csharp',
              'builder.Services.AddControllers();',
              '```',
              '',
              'По умолчанию:',
              '- SystemTextJsonOutputFormatter → JSON',
              '- (опционально) XmlSerializerOutputFormatter → XML',
              '',
              '## 2. Как выбирается формат ответа',
              'ASP.NET Core использует Content Negotiation:',
              '',
              'Учитывается:',
              '- Заголовок Accept',
              '',
              '```http',
              'Accept: application/json',
              'Accept: application/xml',
              '```',
              '',
              '- Поддерживаемые форматтеры',
              '- Настройки MVC',
              '',
              'Пример',
              '',
              '```http',
              'GET /users',
              'Accept: application/xml',
              '```',
              '',
              'Если XML formatter подключён → вернётся XML',
              'Если нет → fallback на JSON',
              '',
              '## 3. Проблема',
              'Иногда нужно:',
              '',
              '> "Этот метод ВСЕГДА должен возвращать JSON (или XML), независимо от Accept"',
              '',
              '## 4. Форсирование формата через ObjectResult',
              'Ты можешь явно указать формат:',
              '',
              '```csharp',
              'return new ObjectResult(user)',
              '{',
              '    ContentTypes = { "application/json" }',
              '};',
              '```',
              '',
              'Это говорит:',
              '',
              '> “используй только JSON formatter”',
              '',
              'Более явный вариант',
              '```csharp',
              'var result = new ObjectResult(user);',
              'result.ContentTypes.Add("application/json");',
              '',
              'return result;',
              '```',
              '',
              '## 5. Через Produces',
              'Более декларативный способ:',
              '',
              '```csharp',
              '[Produces("application/json")]',
              '[HttpGet]',
              'public IActionResult Get()',
              '{',
              '    return Ok(new User { Name = "John" });',
              '}',
              '```',
              '',
              'Это:',
              '- ограничивает формат',
              '- влияет на Swagger',
              '- участвует в content negotiation',
              '',
              'Но важно',
              '',
              '[Produces] не всегда 100% форсирует, если есть конфликт с Accept',
              '',
              '## 6. Жёсткое форсирование (игнор Accept)',
              'Если нужно полностью игнорировать Accept, есть варианты:',
              '',
              'Вариант 1: Убрать другие форматтеры',
              '```csharp',
              'builder.Services.AddControllers(options =>',
              '{',
              '    options.OutputFormatters.Clear();',
              '    options.OutputFormatters.Add(new SystemTextJsonOutputFormatter(...));',
              '});',
              '```',
              '',
              'Глобально только JSON',
              '',
              'Вариант 2: Кастомный ObjectResult',
              '```csharp',
              'public class JsonOnlyResult : ObjectResult',
              '{',
              '    public JsonOnlyResult(object value) : base(value)',
              '    {',
              '        ContentTypes.Add("application/json");',
              '    }',
              '}',
              '```',
              '',
              'Использование:',
              '',
              '```csharp',
              'return new JsonOnlyResult(user);',
              '```',
              '',
              'Вариант 3: Явный JsonResult',
              '```csharp',
              'return new JsonResult(user);',
              '```',
              '',
              'Это уже:',
              '- минует negotiation',
              '- всегда JSON',
              '',
              '## 7. Через FormatFilter (query-based)',
              'Можно менять формат через query:',
              '',
              '```csharp',
              '[FormatFilter]',
              '[HttpGet("{id}.{format?}")]',
              'public IActionResult Get(int id)',
              '{',
              '    return Ok(user);',
              '}',
              '```',
              '',
              'Запросы:',
              '- /users/1.json',
              '- /users/1.xml',
              '',
              '## 8. Как это работает внутри',
              'Pipeline:',
              '',
              '```text',
              'Controller → IActionResult → ObjectResult',
              '        ↓',
              'Content Negotiation',
              '        ↓',
              'Output Formatter выбран',
              '        ↓',
              'WriteResponseBodyAsync()',
              '```',
              '',
              '## 9. Важные нюансы',
              '### 1. ContentTypes vs Accept',
              'ContentTypes → ограничивает результат',
              'Accept → пожелание клиента',
              '',
              '### 2. Если формат не найден',
              '→ HTTP 406 Not Acceptable',
              '',
              '### 3. JsonResult vs ObjectResult',
              '| Тип | Поведение |',
              '| --- | --- |',
              '| ObjectResult | negotiation |',
              '| JsonResult | всегда JSON |',
              '',
              '## 10. Реальный пример',
              '```csharp',
              '[HttpGet("strict-json")]',
              'public IActionResult GetStrict()',
              '{',
              '    var user = new User { Name = "John" };',
              '',
              '    return new ObjectResult(user)',
              '    {',
              '        ContentTypes = { "application/json" }',
              '    };',
              '}',
              '```',
              '',
              'Альтернатива',
              '```csharp',
              'return new JsonResult(user);',
              '```',
              '',
              '## 11. Когда что использовать',
              'Используй ObjectResult + ContentTypes, если:',
              '- нужен контроль',
              '- но оставить negotiation',
              '',
              'Используй JsonResult, если:',
              '- нужен жёсткий JSON',
              '- игнор Accept',
              '',
              'Используй [Produces], если:',
              '- нужна декларация API',
              '- Swagger/OpenAPI',
              '',
              '## Итог',
              'Formatters + ObjectResult = механизм сериализации ответа',
              '',
              'Форсирование формата можно сделать:',
              '',
              '| Способ | Жёсткость |',
              '| --- | --- |',
              '| [Produces] | мягкое |',
              '| ContentTypes | среднее |',
              '| JsonResult | жёсткое |',
              '| кастомный Result | полный контроль |'
            ), [
          link("ObjectResult.ContentTypes", "https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.mvc.objectresult.contenttypes?view=aspnetcore-10.0"),
          link("FormatFilterAttribute", "https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.mvc.formatfilterattribute?view=aspnetcore-9.0"),
          link("Action return types in ASP.NET Core Web API", "https://learn.microsoft.com/en-us/aspnet/core/web-api/action-return-types?view=aspnetcore-10.0"),
          link("ProducesAttribute", "https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.mvc.producesattribute?view=aspnetcore-9.0"),
          link("JsonResult", "https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.mvc.jsonresult?view=aspnetcore-9.0")
        ]),
            topic("HealthChecks", md(
              "![Health checks](/assets/diagrams/webapi/healthchecks.svg)",
              "",
              "## Что такое Health Checks",
              "",
              "Health Check — это endpoint (обычно `/health`), который сообщает:",
              "",
              "- работает ли приложение",
              "- доступны ли зависимости (DB, Redis, API и т.д.)",
              "- можно ли отправлять трафик на сервис",
              "",
              "## Зачем нужны Health Checks",
              "",
              "Основные сценарии:",
              "",
              "### 1. Оркестрация (Kubernetes, Docker)",
              "",
              "- Liveness probe → жив ли сервис (если нет → перезапуск)",
              "- Readiness probe → готов ли принимать трафик",
              "",
              "### 2. Load Balancer",
              "",
              "- исключает “плохие” инстансы",
              "",
              "### 3. Мониторинг",
              "",
              "- интеграция с Prometheus / Grafana",
              "",
              "## Базовая настройка",
              "",
              "### 1. Подключение",
              "",
              "```csharp",
              "builder.Services.AddHealthChecks();",
              "```",
              "",
              "### 2. Добавление endpoint",
              "",
              "```csharp",
              "app.MapHealthChecks(\"/health\");",
              "```",
              "",
              "После этого:",
              "",
              "```http",
              "GET /health",
              "```",
              "",
              "вернёт:",
              "",
              "```text",
              "Healthy",
              "```",
              "",
              "## Проверка зависимостей",
              "",
              "Пример: база данных",
              "",
              "```csharp",
              "builder.Services.AddHealthChecks()",
              "    .AddSqlServer(",
              "        connectionString: builder.Configuration.GetConnectionString(\"Default\"),",
              "        name: \"sql\",",
              "        failureStatus: HealthStatus.Unhealthy);",
              "```",
              "",
              "Пример: Redis",
              "",
              "```csharp",
              ".AddRedis(\"localhost:6379\", name: \"redis\");",
              "```",
              "",
              "Пример: HTTP сервис",
              "",
              "```csharp",
              ".AddUrlGroup(new Uri(\"https://api.example.com\"), name: \"external-api\");",
              "```",
              "",
              "## Кастомный Health Check",
              "",
              "Иногда нужно проверить что-то специфичное.",
              "",
              "### Реализация",
              "",
              "```csharp",
              "public class CustomHealthCheck : IHealthCheck",
              "{",
              "    public Task<HealthCheckResult> CheckHealthAsync(",
              "        HealthCheckContext context,",
              "        CancellationToken cancellationToken = default)",
              "    {",
              "        var isHealthy = true;",
              "",
              "        if (isHealthy)",
              "        {",
              "            return Task.FromResult(",
              "                HealthCheckResult.Healthy(\"OK\"));",
              "        }",
              "",
              "        return Task.FromResult(",
              "            HealthCheckResult.Unhealthy(\"Something failed\"));",
              "    }",
              "}",
              "```",
              "",
              "### Регистрация",
              "",
              "```csharp",
              "builder.Services.AddHealthChecks()",
              "    .AddCheck<CustomHealthCheck>(\"custom\");",
              "```",
              "",
              "## Tags (очень важно)",
              "",
              "Позволяют разделять проверки.",
              "",
              "```csharp",
              ".AddSqlServer(..., tags: new[] { \"ready\" })",
              ".AddRedis(..., tags: new[] { \"live\" });",
              "```",
              "",
              "### Разделение endpoint-ов",
              "",
              "```csharp",
              "app.MapHealthChecks(\"/health/live\", new HealthCheckOptions",
              "{",
              "    Predicate = check => check.Tags.Contains(\"live\")",
              "});",
              "",
              "app.MapHealthChecks(\"/health/ready\", new HealthCheckOptions",
              "{",
              "    Predicate = check => check.Tags.Contains(\"ready\")",
              "});",
              "```",
              "",
              "## Формат ответа (JSON)",
              "",
              "По умолчанию возвращается строка. Лучше сделать JSON:",
              "",
              "```csharp",
              "app.MapHealthChecks(\"/health\", new HealthCheckOptions",
              "{",
              "    ResponseWriter = async (context, report) =>",
              "    {",
              "        context.Response.ContentType = \"application/json\";",
              "",
              "        var result = JsonSerializer.Serialize(new",
              "        {",
              "            status = report.Status.ToString(),",
              "            checks = report.Entries.Select(e => new",
              "            {",
              "                name = e.Key,",
              "                status = e.Value.Status.ToString(),",
              "                error = e.Value.Exception?.Message",
              "            })",
              "        });",
              "",
              "        await context.Response.WriteAsync(result);",
              "    }",
              "});",
              "```",
              "",
              "## Статусы",
              "",
              "- `HealthStatus.Healthy`",
              "- `HealthStatus.Degraded`",
              "- `HealthStatus.Unhealthy`",
              "",
              "Когда использовать:",
              "",
              "- Healthy → всё ок",
              "- Degraded → работает, но есть проблемы (например, slow DB)",
              "- Unhealthy → сервис нельзя использовать",
              "",
              "## Важные настройки",
              "",
              "### Таймаут",
              "",
              "```csharp",
              ".AddSqlServer(..., timeout: TimeSpan.FromSeconds(3));",
              "```",
              "",
              "### Кэширование (важно для нагрузки)",
              "",
              "`HealthCheckPublisherOptions`",
              "",
              "или через собственный кэш, чтобы не дергать БД каждый раз.",
              "",
              "## Частые ошибки",
              "",
              "- Проверки делают реальные тяжёлые запросы",
              "",
              "→ health check должен быть быстрым",
              "",
              "- Один endpoint для всего",
              "",
              "→ лучше разделять:",
              "",
              "- `/live`",
              "- `/ready`",
              "",
              "- Нет таймаутов",
              "",
              "→ может повесить поток",
              "",
              "- Использование как бизнес-логики",
              "",
              "→ health check ≠ мониторинг бизнес-процессов",
              "",
              "## Расширения экосистемы",
              "",
              "Полезные пакеты:",
              "",
              "- `AspNetCore.HealthChecks.UI`",
              "- `AspNetCore.HealthChecks.Prometheus`",
              "- `AspNetCore.HealthChecks.SqlServer`",
              "- `AspNetCore.HealthChecks.Redis`",
              "",
              "## Как это выглядит в проде",
              "",
              "Типичная схема:",
              "",
              "```text",
              "Kubernetes",
              " ├── /health/live   → просто \"жив ли процесс\"",
              " └── /health/ready  → проверка DB, Redis, API",
              "```",
              "",
              "## Best Practices",
              "",
              "- Разделяй liveness и readiness",
              "- Делай проверки быстрыми (< 100ms)",
              "- Добавляй timeout",
              "- Используй tags",
              "- Не проверяй всё на каждом запросе (кэшируй)",
              "- Логируй ошибки внутри health checks",
              "",
              "## Итог",
              "",
              "Health Checks в .NET — это:",
              "",
              "- стандартный механизм проверки состояния приложения",
              "- критически важная часть production-инфраструктуры",
              "- простой в настройке, но требующий аккуратного использования"
            ), [
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
            topic("FromServices, FromRoute и др.", `![Binding sources](/assets/diagrams/webapi/model-binding.svg)

## Общая идея Model Binding

По умолчанию ASP.NET Core сам пытается угадать источник данных:

- Route
- Query string
- Body
- Headers
- Form
- Services (DI)

Но это не всегда очевидно, поэтому используются явные атрибуты.

Разберём каждый атрибут подробно.

## 1. [FromRoute]

Берёт значение из маршрута (URL path).

### Пример

\`\`\`csharp
[HttpGet("users/{id}")]
public IActionResult GetUser([FromRoute] int id)
{
    return Ok($"User id = {id}");
}
\`\`\`

Запрос:

\`\`\`http
GET /users/42
\`\`\`

Результат:

\`\`\`text
id = 42
\`\`\`

### Когда использовать

- Когда значение явно часть URL
- REST-style endpoints (/orders/{id})

## 2. [FromQuery]

Берёт данные из query string

### Пример

\`\`\`csharp
[HttpGet("users")]
public IActionResult GetUsers([FromQuery] int page, [FromQuery] int pageSize)
{
    return Ok(new { page, pageSize });
}
\`\`\`

Запрос:

\`\`\`http
GET /users?page=2&pageSize=10
\`\`\`

### Особенности

Поддерживает complex types:

\`\`\`csharp
public class Filter
{
    public string Name { get; set; }
    public int Age { get; set; }
}

[HttpGet]
public IActionResult Search([FromQuery] Filter filter)
\`\`\`

\`\`\`http
GET /search?name=John&age=30
\`\`\`

## 3. [FromHeader]

Берёт данные из HTTP headers

### Пример

\`\`\`csharp
[HttpGet]
public IActionResult Get([FromHeader(Name = "X-Request-Id")] string requestId)
{
    return Ok(requestId);
}
\`\`\`

Заголовок:

\`\`\`http
X-Request-Id: abc-123
\`\`\`

### Когда использовать

- Correlation ID
- Versioning
- Custom headers

## 4. [FromBody]

Берёт данные из тела HTTP-запроса

### Пример

\`\`\`csharp
public class CreateUserRequest
{
    public string Name { get; set; }
}

[HttpPost]
public IActionResult Create([FromBody] CreateUserRequest request)
{
    return Ok(request.Name);
}
\`\`\`

Запрос:

\`\`\`http
POST /users
Content-Type: application/json

{
  "name": "John"
}
\`\`\`

### Важно

- Использует input formatters (обычно JSON)
- Только один [FromBody] параметр на метод

Причина: тело запроса можно прочитать только один раз

## 5. [FromForm]

Берёт данные из form-data / x-www-form-urlencoded

### Пример

\`\`\`csharp
[HttpPost]
public IActionResult Upload([FromForm] string name, [FromForm] IFormFile file)
{
    return Ok(name);
}
\`\`\`

Используется для:

- Upload файлов
- HTML форм

## 6. [FromServices]

Берёт данные из Dependency Injection контейнера

### Пример

\`\`\`csharp
[HttpGet]
public IActionResult Get([FromServices] ILogger<MyController> logger)
{
    logger.LogInformation("Called");
    return Ok();
}
\`\`\`

### Когда использовать

Редко
Обычно лучше через конструктор

Но полезно:

- в Minimal API
- для единичных зависимостей

## Сравнение

| Атрибут | Источник данных | Когда использовать |
| --- | --- | --- |
| FromRoute | URL path | REST endpoints |
| FromQuery | Query string | фильтры, пагинация |
| FromHeader | Headers | мета-информация |
| FromBody | Body (JSON/XML) | POST/PUT |
| FromForm | Form-data | формы / файлы |
| FromServices | DI контейнер | зависимости |

## Важные нюансы

### 1. Приоритет биндинга

Без атрибутов:

- Route
- Query
- Body (для complex типов)

Может привести к неожиданностям

### 2. [ApiController] меняет поведение

Если используется:

\`\`\`csharp
[ApiController]
\`\`\`

Тогда:

- Complex types → автоматически [FromBody]
- Simple types → [FromRoute] / [FromQuery]

### 3. Null и validation

С [ApiController]:

- Автоматическая валидация ModelState
- 400 response при ошибке

### 4. Комбинирование

Можно смешивать:

\`\`\`csharp
public IActionResult Example(
    [FromRoute] int id,
    [FromQuery] string filter,
    [FromHeader(Name = "X-Trace")] string traceId)
\`\`\`

## Практический пример

\`\`\`csharp
[HttpPost("users/{id}")]
public IActionResult UpdateUser(
    [FromRoute] int id,
    [FromQuery] bool notify,
    [FromHeader(Name = "X-Request-Id")] string requestId,
    [FromBody] UpdateUserRequest request,
    [FromServices] IUserService service)
{
    service.Update(id, request);

    return Ok(new { id, notify, requestId });
}
\`\`\`

## Когда обязательно указывать явно

Используй атрибуты, если:

- Есть неоднозначность
- Публичный API
- Важна читаемость
- Разные источники данных в одном методе

## Вывод

Эти атрибуты:

- делают код предсказуемым
- устраняют магию model binding
- повышают читаемость API

В production-коде почти всегда лучше указывать явно, особенно для публичных API.`, [
          link("Model binding in ASP.NET Core", "https://learn.microsoft.com/en-us/aspnet/core/mvc/models/model-binding?view=aspnetcore-9.0"),
          link("Parameter binding in minimal APIs", "https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/parameter-binding?view=aspnetcore-9.0"),
          link("ApiControllerAttribute", "https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.mvc.apicontrollerattribute?view=aspnetcore-9.0"),
          link("FromRouteAttribute", "https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.mvc.fromrouteattribute?view=aspnetcore-9.0"),
          link("FromQueryAttribute", "https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.mvc.fromqueryattribute?view=aspnetcore-9.0"),
          link("FromHeaderAttribute", "https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.mvc.fromheaderattribute?view=aspnetcore-9.0"),
          link("FromBodyAttribute", "https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.mvc.frombodyattribute?view=aspnetcore-9.0"),
          link("FromFormAttribute", "https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.mvc.fromformattribute?view=aspnetcore-9.0"),
          link("FromServicesAttribute", "https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.mvc.fromservicesattribute?view=aspnetcore-9.0"),
          link("File uploads in ASP.NET Core", "https://learn.microsoft.com/en-us/aspnet/core/mvc/models/file-uploads?view=aspnetcore-9.0"),
          link("Dependency injection in ASP.NET Core", "https://learn.microsoft.com/en-us/aspnet/core/fundamentals/dependency-injection?view=aspnetcore-9.0"),
          link("Formatting in ASP.NET Core Web API", "https://learn.microsoft.com/en-us/aspnet/core/web-api/advanced/formatting?view=aspnetcore-9.0")
        ]),
            topic("ModelBinding", `![Binding flow](/assets/diagrams/webapi/model-binding.svg)

## Model Binding в ASP.NET Core

Model Binding — это механизм, который:

- берёт данные из HTTP-запроса
- преобразует их
- передаёт в параметры метода контроллера

Без него тебе пришлось бы вручную парсить Request.Query, Request.Body и т.д.

## Как это работает (базово)

\`\`\`csharp
public IActionResult GetUser(int id)
{
    return Content($"User ID: {id}");
}
\`\`\`

Запрос:

\`\`\`http
GET /User/GetUser?id=5
\`\`\`

id автоматически станет 5

## Пример с моделью

\`\`\`csharp
public class User
{
    public string Name { get; set; }
    public int Age { get; set; }
}

[HttpPost]
public IActionResult Create(User user)
{
    return Ok(user);
}
\`\`\`

JSON:

\`\`\`json
{
  "name": "Alex",
  "age": 25
}
\`\`\`

user заполняется автоматически

## Источники данных (Binding Sources)

Model Binding использует:

- Query (?id=1)
- Route (/users/1)
- Body (JSON/XML)
- Form-data
- Headers

## Управление через атрибуты

\`\`\`csharp
[FromQuery] int id
[FromRoute] int id
[FromBody] User user
[FromHeader] string token
\`\`\`

## Валидация модели

\`\`\`csharp
public class User
{
    [Required]
    public string Name { get; set; }

    [Range(0, 120)]
    public int Age { get; set; }
}
if (!ModelState.IsValid)
{
    return BadRequest(ModelState);
}
\`\`\`

## Влияние [ApiController]

Атрибут ApiControllerAttribute меняет поведение Model Binding.

### 1. Автоопределение источников

\`\`\`csharp
public IActionResult Create(User user)
\`\`\`

- сложные типы → из body (без [FromBody])
- простые → из route/query

### 2. Автоматическая валидация

\`\`\`csharp
public IActionResult Create(User user)
{
    return Ok(user);
}
\`\`\`

- если модель невалидна → 400 автоматически
- action не вызывается

### 3. Стандарт ошибок (ProblemDetails)

\`\`\`json
{
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "Name": ["The Name field is required."]
  }
}
\`\`\`

### 4. Строгое поведение

- нет значения → ошибка
- неверный тип → ошибка
- нет body → ошибка

### 5. Только один [FromBody]

\`\`\`csharp
public IActionResult Test(User user, AnotherModel model)
\`\`\`

ошибка — body читается один раз

### 6. Route binding без атрибутов

\`\`\`csharp
[HttpGet("{id}")]
public IActionResult Get(int id)
\`\`\`

[FromRoute] не нужен

## Отключение поведения

\`\`\`csharp
services.Configure<ApiBehaviorOptions>(options =>
{
    options.SuppressModelStateInvalidFilter = true;
});
\`\`\`

## Pipeline Model Binding

Теперь самое важное — что происходит внутри.

## Полный pipeline

\`\`\`text
HTTP Request
     ↓
Routing (Endpoint)
     ↓
Value Providers
     ↓
Model Binder Selection
     ↓
Model Binding
     ↓
Input Formatters (Body)
     ↓
Validation
     ↓
[ApiController]? → авто 400
     ↓
Controller Action
\`\`\`

## 1. Routing

Endpoint Routing определяет:

- какой controller
- какой action
- какие параметры

## 2. Value Providers

Собирают данные из:

- Query
- Route
- Form
- Headers

## 3. Выбор Model Binder

Фреймворк выбирает биндер:

- SimpleTypeModelBinder → int, string
- ComplexTypeModelBinder → объекты
- BodyModelBinder → JSON
- кастомный биндер

## 4. Model Binding

Происходит:

- поиск значений
- конвертация
- создание объекта
- заполнение свойств

Ошибки → ModelState

## 5. Input Formatters

Если [FromBody]:

JSON → объект (через System.Text.Json)

## 6. Валидация

- DataAnnotations
- кастомные валидаторы

## 7. [ApiController]

если ошибка → pipeline обрывается (400)

## 8. Вызов Action

Контроллер получает готовые данные

## Кастомный Model Binder

Используется, когда стандартного поведения недостаточно.

### Пример: "10-20" → объект

Запрос:

\`\`\`http
GET /api/test?range=10-20
\`\`\`

Модель:

\`\`\`csharp
public class Range
{
    public int From { get; set; }
    public int To { get; set; }
}
\`\`\`

## Реализация биндинга

\`\`\`csharp
using Microsoft.AspNetCore.Mvc.ModelBinding;

public class RangeModelBinder : IModelBinder
{
    public Task BindModelAsync(ModelBindingContext context)
    {
        var value = context.ValueProvider
            .GetValue(context.ModelName)
            .FirstValue;

        if (string.IsNullOrEmpty(value))
            return Task.CompletedTask;

        var parts = value.Split('-');

        if (parts.Length != 2 ||
            !int.TryParse(parts[0], out var from) ||
            !int.TryParse(parts[1], out var to))
        {
            context.ModelState.AddModelError(
                context.ModelName,
                "Invalid range format"
            );
            return Task.CompletedTask;
        }

        var result = new Range
        {
            From = from,
            To = to
        };

        context.Result = ModelBindingResult.Success(result);
        return Task.CompletedTask;
    }
}
\`\`\`

## Использование

\`\`\`csharp
public IActionResult Get(
    [ModelBinder(BinderType = typeof(RangeModelBinder))] Range range)
{
    return Ok(range);
}
\`\`\`

## Результат

\`\`\`http
GET /api/test?range=10-20
\`\`\`

\`\`\`json
{
  "from": 10,
  "to": 20
}
\`\`\`

## Важные нюансы и edge-cases

### Body читается один раз

нельзя несколько [FromBody]

### Nullable vs Required

\`\`\`csharp
int Age      // ошибка если нет значения
int? Age     // будет null
\`\`\`

### Binding vs Validation ошибки

Binding → не смогли преобразовать ("abc" → int)
Validation → нарушено правило ([Range])

### Имена имеют значение

должны совпадать с параметрами

## Итог

Model Binding в ASP.NET Core — это:

- автоматическое преобразование HTTP → C#
- поддержка разных источников данных
- интеграция с валидацией
- расширяемость через кастомные биндеры

[ApiController] делает его:

- более строгим
- более автоматическим
- удобным для API

Pipeline даёт понимание:

- где именно можно влиять на поведение (биндеры, форматтеры, валидация)`, [
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
На момент **18 апреля 2026** на сайте OWASP последней web-редакцией остаётся **Top 10:2025**. На практике Top 10 полезен не как "прошли чек-лист и забыли", а как словарь для разговоров между разработкой, QA, архитектурой и безопасностью.

## Категории Top 10:2025
- **A01 Broken Access Control** - ошибки в правах доступа: пользователь получает чужие данные, выходит за пределы своей роли или обходит проверку доступа к объекту и операции.
- **A02 Security Misconfiguration** - небезопасные настройки: дефолтные параметры, лишние сервисы, слишком подробные ошибки, слабые security headers и ошибки cloud-конфигурации.
- **A03 Software Supply Chain Failures** - риски в цепочке поставки ПО: скомпрометированные пакеты, registry, build pipeline, артефакты и процессы доставки.
- **A04 Cryptographic Failures** - проблемы с криптографией: слабые алгоритмы, плохое управление ключами, отсутствие шифрования там, где оно нужно.
- **A05 Injection** - внедрение вредоносных команд: опасное смешивание пользовательского ввода с SQL, shell, LDAP, шаблонами или другими интерпретаторами.
- **A06 Insecure Design** - небезопасный дизайн: риск заложен в архитектуре, бизнес-процессе или модели угроз ещё до конкретной реализации.
- **A07 Authentication Failures** - ошибки аутентификации: слабые пароли, плохая защита сессий, обход логина, проблемы с MFA и lifecycle учётных данных.
- **A08 Software or Data Integrity Failures** - нарушения доверия к коду и данным: приложение принимает обновления, конфигурации, артефакты или внешние данные без достаточной проверки целостности.
- **A09 Security Logging and Alerting Failures** - проблемы с логированием и реакцией на события: атака идёт, но команда не видит сигнал, не поднимает alert и не может быстро расследовать инцидент.
- **A10 Mishandling of Exceptional Conditions** - неправильная обработка нештатных ситуаций: fail-open сценарии, утечки через ошибки, некорректная работа при сбоях, пропущенных параметрах и исключениях.

## Как список изменился относительно 2021
- **SSRF** больше не отдельный пункт: в 2025 его включили в **A01 Broken Access Control**.
- **Security Misconfiguration** поднялся с A05:2021 на A02:2025, потому что доля проблем, завязанных на конфигурацию, выросла.
- **Vulnerable and Outdated Components** переработали в **A03 Software Supply Chain Failures**: теперь речь не только о старых версиях библиотек, но и обо всей цепочке сборки и поставки ПО.
- **Cryptographic Failures**, **Injection** и **Insecure Design** остались в списке, но сместились ниже: A02 -> A04, A03 -> A05, A04 -> A06.
- **Identification and Authentication Failures** переименовали в **Authentication Failures** без смены сути категории.
- **Software and Data Integrity Failures** сохранил идею, но в 2025 официальное название звучит как **Software or Data Integrity Failures**.
- **Security Logging and Monitoring Failures** переименовали в **Security Logging and Alerting Failures**, чтобы подчеркнуть важность не только логов, но и своевременной реакции.
- В 2025 появился новый пункт **A10 Mishandling of Exceptional Conditions** про ошибки обработки исключений, fail-open и небезопасное поведение системы в нештатных условиях.

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





