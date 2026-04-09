const article = ({ what, problem, code, important = [] }) => {
  const parts = [
    "## Что это",
    what.trim(),
    "",
    "## Какую проблему решает",
    problem.trim(),
    "",
    "## Пример реализации",
    "",
    "```csharp",
    code.trim(),
    "```"
  ];

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
      topic("Слои (Layers)", article({
        what: "Слои разделяют ответственность: `Presentation` принимает запрос, `Application` координирует сценарий, `Domain` хранит бизнес-правила, `Infrastructure` работает с БД и внешними сервисами.",
        problem: "Так HTTP, EF Core и интеграции не протекают в доменную модель, а изменения локализуются в одном месте.",
        code: `
public sealed class OrdersController : ControllerBase
{
    [HttpPost("/orders")]
    public Task<Guid> Create(
        [FromBody] CreateOrderCommand command,
        [FromServices] CreateOrderHandler handler,
        CancellationToken ct) =>
        handler.Handle(command, ct);
}
        `,
        important: [
          "Зависимости должны смотреть внутрь, а не наружу.",
          "Контроллер вызывает use case, а не пишет бизнес-логику сам."
        ]
      }), [link("The Clean Architecture — Uncle Bob", "https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html")]),
      topic("Чистая архитектура (Clean Architecture)", article({
        what: "Clean Architecture держит бизнес-правила в центре и заставляет внешний код зависеть от абстракций ядра, а не наоборот.",
        problem: "Это позволяет менять ORM, UI, способ запуска и интеграции без переписывания бизнес-логики.",
        code: `
public interface IOrderRepository
{
    Task AddAsync(Order order, CancellationToken ct);
}

public sealed class EfOrderRepository : IOrderRepository
{
    private readonly AppDbContext _db;

    public EfOrderRepository(AppDbContext db)
    {
        _db = db;
    }

    public Task AddAsync(Order order, CancellationToken ct)
    {
        _db.Orders.Add(order);
        return Task.CompletedTask;
    }
}
        `
      }), [link("Clean Architecture — оригинал", "https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html")]),
      topic("Разделение на компоненты и модули", article({
        what: "Модули группируют код по фиче или bounded context, чтобы внутри лежали свои контроллеры, application-слой, домен и инфраструктура.",
        problem: "Это уменьшает связанность между частями монолита и позволяет развивать фичи почти как отдельные мини-приложения.",
        code: `
public static class BillingModule
{
    public static IServiceCollection AddBilling(this IServiceCollection services)
    {
        services.AddScoped<CreateInvoiceHandler>();
        services.AddScoped<IInvoiceRepository, InvoiceRepository>();
        return services;
    }
}
        `
      })),
      topic("Реализация Outbox", article({
        what: "Outbox сохраняет доменное событие в отдельную таблицу в той же транзакции, что и изменение агрегата, а публикует его уже фоновый процесс.",
        problem: "Это убирает потерю событий между шагами `сохранили в БД` и `отправили в брокер`.",
        code: `
public sealed class UnitOfWork
{
    private readonly AppDbContext _db;

    public UnitOfWork(AppDbContext db)
    {
        _db = db;
    }

    public async Task CommitAsync(CancellationToken ct)
    {
        var domainEvents = _db.ChangeTracker
            .Entries<AggregateRoot>()
            .SelectMany(entry => entry.Entity.DomainEvents)
            .ToList();

        foreach (var domainEvent in domainEvents)
        {
            _db.OutboxMessages.Add(OutboxMessage.Create(domainEvent));
        }

        await _db.SaveChangesAsync(ct);
    }
}
        `,
        important: [
          "Событие записывается в БД атомарно вместе с агрегатом.",
          "Публикация наружу выполняется отдельно и может безопасно ретраиться."
        ]
      }), [link("microservices.io — Outbox", "https://microservices.io/patterns/data/transactional-outbox.html")]),
      topic("Domain layer — что пишем, структура", article({
        what: "В `Domain` лежат агрегаты, entities, value objects, domain services и domain events. Здесь нет контроллеров, SQL и вызовов брокеров.",
        problem: "Это держит бизнес-правила в одном месте и не даёт инфраструктуре определять поведение модели.",
        code: `
public sealed record Email
{
    public string Value { get; }

    public Email(string value)
    {
        if (string.IsNullOrWhiteSpace(value) || !value.Contains("@"))
            throw new ArgumentException("Email is invalid.");

        Value = value.Trim().ToLowerInvariant();
    }
}

public sealed class Customer
{
    public Guid Id { get; private set; }
    public Email Email { get; private set; } = new Email("demo@example.com");

    public void ChangeEmail(Email email)
    {
        Email = email;
    }
}
        `
      })),
      topic("Application layer — что пишем, структура", article({
        what: "Application слой описывает use cases: принимает команду, загружает агрегат, вызывает доменный метод и сохраняет изменения.",
        problem: "Так контроллеры, джобы и интеграции не дублируют оркестрацию одного и того же сценария.",
        code: `
public sealed record CancelOrderCommand(Guid OrderId);

public sealed class CancelOrderHandler
{
    private readonly IOrderRepository _orders;
    private readonly IUnitOfWork _unitOfWork;

    public async Task Handle(CancelOrderCommand command, CancellationToken ct)
    {
        var order = await _orders.GetByIdAsync(command.OrderId, ct);
        order.Cancel();
        await _unitOfWork.SaveChangesAsync(ct);
    }
}
        `
      })),
      topic("Изучение DDD-проекта ТЛ", article({
        what: "Эта тема про разбор реального DDD-проекта: смотреть на границы модулей, направление зависимостей, расположение use cases и правила внутри агрегатов.",
        problem: "Без живого проекта DDD остаётся теорией, а реальная codebase быстро показывает, где команда нарушает границы слоёв.",
        code: `
[Fact]
public void Domain_Should_Not_Depend_On_Infrastructure()
{
    var result = Types.InAssembly(typeof(Order).Assembly)
        .ShouldNot()
        .HaveDependencyOn("Demo.Infrastructure")
        .GetResult();

    result.IsSuccessful.Should().BeTrue();
}
        `
      }))
    ]
  },  {
    id: "patterns", title: "Паттерны проектирования", icon: "&#9873;", color: "amber",
    rows: [
      topic("Порождающие (Creational)", article({
        what: "Порождающие паттерны управляют созданием объектов, когда конструктор уже не отражает всей сложности инициализации.",
        problem: "Они убирают условную сборку объектов из клиентского кода и централизуют создание зависимостей.",
        code: `
public interface IPaymentClient
{
    Task ChargeAsync(decimal amount, CancellationToken ct);
}

public sealed class PaymentClientFactory
{
    public IPaymentClient Create(string provider) =>
        provider switch
        {
            "stripe" => new StripePaymentClient(),
            "paypal" => new PaypalPaymentClient(),
            _ => throw new NotSupportedException(provider)
        };
}
        `
      }), [link("refactoring.guru — порождающие", "https://refactoring.guru/ru/design-patterns/creational-patterns")]),
      topic("Структурные (Structural)", article({
        what: "Структурные паттерны помогают безопасно склеивать уже существующие классы и интерфейсы.",
        problem: "Они особенно полезны при интеграции с чужим API или когда нужно добавить поведение без изменения исходного класса.",
        code: `
public interface INotifier
{
    Task SendAsync(string message, CancellationToken ct);
}

public sealed class SlackApi
{
    public Task PostMessageAsync(string text, CancellationToken ct) => Task.CompletedTask;
}

public sealed class SlackNotifier : INotifier
{
    private readonly SlackApi _api = new();

    public Task SendAsync(string message, CancellationToken ct) =>
        _api.PostMessageAsync(message, ct);
}
        `
      }), [link("refactoring.guru — структурные", "https://refactoring.guru/ru/design-patterns/structural-patterns")]),
      topic("Поведенческие (Behavioral)", article({
        what: "Поведенческие паттерны описывают, как объекты принимают решения, обмениваются сообщениями и меняют алгоритм выполнения.",
        problem: "Они позволяют заменить длинные `if/switch` на расширяемые сценарии без переписывания клиента.",
        code: `
public interface IPriceStrategy
{
    decimal Calculate(decimal basePrice);
}

public sealed class VipPriceStrategy : IPriceStrategy
{
    public decimal Calculate(decimal basePrice) => basePrice * 0.9m;
}

public sealed class CheckoutService
{
    public decimal Calculate(decimal basePrice, IPriceStrategy strategy) =>
        strategy.Calculate(basePrice);
}
        `
      }), [link("refactoring.guru — поведенческие", "https://refactoring.guru/ru/design-patterns/behavioral-patterns")]),
      topic("Правила применения", article({
        what: "Паттерн нужен только тогда, когда у задачи есть повторяемая проблема и реальная вариативность поведения, а не ради красивой диаграммы.",
        problem: "Это защищает от overengineering, лишних интерфейсов и ситуации, когда паттерн делает код сложнее исходного решения.",
        code: `
public interface IDiscountPolicy
{
    bool CanApply(Customer customer);
    decimal Apply(decimal total);
}

public sealed class CheckoutService
{
    private readonly IReadOnlyCollection<IDiscountPolicy> _policies;

    public decimal Calculate(Customer customer, decimal total)
    {
        var policy = _policies.SingleOrDefault(x => x.CanApply(customer));
        return policy?.Apply(total) ?? total;
    }
}
        `,
        important: [
          "Если вариация одна и не меняется, паттерн чаще всего не нужен.",
          "Сначала докажи проблему, потом добавляй абстракцию."
        ]
      }))
    ]
  },  {
    id: "ddd", title: "DDD (Domain-Driven Design)", icon: "&#9673;", color: "violet",
    rows: [
      topic("Aggregate", article({
        what: "Aggregate — это группа связанных объектов с одной точкой входа через aggregate root. Только root разрешает менять внутреннее состояние.",
        problem: "Он удерживает инварианты внутри границы модели и не даёт внешнему коду менять дочерние сущности напрямую.",
        code: `
public sealed class Order
{
    private readonly List<OrderLine> _lines = new();

    public IReadOnlyCollection<OrderLine> Lines => _lines.AsReadOnly();

    public void AddLine(Guid productId, int quantity)
    {
        if (quantity <= 0)
            throw new InvalidOperationException("Quantity must be greater than zero.");

        if (_lines.Count >= 10)
            throw new InvalidOperationException("Too many lines.");

        _lines.Add(new OrderLine(productId, quantity));
    }
}
        `
      })),
      topic("Entity", article({
        what: "Entity — это объект с идентичностью. Его равенство определяется не набором полей, а стабильным `Id`.",
        problem: "Это позволяет отслеживать жизненный цикл объекта, даже когда остальные данные меняются со временем.",
        code: `
public sealed class User : IEquatable<User>
{
    public Guid Id { get; }
    public string Name { get; private set; }

    public User(Guid id, string name)
    {
        Id = id;
        Name = name;
    }

    public bool Equals(User? other) => other is not null && Id == other.Id;
    public override int GetHashCode() => Id.GetHashCode();
}
        `
      })),
      topic("Value Object", article({
        what: "Value Object не имеет собственной идентичности и сравнивается по значениям всех полей. Обычно он неизменяемый.",
        problem: "Так мелкие бизнес-концепции вроде денег, email или адреса не расползаются по коду в виде сырых строк и чисел.",
        code: `
public sealed record Money(decimal Amount, string Currency)
{
    public Money Add(Money other)
    {
        if (Currency != other.Currency)
            throw new InvalidOperationException("Currencies must match.");

        return new Money(Amount + other.Amount, Currency);
    }
}
        `
      })),
      topic("Repository", article({
        what: "Repository даёт приложению доступ к агрегатам через доменную абстракцию, а не через детали хранения.",
        problem: "Это позволяет менять способ хранения, не переписывая use cases и доменную модель.",
        code: `
public interface IOrderRepository
{
    Task<Order?> GetByIdAsync(Guid id, CancellationToken ct);
}

public sealed class OrderRepository : IOrderRepository
{
    private readonly AppDbContext _db;

    public Task<Order?> GetByIdAsync(Guid id, CancellationToken ct) =>
        _db.Orders.SingleOrDefaultAsync(x => x.Id == id, ct);
}
        `
      })),
      topic("Domain Service", article({
        what: "Domain Service содержит бизнес-логику, которая не принадлежит одной конкретной entity или value object.",
        problem: "Он не даёт запихивать сложные правила в application-слой только потому, что для них нет очевидного владельца в домене.",
        code: `
public sealed class OrderPricingService
{
    public decimal CalculateTotal(IEnumerable<OrderLine> lines, decimal discountRate)
    {
        var subtotal = lines.Sum(x => x.Quantity * x.UnitPrice);
        return subtotal - subtotal * discountRate;
    }
}
        `
      })),
      topic("Application Service", article({
        what: "Application Service или handler координирует use case: загружает агрегат, вызывает доменные методы, сохраняет изменения и публикует интеграционные действия.",
        problem: "Это отделяет оркестрацию сценария от самих бизнес-правил и от транспортного слоя.",
        code: `
public sealed class ConfirmOrderHandler
{
    private readonly IOrderRepository _orders;
    private readonly IUnitOfWork _unitOfWork;

    public async Task Handle(Guid orderId, CancellationToken ct)
    {
        var order = await _orders.GetByIdAsync(orderId, ct)
            ?? throw new InvalidOperationException("Order was not found.");

        order.Confirm();
        await _unitOfWork.SaveChangesAsync(ct);
    }
}
        `
      })),
      topic("Domain Event и реализация", article({
        what: "Domain Event фиксирует важный факт в домене: заказ создан, оплата подтверждена, лимит превышен. Сам event ничего не делает, а только сообщает о случившемся.",
        problem: "Это ослабляет связанность между частями системы и позволяет реагировать на доменные изменения независимо.",
        code: `
public sealed record OrderPaid(Guid OrderId, decimal Amount);

public sealed class SendReceiptOnOrderPaid : INotificationHandler<OrderPaid>
{
    private readonly IEmailSender _emailSender;

    public SendReceiptOnOrderPaid(IEmailSender emailSender)
    {
        _emailSender = emailSender;
    }

    public Task Handle(OrderPaid notification, CancellationToken ct) =>
        _emailSender.SendAsync("customer@demo.local", "Order paid", ct);
}
        `
      })),
      topic("Layers (в контексте DDD)", article({
        what: "В DDD слои обычно читаются так: `Domain` формулирует правила, `Application` собирает use cases, `Infrastructure` реализует интерфейсы, `Presentation` принимает вход.",
        problem: "Так проще удержать границы: домен не зависит от EF Core и HTTP, а внешний код не принимает решения за модель.",
        code: `
public interface ICurrentUser
{
    Guid UserId { get; }
}

public sealed class CreateInvoiceHandler
{
    private readonly ICurrentUser _currentUser;

    public CreateInvoiceHandler(ICurrentUser currentUser)
    {
        _currentUser = currentUser;
    }
}
        `
      })),
      topic("Границы транзакций агрегатов", article({
        what: "Обычно одна транзакция должна изменять один aggregate root. Для взаимодействия между агрегатами используют события и eventual consistency.",
        problem: "Это не даёт монолиту превращаться в большую распределённую транзакцию с хрупкими блокировками и сильной связанностью.",
        code: `
public sealed class Order : AggregateRoot
{
    public void Confirm()
    {
        Raise(new OrderConfirmed(Id));
    }
}

public sealed class ReserveInventoryOnOrderConfirmed : INotificationHandler<OrderConfirmed>
{
    public async Task Handle(OrderConfirmed notification, CancellationToken ct)
    {
        var inventory = await _inventory.GetByOrderIdAsync(notification.OrderId, ct);
        inventory.Reserve();
        await _unitOfWork.SaveChangesAsync(ct);
    }
}
        `
      }))
    ]
  },  {
    id: "efcore", title: "EF Core", icon: "&#9107;", color: "blue",
    rows: [
      topic("Миграции", article({
        what: "Миграции описывают эволюцию схемы БД как код и позволяют синхронно развивать модель и структуру таблиц.",
        problem: "Они убирают ручное редактирование схемы на серверах и дают воспроизводимый способ обновлять БД между окружениями.",
        code: `
public partial class AddOrderStatus : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "Status",
            table: "Orders",
            type: "nvarchar(32)",
            nullable: false,
            defaultValue: "Draft");
    }
}
        `
      }), [link("docs — миграции", "https://learn.microsoft.com/ru-ru/ef/core/managing-schemas/migrations/")]),
      topic("Миграции как сырой SQL", article({
        what: "Сырой SQL в миграции нужен там, где Fluent API не умеет выразить конкретное DDL или сложное преобразование данных.",
        problem: "Это позволяет безопасно описывать нестандартные индексы, backfill данных и vendor-specific операции прямо в версии схемы.",
        code: `
protected override void Up(MigrationBuilder migrationBuilder)
{
    migrationBuilder.Sql(@"
        UPDATE Orders
        SET Status = 'Completed'
        WHERE PaidOnUtc IS NOT NULL;
    ");
}
        `
      })),
      topic("Скрипты CI", article({
        what: "В CI/CD миграции часто превращают в идемпотентный SQL-скрипт и применяют отдельно от деплоя приложения.",
        problem: "Так команда может ревьюить реальный SQL, а пайплайн не зависит от запуска `dotnet ef` на боевой машине.",
        code: `
public sealed class MigrationScriptExporter
{
    private readonly IMigrator _migrator;

    public MigrationScriptExporter(IMigrator migrator)
    {
        _migrator = migrator;
    }

    public string Export() =>
        _migrator.GenerateScript(options: MigrationsSqlGenerationOptions.Idempotent);
}
        `
      })),
      topic("CRUD + транзакции", article({
        what: "EF Core сам оборачивает один `SaveChanges()` в транзакцию, а для нескольких шагов можно открыть транзакцию явно.",
        problem: "Это нужно, когда бизнес-операция должна либо целиком записаться в несколько таблиц, либо не записаться вовсе.",
        code: `
await using var transaction = await db.Database.BeginTransactionAsync(ct);

db.Orders.Add(order);
db.OutboxMessages.Add(message);

await db.SaveChangesAsync(ct);
await transaction.CommitAsync(ct);
        `
      }), [link("docs — транзакции", "https://learn.microsoft.com/ru-ru/ef/core/saving/transactions")]),
      topic("Модели отношений", article({
        what: "Отношения в EF Core описывают связи между сущностями: один-к-одному, один-ко-многим и многие-ко-многим.",
        problem: "Явная конфигурация отношений помогает избежать неправильных внешних ключей, каскадов и неожиданного SQL.",
        code: `
modelBuilder.Entity<Order>(builder =>
{
    builder.HasMany(x => x.Lines)
        .WithOne()
        .HasForeignKey(x => x.OrderId)
        .OnDelete(DeleteBehavior.Cascade);
});
        `
      }), [link("docs — relationships", "https://learn.microsoft.com/ru-ru/ef/core/modeling/relationships")]),
      topic("Варианты хранения подсущности", article({
        what: "Подсущность можно хранить как `Owned Type`, отдельную таблицу или иерархию наследования, в зависимости от её жизненного цикла и границы агрегата.",
        problem: "Это помогает не раздувать схему и при этом не терять выразительность доменной модели.",
        code: `
modelBuilder.Entity<Customer>().OwnsOne(x => x.Address, owned =>
{
    owned.Property(x => x.City).HasColumnName("City");
    owned.Property(x => x.Street).HasColumnName("Street");
    owned.Property(x => x.ZipCode).HasColumnName("ZipCode");
});
        `
      })),
      topic("Сложные свойства (Value Conversions)", article({
        what: "`Value Conversion` преобразует доменный тип в значение, которое реально хранится в БД, и обратно.",
        problem: "Это позволяет использовать enum-подобные объекты, value objects и сложные типы без утечки инфраструктурных примитивов в домен.",
        code: `
builder.Property(x => x.Status)
    .HasConversion(
        value => value.Name,
        value => OrderStatus.FromName(value));
        `
      }), [link("docs — value conversions", "https://learn.microsoft.com/ru-ru/ef/core/modeling/value-conversions")]),
      topic("PK: составной ключ", article({
        what: "Составной ключ строится из нескольких колонок и часто используется для join-таблиц или сущностей, чья уникальность определяется комбинацией полей.",
        problem: "Он не позволяет сохранить дубликаты там, где одного `Id` недостаточно для выражения уникальности.",
        code: `
modelBuilder.Entity<OrderItem>(builder =>
{
    builder.HasKey(x => new { x.OrderId, x.ProductId });
});
        `
      })),
      topic("Кластерный индекс (MSSQL)", article({
        what: "В SQL Server кластерный индекс определяет физический порядок строк в таблице. По умолчанию им часто становится первичный ключ.",
        problem: "Явная настройка помогает выбрать индекс, который лучше подходит под реальные сценарии чтения и записи.",
        code: `
modelBuilder.Entity<Order>(builder =>
{
    builder.HasKey(x => x.Id).IsClustered(false);
    builder.HasIndex(x => x.CreatedOnUtc).IsClustered();
});
        `
      })),
      topic("HiLo генерация ключей", article({
        what: "HiLo выдаёт приложению диапазоны идентификаторов из БД, чтобы не ходить за новым ключом на каждый insert.",
        problem: "Это уменьшает количество round-trip в БД и позволяет знать `Id` сущности ещё до сохранения.",
        code: `
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(
        connectionString,
        sql => sql.UseHiLo("entity_hilo")));
        `
      }), [link("docs — generated properties", "https://learn.microsoft.com/ru-ru/ef/core/modeling/generated-properties")]),
      topic("Concurrency Tokens", article({
        what: "Concurrency token помогает обнаружить, что запись успел изменить кто-то ещё между чтением и сохранением.",
        problem: "Так приложение не перетирает чужие изменения молча и может корректно отреагировать на конфликт.",
        code: `
modelBuilder.Entity<Order>()
    .Property(x => x.RowVersion)
    .IsRowVersion();

try
{
    await db.SaveChangesAsync(ct);
}
catch (DbUpdateConcurrencyException)
{
    throw new InvalidOperationException("Order was changed by another user.");
}
        `
      }), [link("docs — concurrency", "https://learn.microsoft.com/ru-ru/ef/core/saving/concurrency")]),
      topic("Tracking vs No-Tracking", article({
        what: "С tracking EF Core следит за изменениями сущностей, а `AsNoTracking()` читает данные без накладных расходов на change tracker.",
        problem: "Это позволяет ускорять read-only запросы и не держать в памяти лишние графы объектов.",
        code: `
var readModel = await db.Orders
    .AsNoTracking()
    .Select(x => new OrderListItem(x.Id, x.Number, x.TotalAmount))
    .ToListAsync(ct);

var order = await db.Orders.SingleAsync(x => x.Id == orderId, ct);
order.Cancel();
await db.SaveChangesAsync(ct);
        `
      }), [link("docs — tracking", "https://learn.microsoft.com/ru-ru/ef/core/querying/tracking")]),
      topic("Загрузка связанных данных", article({
        what: "Связанные данные можно загружать заранее через `Include`, вручную через explicit loading или лениво через lazy loading.",
        problem: "Правильный способ загрузки помогает не получить `N+1`, лишний SQL и перегруженные графы объектов.",
        code: `
var order = await db.Orders
    .Include(x => x.Lines)
    .SingleAsync(x => x.Id == orderId, ct);

await db.Entry(order)
    .Collection(x => x.Payments)
    .LoadAsync(ct);
        `
      }), [link("docs — related data", "https://learn.microsoft.com/ru-ru/ef/core/querying/related-data/")]),
      topic("Split Queries", article({
        what: "`AsSplitQuery()` разбивает один тяжёлый `Include`-запрос на несколько SQL-запросов и потом собирает результат в памяти.",
        problem: "Это помогает избежать cartesian explosion, когда одна большая выборка дублирует строки из-за нескольких коллекций.",
        code: `
var orders = await db.Orders
    .Include(x => x.Lines)
    .Include(x => x.Tags)
    .AsSplitQuery()
    .ToListAsync(ct);
        `
      }), [link("docs — split queries", "https://learn.microsoft.com/ru-ru/ef/core/querying/single-split-queries")]),
      topic("Функции базы данных", article({
        what: "EF Core умеет маппить C#-метод на SQL-функцию, чтобы вызывать серверную логику прямо из LINQ.",
        problem: "Это нужно, когда вычисление должно выполняться в БД и обычный LINQ не умеет выразить нужную функцию.",
        code: `
public static class DbFunctionsExtensions
{
    public static int DateDiffDay(DateTime start, DateTime end) =>
        throw new NotSupportedException();
}

modelBuilder.HasDbFunction(
    typeof(DbFunctionsExtensions).GetMethod(nameof(DbFunctionsExtensions.DateDiffDay))!);
        `
      }), [link("docs — db functions", "https://learn.microsoft.com/ru-ru/ef/core/querying/database-functions")]),
      topic("Отслеживание изменений", article({
        what: "Change tracker хранит исходные значения сущности и решает, какие `INSERT/UPDATE/DELETE` надо отправить при сохранении.",
        problem: "Понимание tracker нужно, чтобы не делать лишние обновления и правильно работать с detached-сущностями.",
        code: `
var entry = db.Entry(order);
entry.Property(x => x.Status).IsModified = true;

if (db.ChangeTracker.HasChanges())
{
    await db.SaveChangesAsync(ct);
}
        `
      }), [link("docs — change tracking", "https://learn.microsoft.com/ru-ru/ef/core/change-tracking/")]),
      topic("Получить SQL текст запроса", article({
        what: "`ToQueryString()` показывает SQL, который EF Core собирается выполнить для текущего LINQ-запроса.",
        problem: "Это помогает быстро понять, почему запрос медленный, какие join'ы построились и какие параметры вообще участвуют.",
        code: `
var query = db.Orders
    .Where(x => x.Status == OrderStatus.Pending)
    .Select(x => new { x.Id, x.Number });

var sql = query.ToQueryString();
logger.LogInformation(sql);
        `
      })),
      topic("Тестирование с EF Core", article({
        what: "Для интеграционных тестов лучше использовать SQLite in-memory или контейнер с реальной БД, а не полностью искусственный провайдер.",
        problem: "Так тесты ближе к настоящему SQL и ловят проблемы маппинга, транзакций и ограничений схемы.",
        code: `
await using var connection = new SqliteConnection("DataSource=:memory:");
await connection.OpenAsync();

var options = new DbContextOptionsBuilder<AppDbContext>()
    .UseSqlite(connection)
    .Options;

await using var db = new AppDbContext(options);
await db.Database.EnsureCreatedAsync();
        `
      }), [link("docs — testing", "https://learn.microsoft.com/ru-ru/ef/core/testing/")]),
      topic("Проблемы производительности", article({
        what: "Основные проблемы производительности в EF Core: `N+1`, избыточные `Include`, отсутствие индексов, tracking overhead и тяжёлые проекции сущностей.",
        problem: "Осознанная форма запроса позволяет читать ровно те данные, которые реально нужны конкретному экрану или API.",
        code: `
var items = await db.Orders
    .AsNoTracking()
    .Where(x => x.Status == OrderStatus.Pending)
    .Select(x => new OrderListItem(x.Id, x.Number, x.TotalAmount))
    .ToListAsync(ct);
        `
      }), [link("docs — performance", "https://learn.microsoft.com/ru-ru/ef/core/performance/")]),
      topic("Параллелизм в APP слое", article({
        what: "Один `DbContext` нельзя использовать из нескольких потоков одновременно. Для параллельных операций нужен отдельный контекст на каждую задачу.",
        problem: "Это защищает от гонок состояния внутри change tracker и ошибок вида `A second operation was started on this context`.",
        code: `
var ordersTask = LoadOrdersAsync(factory, ct);
var customersTask = LoadCustomersAsync(factory, ct);

await Task.WhenAll(ordersTask, customersTask);

static async Task<List<Order>> LoadOrdersAsync(IDbContextFactory<AppDbContext> factory, CancellationToken ct)
{
    await using var db = await factory.CreateDbContextAsync(ct);
    return await db.Orders.AsNoTracking().ToListAsync(ct);
}
        `
      }))
    ]
  },  {
    id: "webapi", title: "WebAPI (ASP.NET Core)", icon: "&#9656;", color: "green",
    rows: [
      topic("Configure() vs ConfigureServices()", article({
        what: "В старом `Startup` метод `ConfigureServices()` регистрировал зависимости, а `Configure()` собирал HTTP-пайплайн. В современном .NET это делает `Program.cs`.",
        problem: "Понимание этого разделения помогает не путать регистрацию сервисов и порядок выполнения middleware.",
        code: `
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

var app = builder.Build();
app.MapControllers();
app.Run();
        `
      }), [link("docs — startup", "https://learn.microsoft.com/ru-ru/aspnet/core/fundamentals/startup")]),
      topic("Кастомный Middleware", article({
        what: "Middleware — это шаг в HTTP-конвейере, который может читать запрос, менять ответ и решать, передавать ли выполнение дальше.",
        problem: "Собственный middleware нужен для сквозной логики вроде корреляции, логирования, headers, rate limiting или tenant resolution.",
        code: `
public sealed class RequestIdMiddleware
{
    public async Task InvokeAsync(HttpContext context, RequestDelegate next)
    {
        context.Response.Headers["X-Request-Id"] = Guid.NewGuid().ToString();
        await next(context);
    }
}
        `
      }), [link("docs — middleware", "https://learn.microsoft.com/ru-ru/aspnet/core/fundamentals/middleware/")]),
      topic("HttpContext.Response events", article({
        what: "`OnStarting` срабатывает перед отправкой заголовков, а `OnCompleted` — когда ответ уже полностью ушёл клиенту.",
        problem: "Это даёт безопасные точки для добавления headers, финального логирования и post-response cleanup.",
        code: `
app.Use(async (context, next) =>
{
    context.Response.OnStarting(() =>
    {
        context.Response.Headers["X-App-Version"] = "1.0";
        return Task.CompletedTask;
    });

    context.Response.OnCompleted(() =>
    {
        Console.WriteLine("Response completed");
        return Task.CompletedTask;
    });

    await next();
});
        `
      }), [link("docs — HttpResponse", "https://learn.microsoft.com/ru-ru/dotnet/api/microsoft.aspnetcore.http.httpresponse")]),
      topic("Kestrel WebHost", article({
        what: "Kestrel — встроенный веб-сервер ASP.NET Core. Он принимает HTTP-трафик сам или работает за reverse proxy.",
        problem: "Знание настройки Kestrel нужно для управления портами, протоколами, HTTPS и лимитами соединений.",
        code: `
var builder = WebApplication.CreateBuilder(args);

builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(8080);
});
        `
      }), [link("docs — Kestrel", "https://learn.microsoft.com/ru-ru/aspnet/core/fundamentals/servers/kestrel")]),
      topic("KestrelServerOptions: Limits", article({
        what: "Лимиты Kestrel позволяют ограничить размер тела запроса, количество соединений и таймауты на чтение заголовков.",
        problem: "Это помогает защитить приложение от слишком тяжёлых или зависших запросов ещё до входа в бизнес-логику.",
        code: `
builder.WebHost.ConfigureKestrel(options =>
{
    options.Limits.MaxConcurrentConnections = 500;
    options.Limits.RequestHeadersTimeout = TimeSpan.FromSeconds(15);
    options.Limits.MaxRequestBodySize = 10 * 1024 * 1024;
});
        `
      })),
      topic("Метрики Kestrel: KestrelEventSource", article({
        what: "`KestrelEventSource` публикует события сервера, которые можно читать через `EventListener`, `dotnet-counters` и другие диагностические инструменты.",
        problem: "Это помогает увидеть проблемы на уровне соединений и очередей, когда обычных application-логов уже недостаточно.",
        code: `
public sealed class KestrelMetricsListener : EventListener
{
    protected override void OnEventSourceCreated(EventSource eventSource)
    {
        if (eventSource.Name == "Microsoft-AspNetCore-Server-Kestrel")
            EnableEvents(eventSource, EventLevel.Informational);
    }

    protected override void OnEventWritten(EventWrittenEventArgs eventData)
    {
        Console.WriteLine(eventData.EventName);
    }
}
        `
      }), [link("docs — Kestrel diagnostics", "https://learn.microsoft.com/ru-ru/aspnet/core/fundamentals/servers/kestrel/diagnostics")]),
      topic("Formatters для MVC", article({
        what: "Formatter отвечает за сериализацию входа и выхода в MVC: JSON, XML или свой кастомный формат.",
        problem: "Он нужен, когда API должно принимать или отдавать данные не только в стандартном `application/json`.",
        code: `
builder.Services
    .AddControllers()
    .AddXmlSerializerFormatters()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    });
        `
      }), [link("docs — formatting", "https://learn.microsoft.com/ru-ru/aspnet/core/web-api/advanced/formatting")]),
      topic("Форсирование формата ObjectResult", article({
        what: "Иногда API должно жёстко вернуть конкретный `Content-Type`, независимо от negotiation или заголовка `Accept`.",
        problem: "Это полезно для обратной совместимости, специальных endpoint'ов и внешних клиентов с фиксированным форматом ответа.",
        code: `
[HttpGet("/report")]
public IActionResult Get()
{
    return new ObjectResult(new { Status = "ok" })
    {
        ContentTypes = { "application/json" }
    };
}
        `
      })),
      topic("HealthChecks", article({
        what: "Health checks позволяют приложению сообщать, что оно живо и готово обслуживать трафик.",
        problem: "Оркестратор и мониторинг получают простой способ понять, можно ли направлять запросы в конкретный экземпляр сервиса.",
        code: `
builder.Services.AddHealthChecks()
    .AddCheck<SqlHealthCheck>("sql");

app.MapHealthChecks("/health");

public sealed class SqlHealthCheck : IHealthCheck
{
    public Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default) =>
        Task.FromResult(HealthCheckResult.Healthy());
}
        `
      }), [link("docs — health checks", "https://learn.microsoft.com/ru-ru/aspnet/core/host-and-deploy/health-checks")]),
      topic("Swagger (OpenAPI)", article({
        what: "Swagger/OpenAPI генерирует контракт API и удобный UI для просмотра и ручных вызовов endpoint'ов.",
        problem: "Это упрощает интеграции, документацию и проверку того, что приложение действительно публикует наружу.",
        code: `
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
        `
      }), [link("docs — Swagger", "https://learn.microsoft.com/ru-ru/aspnet/core/tutorials/getting-started-with-swashbuckle")]),
      topic("Время жизни контроллера", article({
        what: "Контроллер создаётся на запрос и обычно воспринимается как transient-объект, который безопасно получает scoped-зависимости.",
        problem: "Понимание lifetime важно, чтобы не хранить состояние запроса в singleton-сервисах и не ловить проблемы с `DbContext`.",
        code: `
builder.Services.AddDbContext<OrderDbContext>();

public sealed class OrdersController : ControllerBase
{
    private readonly OrderDbContext _db;

    public OrdersController(OrderDbContext db)
    {
        _db = db;
    }
}
        `
      })),
      topic("FromService, FromRoute и др.", article({
        what: "Атрибуты биндинга явно показывают, откуда берётся каждое значение: из маршрута, query string, заголовка, тела или DI.",
        problem: "Это делает endpoint предсказуемым и убирает магию, когда ASP.NET Core сам угадывает источник данных.",
        code: `
[HttpPost("/orders/{id:guid}")]
public async Task<IActionResult> Confirm(
    [FromRoute] Guid id,
    [FromHeader(Name = "X-Tenant")] string tenantId,
    [FromBody] ConfirmOrderRequest request,
    [FromServices] ConfirmOrderHandler handler,
    CancellationToken ct)
{
    await handler.Handle(new ConfirmOrderCommand(id, tenantId, request.Comment), ct);
    return NoContent();
}
        `
      }), [link("docs — model binding", "https://learn.microsoft.com/ru-ru/aspnet/core/mvc/models/model-binding")]),
      topic("ModelBinding", article({
        what: "Model binding превращает HTTP-данные в параметры action или готовые объекты запроса.",
        problem: "Кастомный binder нужен, когда вход нельзя корректно выразить стандартными типами и конвертерами.",
        code: `
public sealed class OrderIdBinder : IModelBinder
{
    public Task BindModelAsync(ModelBindingContext context)
    {
        var raw = context.ValueProvider.GetValue(context.ModelName).FirstValue;

        if (Guid.TryParse(raw, out var value))
            context.Result = ModelBindingResult.Success(new OrderId(value));

        return Task.CompletedTask;
    }
}
        `
      })),
      topic("CancellationToken в async/await", article({
        what: "`CancellationToken` надо пробрасывать через весь стек вызовов: от контроллера до EF Core, HTTP-клиента и фоновых операций.",
        problem: "Это позволяет быстро останавливать ненужную работу после отмены запроса и не тратить ресурсы зря.",
        code: `
[HttpGet("/orders/{id:guid}")]
public Task<OrderDto> Get(Guid id, CancellationToken ct) =>
    _service.GetAsync(id, ct);

public Task<OrderDto> GetAsync(Guid id, CancellationToken ct) =>
    _db.Orders
        .Where(x => x.Id == id)
        .Select(x => new OrderDto(x.Id, x.Number))
        .SingleAsync(ct);
        `
      }))
    ]
  },  {
    id: "api", title: "Разработка API", icon: "&#8644;", color: "orange",
    rows: [
      topic("Идемпотентность", article({
        what: "Идемпотентность означает, что повтор одного и того же запроса не создаёт новых побочных эффектов.",
        problem: "Она нужна для безопасных ретраев клиента, сетевых сбоев и повторных отправок формы без дублей заказов и платежей.",
        code: `
public async Task<IResult> CreateOrder(
    HttpContext context,
    CreateOrderRequest request,
    IIdempotencyStore store,
    CancellationToken ct)
{
    var key = context.Request.Headers["Idempotency-Key"].ToString();

    if (await store.ExistsAsync(key, ct))
        return Results.Ok(await store.GetResponseAsync(key, ct));

    var response = new CreateOrderResponse(Guid.NewGuid());
    await store.SaveAsync(key, response, ct);

    return Results.Created("/orders/" + response.OrderId, response);
}
        `
      }), [link("Habr — идемпотентность (Яндекс)", "https://habr.com/ru/company/yandex/blog/442762/")]),
      topic("Корректные HTTP статус коды", article({
        what: "Статус-код должен отражать реальный результат операции: найден ресурс или нет, создан он или обновлён, проблема у клиента или у сервера.",
        problem: "Корректные коды делают API понятным для клиентов и помогают автоматике правильно обрабатывать ошибки.",
        code: `
[HttpGet("/orders/{id:guid}")]
public async Task<ActionResult<OrderDto>> Get(Guid id, CancellationToken ct)
{
    var order = await _service.GetAsync(id, ct);
    return order is null ? NotFound() : Ok(order);
}

[HttpPost("/orders")]
public async Task<IActionResult> Create(CreateOrderRequest request, CancellationToken ct)
{
    var id = await _service.CreateAsync(request, ct);
    return CreatedAtAction(nameof(Get), new { id }, null);
}
        `
      })),
      topic("Отдача статики отдельно", article({
        what: "Статику лучше отдавать через CDN или специализированный сервер, а API должен возвращать только ссылки на ресурсы.",
        problem: "Так application server не тратит CPU и соединения на раздачу тяжёлых файлов, а кэширование работает эффективнее.",
        code: `
public sealed class AssetUrlBuilder
{
    private readonly string _cdnBaseUrl;

    public AssetUrlBuilder(IOptions<StaticAssetsOptions> options)
    {
        _cdnBaseUrl = options.Value.BaseUrl.TrimEnd('/');
    }

    public string Build(string path) =>
        _cdnBaseUrl + "/" + path.TrimStart('/');
}
        `
      })),
      topic("API Gateway", article({
        what: "API Gateway стоит перед внутренними сервисами и берёт на себя маршрутизацию, аутентификацию, лимиты и общие политики.",
        problem: "Он снимает инфраструктурную нагрузку с бизнес-сервисов и даёт единый вход для внешних клиентов.",
        code: `
builder.Services.AddReverseProxy().LoadFromMemory(
    [
        new RouteConfig
        {
            RouteId = "orders",
            ClusterId = "backend",
            Match = new RouteMatch { Path = "/api/orders/{**catch-all}" }
        }
    ],
    [
        new ClusterConfig
        {
            ClusterId = "backend",
            Destinations = new Dictionary<string, DestinationConfig>
            {
                ["d1"] = new() { Address = "https://orders.internal/" }
            }
        }
    ]);

app.MapReverseProxy();
        `
      }), [link("docs — API Gateway pattern", "https://learn.microsoft.com/ru-ru/azure/architecture/microservices/design/gateway")]),
      topic("Кэширование", article({
        what: "Кэширование сохраняет часто используемый результат ближе к приложению или клиенту, чтобы не ходить за ним каждый раз в БД.",
        problem: "Это снижает задержки и разгружает самые дорогие источники данных.",
        code: `
app.MapGet("/products/{id:guid}", async (
    Guid id,
    IDistributedCache cache,
    ProductDbContext db,
    CancellationToken ct) =>
{
    var cacheKey = "product:" + id;
    var cached = await cache.GetStringAsync(cacheKey, ct);

    if (cached is not null)
        return Results.Content(cached, "application/json");

    var dto = await db.Products
        .Where(x => x.Id == id)
        .Select(x => new ProductDto(x.Id, x.Name))
        .SingleAsync(ct);

    var json = JsonSerializer.Serialize(dto);
    await cache.SetStringAsync(cacheKey, json, new DistributedCacheEntryOptions
    {
        AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5)
    }, ct);

    return Results.Content(json, "application/json");
});
        `
      })),
      topic("Rate Limiting", article({
        what: "Rate limiting ограничивает скорость запросов по клиенту, ключу API или маршруту.",
        problem: "Он защищает API от всплесков трафика, случайного злоупотребления и слишком агрессивных клиентов.",
        code: `
builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("api", limiter =>
    {
        limiter.PermitLimit = 100;
        limiter.Window = TimeSpan.FromMinutes(1);
        limiter.QueueLimit = 0;
    });
});

app.MapGet("/orders", Handle).RequireRateLimiting("api");
        `
      }), [link("Habr — Rate Limiting", "https://habr.com/ru/post/448438/")]),
      topic("Защита от перегрузки", article({
        what: "Защита от перегрузки включает timeout, circuit breaker, bulkhead и другие политики graceful degradation.",
        problem: "Она не даёт одному медленному downstream-сервису утянуть за собой все потоки и положить API целиком.",
        code: `
builder.Services.AddHttpClient<PaymentsClient>()
    .AddTransientHttpErrorPolicy(policy =>
        policy.CircuitBreakerAsync(5, TimeSpan.FromSeconds(30)))
    .AddTransientHttpErrorPolicy(policy =>
        policy.TimeoutAsync(TimeSpan.FromSeconds(2)));
        `
      })),
      topic("Пагинация", article({
        what: "Пагинация делит большой набор данных на порции. Для живых списков надёжнее курсорный подход, а не `Skip/Take` по смещению.",
        problem: "Курсор защищает от пропусков и дублей элементов, когда данные успевают меняться между запросами.",
        code: `
app.MapGet("/orders", async (
    DateTime? cursorCreatedOn,
    Guid? cursorId,
    AppDbContext db,
    CancellationToken ct) =>
{
    var query = db.Orders
        .OrderBy(x => x.CreatedOnUtc)
        .ThenBy(x => x.Id);

    if (cursorCreatedOn is not null && cursorId is not null)
    {
        query = query.Where(x =>
            x.CreatedOnUtc > cursorCreatedOn.Value ||
            (x.CreatedOnUtc == cursorCreatedOn.Value && x.Id.CompareTo(cursorId.Value) > 0));
    }

    return await query.Take(20).ToListAsync(ct);
});
        `
      }), [link("phauer.com — continuation token", "https://phauer.com/2018/web-api-pagination-timestamp-id-continuation-token/")]),
      topic("Observability API", article({
        what: "Observability собирает метрики, логи и трейсы так, чтобы по ним можно было восстановить поведение системы в проде.",
        problem: "Без неё сложно понять, где именно растёт latency, почему падают запросы и какой downstream вызвал цепочку ошибок.",
        code: `
builder.Services.AddOpenTelemetry()
    .WithMetrics(metrics => metrics
        .AddAspNetCoreInstrumentation()
        .AddRuntimeInstrumentation()
        .AddPrometheusExporter())
    .WithTracing(tracing => tracing
        .AddAspNetCoreInstrumentation()
        .AddHttpClientInstrumentation());

app.MapPrometheusScrapingEndpoint();
        `
      }))
    ]
  },  {
    id: "security", title: "Безопасность", icon: "&#9919;", color: "rose",
    rows: [
      topic("OWASP Top 10", article({
        what: "OWASP Top 10 — это список самых типичных классов уязвимостей веб-приложений: инъекции, XSS, broken access control и другие.",
        problem: "Он помогает использовать безопасность как чек-лист и закрывать базовые риски ещё на этапе проектирования API.",
        code: `
builder.Services.AddAuthentication().AddJwtBearer();
builder.Services.AddAuthorization();
builder.Services.AddAntiforgery();

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
        `
      }), [link("owasp.org — Top 10", "https://owasp.org/www-project-top-ten/")]),
      topic("OAuth 2.0", article({
        what: "OAuth 2.0 описывает, как клиент получает токен доступа к защищённому ресурсу через доверенный authorization server.",
        problem: "Это отделяет аутентификацию пользователя от API и позволяет безопасно делегировать доступ сторонним приложениям.",
        code: `
builder.Services.AddAuthentication("Bearer")
    .AddJwtBearer("Bearer", options =>
    {
        options.Authority = "https://identity.example.com";
        options.Audience = "orders-api";
    });
        `
      }), [link("Habr — OAuth 2.0", "https://habr.com/ru/company/dataart/blog/311376/")]),
      topic("Единая точка аутентификации (SSO)", article({
        what: "SSO использует один Identity Provider для нескольких приложений, чтобы пользователь логинился один раз и переиспользовал сессию.",
        problem: "Это убирает дублирование учётных записей и централизует аутентификацию, MFA и правила входа.",
        code: `
builder.Services.AddAuthentication(options =>
{
    options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = OpenIdConnectDefaults.AuthenticationScheme;
})
.AddCookie()
.AddOpenIdConnect(options =>
{
    options.Authority = "https://identity.example.com";
    options.ClientId = "web-app";
    options.ResponseType = "code";
    options.UsePkce = true;
});
        `
      })),
      topic("Авторизация на уровне объектов", article({
        what: "Resource-based authorization проверяет не только доступ к endpoint, но и право работать с конкретным объектом.",
        problem: "Это защищает от сценария, когда пользователь угадывает чужой `id` и получает доступ к данным соседа.",
        code: `
public sealed class OrderOwnerHandler :
    AuthorizationHandler<OperationAuthorizationRequirement, Order>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        OperationAuthorizationRequirement requirement,
        Order order)
    {
        var userId = context.User.FindFirst("sub")?.Value;

        if (order.CustomerId.ToString() == userId)
            context.Succeed(requirement);

        return Task.CompletedTask;
    }
}
        `
      })),
      topic("Парадигма: всё закрыто по умолчанию", article({
        what: "Безопасная позиция по умолчанию — считать endpoint закрытым, пока он явно не разрешён политикой или атрибутом.",
        problem: "Это защищает от случайно открытых маршрутов, которые забыли пометить `Authorize` после рефакторинга.",
        code: `
builder.Services.AddAuthorization(options =>
{
    options.FallbackPolicy = new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();
});
        `
      })),
      topic("JWT (JSON Web Token)", article({
        what: "JWT — это компактный токен с набором claims и подписью, который API может проверить без хранения серверной сессии.",
        problem: "Он удобен для stateless-аутентификации, но требует строгой валидации подписи, аудитории, издателя и срока жизни.",
        code: `
builder.Services.AddAuthentication("Bearer")
    .AddJwtBearer("Bearer", options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true
        };
    });
        `
      }), [link("jwt.io — introduction", "https://jwt.io/introduction")]),
      topic("Cookies Policy", article({
        what: "Политика cookie определяет, может ли cookie читать JavaScript, передаётся ли она только по HTTPS и когда браузер отправляет её на другой сайт.",
        problem: "Правильные флаги снижают риск XSS, CSRF и утечки аутентификационных данных.",
        code: `
builder.Services.ConfigureApplicationCookie(options =>
{
    options.Cookie.HttpOnly = true;
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
    options.Cookie.SameSite = SameSiteMode.Lax;
});
        `
      })),
      topic("HSTS", article({
        what: "HSTS просит браузер всегда использовать HTTPS для сайта и больше не пробовать HTTP даже при ручном вводе адреса.",
        problem: "Это снижает риск downgrade-атак и случайного доступа к приложению по незащищённому каналу.",
        code: `
builder.Services.AddHsts(options =>
{
    options.Preload = true;
    options.IncludeSubDomains = true;
    options.MaxAge = TimeSpan.FromDays(180);
});

if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
}
        `
      }), [link("docs — HSTS", "https://learn.microsoft.com/ru-ru/aspnet/core/security/enforcing-ssl")]),
      topic("Secret Storage / Vault", article({
        what: "Секреты нужно хранить вне исходного кода: в user secrets, переменных окружения или внешнем vault-сервисе.",
        problem: "Это не даёт ключам и паролям попадать в git, логи и бинарники приложения.",
        code: `
if (builder.Environment.IsProduction())
{
    builder.Configuration.AddAzureKeyVault(
        new Uri("https://demo-vault.vault.azure.net/"),
        new DefaultAzureCredential());
}
        `
      }), [link("docs — app secrets", "https://learn.microsoft.com/ru-ru/aspnet/core/security/app-secrets")]),
      topic("CSRF / Antiforgery", article({
        what: "CSRF заставляет браузер жертвы отправить запрос с её cookie на доверенный сайт. Antiforgery-токен позволяет понять, что запрос пришёл от нашей формы или клиента.",
        problem: "Это особенно важно для cookie-based приложений, где браузер сам прикладывает аутентификацию к запросу.",
        code: `
builder.Services.AddAntiforgery();

app.MapPost("/profile", async (HttpContext context, IAntiforgery antiforgery) =>
{
    await antiforgery.ValidateRequestAsync(context);
    return Results.NoContent();
});
        `
      }), [link("docs — antiforgery", "https://learn.microsoft.com/ru-ru/aspnet/core/security/anti-request-forgery")]),
      topic("CORS", article({
        what: "CORS управляет тем, какие внешние origins могут вызывать ваш API из браузера и с какими методами или заголовками.",
        problem: "Без явной политики браузерский клиент не сможет безопасно ходить в API с другого домена, а слишком широкая политика открывает лишний доступ.",
        code: `
builder.Services.AddCors(options =>
{
    options.AddPolicy("spa", policy =>
        policy.WithOrigins("https://app.example.com")
            .AllowAnyHeader()
            .AllowAnyMethod());
});

app.UseCors("spa");
        `
      }), [link("docs — CORS", "https://learn.microsoft.com/ru-ru/aspnet/core/security/cors")])
    ]
  }
];

// ── Config ────────────────────────────────────────────────────────────────────
const SHEETS_URL = 'https://script.google.com/macros/s/AKfycbyeDAWD2m7QLsR1KDCqn4_vT77kbJBsY-s45NSqA30DcTUxf1D_5wODHt-8pJp8vdjdFw/exec';
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







