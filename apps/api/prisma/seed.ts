import { PrismaClient, EventFormat, EventStatus, UserRole, VenueStatus, BookingStatus, OrderStatus, PaymentStatus } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function photoUrl(seed: string, w = 900, h = 560) {
  return `https://picsum.photos/seed/${seed}/${w}/${h}`;
}

const CITIES = [
  { name: "Москва", slug: "moscow", lat: 55.7558, lng: 37.6173, zoom: 10 },
  { name: "Санкт-Петербург", slug: "spb", lat: 59.9311, lng: 30.3609, zoom: 10 },
  { name: "Казань", slug: "kazan", lat: 55.7963, lng: 49.1088, zoom: 11 },
  { name: "Новосибирск", slug: "novosibirsk", lat: 55.0084, lng: 82.9357, zoom: 11 },
  { name: "Екатеринбург", slug: "ekaterinburg", lat: 56.8389, lng: 60.6057, zoom: 11 },
];

// icon rendering lives in the frontend's SportIcon component (keyed by slug) — no emoji in data.
const SPORT_TYPES = [
  { name: "Футбол", slug: "football" },
  { name: "Баскетбол", slug: "basketball" },
  { name: "Теннис", slug: "tennis" },
  { name: "Волейбол", slug: "volleyball" },
  { name: "Плавание", slug: "swimming" },
  { name: "Бег", slug: "running" },
  { name: "Йога", slug: "yoga" },
  { name: "Хоккей", slug: "hockey" },
  { name: "Бадминтон", slug: "badminton" },
  { name: "Воркаут", slug: "workout" },
];

async function main() {
  console.log("Seeding database...");

  const cities = new Map<string, string>();
  for (const city of CITIES) {
    const created = await prisma.city.upsert({ where: { slug: city.slug }, update: {}, create: city });
    cities.set(city.slug, created.id);
  }

  const sportTypes = new Map<string, string>();
  for (const sport of SPORT_TYPES) {
    const created = await prisma.sportType.upsert({ where: { slug: sport.slug }, update: {}, create: sport });
    sportTypes.set(sport.slug, created.id);
  }

  const passwordHash = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@sport.market" },
    update: {},
    create: { email: "admin@sport.market", passwordHash, name: "Администратор", role: UserRole.ADMIN, cityId: cities.get("moscow") },
  });

  const organizer = await prisma.user.upsert({
    where: { email: "organizer@sport.market" },
    update: {},
    create: { email: "organizer@sport.market", passwordHash, name: "Алексей Организатов", role: UserRole.ORGANIZER, cityId: cities.get("moscow") },
  });

  const mainUser = await prisma.user.upsert({
    where: { email: "user@sport.market" },
    update: {},
    create: { email: "user@sport.market", passwordHash, name: "Мария Иванова", role: UserRole.USER, cityId: cities.get("ekaterinburg") },
  });

  // Filler accounts purely to diversify review authorship — same password, not documented as demo logins.
  const fillerSeeds = [
    { email: "dmitry@sport.market", name: "Дмитрий Соколов", citySlug: "moscow" },
    { email: "ekaterina@sport.market", name: "Екатерина Волкова", citySlug: "spb" },
    { email: "pavel@sport.market", name: "Павел Никитин", citySlug: "kazan" },
    { email: "olga@sport.market", name: "Ольга Смирнова", citySlug: "novosibirsk" },
  ];
  const fillerUsers: Awaited<ReturnType<typeof prisma.user.upsert>>[] = [];
  for (const f of fillerSeeds) {
    fillerUsers.push(
      await prisma.user.upsert({
        where: { email: f.email },
        update: {},
        create: { email: f.email, passwordHash, name: f.name, role: UserRole.USER, cityId: cities.get(f.citySlug) },
      }),
    );
  }

  console.log("Пользователи:", { admin: admin.email, organizer: organizer.email, user: mainUser.email });

  const venuesData = [
    {
      slug: "olimp",
      name: "Спортивный комплекс «Олимп»",
      description: "Крытые футбольные и баскетбольные площадки с профессиональным покрытием.",
      address: "ул. Тверская, 12",
      citySlug: "moscow",
      lat: 55.7658,
      lng: 37.6045,
      pricePerHour: 2500,
      sports: ["football", "basketball"],
      amenities: ["Раздевалки", "Душевые", "Парковка"],
    },
    {
      slug: "setka",
      name: "Теннисный клуб «Сетка»",
      description: "Открытые и закрытые грунтовые корты для тенниса.",
      address: "Ленинский проспект, 45",
      citySlug: "moscow",
      lat: 55.7014,
      lng: 37.5738,
      pricePerHour: 1800,
      sports: ["tennis", "badminton"],
      amenities: ["Прокат инвентаря", "Кафе"],
    },
    {
      slug: "dinamo-run",
      name: "Беговой клуб «Динамо»",
      description: "Крытый манеж для бега и лёгкой атлетики с профессиональным покрытием.",
      address: "Ленинградский проспект, 36",
      citySlug: "moscow",
      lat: 55.7898,
      lng: 37.5566,
      pricePerHour: 1400,
      sports: ["running", "workout"],
      amenities: ["Раздевалки", "Тренер на месте"],
    },
    {
      slug: "severny-led",
      name: "Ледовая арена «Северный лёд»",
      description: "Хоккейная площадка с прокатом коньков и амуниции.",
      address: "Невский проспект, 100",
      citySlug: "spb",
      lat: 59.9343,
      lng: 30.3351,
      pricePerHour: 3200,
      sports: ["hockey"],
      amenities: ["Прокат коньков", "Раздевалки"],
    },
    {
      slug: "baltika",
      name: "Волейбольный центр «Балтика»",
      description: "Три игровых зала для волейбола и баскетбола.",
      address: "Московский проспект, 22",
      citySlug: "spb",
      lat: 59.9026,
      lng: 30.3186,
      pricePerHour: 2100,
      sports: ["volleyball", "basketball"],
      amenities: ["Трибуны", "Парковка"],
    },
    {
      slug: "neva-yoga",
      name: "Студия «Нева Йога»",
      description: "Светлая студия для хатха- и виньяса-йоги на берегу Невы.",
      address: "наб. реки Фонтанки, 20",
      citySlug: "spb",
      lat: 59.9311,
      lng: 30.3419,
      pricePerHour: 1300,
      sports: ["yoga"],
      amenities: ["Коврики", "Чайная зона"],
    },
    {
      slug: "kazan-arena-fitness",
      name: "Фитнес-парк «Казань Арена»",
      description: "Открытая площадка для воркаута и бега вдоль набережной.",
      address: "ул. Баумана, 5",
      citySlug: "kazan",
      lat: 55.7887,
      lng: 49.1221,
      pricePerHour: 900,
      sports: ["workout", "running"],
      amenities: ["Турники", "Освещение"],
    },
    {
      slug: "volna-pool",
      name: "Плавательный бассейн «Волна»",
      description: "50-метровый бассейн олимпийского стандарта.",
      address: "ул. Кремлёвская, 18",
      citySlug: "kazan",
      lat: 55.7963,
      lng: 49.1088,
      pricePerHour: 1500,
      sports: ["swimming"],
      amenities: ["Сауна", "Прокат инвентаря"],
    },
    {
      slug: "kazan-badminton",
      name: "Бадминтон-холл «Ак Барс»",
      description: "Профессиональные корты для бадминтона с разметкой турнирного уровня.",
      address: "пр. Ямашева, 33",
      citySlug: "kazan",
      lat: 55.8231,
      lng: 49.1454,
      pricePerHour: 1100,
      sports: ["badminton"],
      amenities: ["Прокат ракеток", "Парковка"],
    },
    {
      slug: "harmony-novosib",
      name: "Йога-студия «Гармония»",
      description: "Уютная студия для групповых и индивидуальных занятий йогой.",
      address: "Красный проспект, 30",
      citySlug: "novosibirsk",
      lat: 55.0302,
      lng: 82.9204,
      pricePerHour: 1200,
      sports: ["yoga"],
      amenities: ["Коврики", "Раздевалки"],
    },
    {
      slug: "sibir-football",
      name: "Футбольная арена «Сибирь»",
      description: "Крытое футбольное поле с искусственным покрытием FIFA Quality.",
      address: "ул. Богдана Хмельницкого, 15",
      citySlug: "novosibirsk",
      lat: 55.0619,
      lng: 82.9346,
      pricePerHour: 2800,
      sports: ["football"],
      amenities: ["Раздевалки", "Освещение", "Трибуны"],
    },
    {
      slug: "ural-club",
      name: "Спортивный клуб «Урал»",
      description: "Многофункциональный зал для футбола и баскетбола.",
      address: "ул. Малышева, 60",
      citySlug: "ekaterinburg",
      lat: 56.8375,
      lng: 60.6065,
      pricePerHour: 2000,
      sports: ["football", "basketball", "volleyball"],
      amenities: ["Раздевалки", "Парковка", "Кафе"],
    },
    {
      slug: "ekb-tennis",
      name: "Теннисный центр «Изумруд»",
      description: "Крытые хардовые корты с климат-контролем — играть можно в любую погоду.",
      address: "ул. 8 Марта, 51",
      citySlug: "ekaterinburg",
      lat: 56.8231,
      lng: 60.6118,
      pricePerHour: 1900,
      sports: ["tennis"],
      amenities: ["Климат-контроль", "Прокат инвентаря"],
    },
    {
      slug: "ekb-pool",
      name: "Аквацентр «Исеть»",
      description: "Два бассейна — спортивный и оздоровительный, с зоной для семейного плавания.",
      address: "пр. Ленина, 8",
      citySlug: "ekaterinburg",
      lat: 56.8389,
      lng: 60.6057,
      pricePerHour: 1600,
      sports: ["swimming"],
      amenities: ["Сауна", "Детская зона"],
    },
  ];

  const venueIds: Record<string, string> = {};
  for (const v of venuesData) {
    const venue = await prisma.venue.create({
      data: {
        name: v.name,
        description: v.description,
        address: v.address,
        lat: v.lat,
        lng: v.lng,
        cityId: cities.get(v.citySlug)!,
        ownerId: organizer.id,
        status: VenueStatus.PUBLISHED,
        pricePerHour: v.pricePerHour,
        amenities: v.amenities,
        photos: [photoUrl(`${v.slug}-1`), photoUrl(`${v.slug}-2`)],
        sportTypes: { create: v.sports.map((slug) => ({ sportTypeId: sportTypes.get(slug)! })) },
      },
    });
    venueIds[v.name] = venue.id;
  }

  const now = Date.now();
  const hour = 60 * 60 * 1000;
  const day = 24 * hour;

  const eventsData = [
    {
      slug: "football-5x5",
      title: "Открытый турнир по футболу 5x5",
      description: "Городской турнир среди любительских команд. Регистрация и покупка слота обязательна.",
      format: EventFormat.TICKETED,
      sportSlug: "football",
      citySlug: "moscow",
      venueName: "Спортивный комплекс «Олимп»",
      lat: 55.7658,
      lng: 37.6045,
      startOffset: 3 * day,
      durationHours: 4,
      capacity: 40,
      ticketPrice: 500,
      isFree: false,
    },
    {
      slug: "morning-run",
      title: "Утренняя пробежка в парке Горького",
      description: "Бесплатная любительская пробежка для всех уровней подготовки. Присоединяйтесь!",
      format: EventFormat.MEETUP,
      sportSlug: "running",
      citySlug: "moscow",
      venueName: null,
      lat: 55.7298,
      lng: 37.6015,
      startOffset: 8 * hour,
      durationHours: 2,
      capacity: 30,
      ticketPrice: null,
      isFree: true,
    },
    {
      slug: "tennis-masterclass",
      title: "Мастер-класс по большому теннису",
      description: "Тренировка с профессиональным тренером для новичков и любителей.",
      format: EventFormat.TICKETED,
      sportSlug: "tennis",
      citySlug: "moscow",
      venueName: "Теннисный клуб «Сетка»",
      lat: 55.7014,
      lng: 37.5738,
      startOffset: 5 * day,
      durationHours: 2,
      capacity: 12,
      ticketPrice: 1200,
      isFree: false,
    },
    {
      slug: "workout-morning-dinamo",
      title: "Утренний воркаут-сбор",
      description: "Групповая тренировка на турниках для новичков и продолжающих.",
      format: EventFormat.MEETUP,
      sportSlug: "workout",
      citySlug: "moscow",
      venueName: "Беговой клуб «Динамо»",
      lat: 55.7898,
      lng: 37.5566,
      startOffset: 18 * hour,
      durationHours: 1,
      capacity: 20,
      ticketPrice: null,
      isFree: true,
    },
    {
      slug: "hockey-league-match",
      title: "Хоккейный матч любительской лиги",
      description: "Товарищеский матч между командами города. Вход по билетам.",
      format: EventFormat.TICKETED,
      sportSlug: "hockey",
      citySlug: "spb",
      venueName: "Ледовая арена «Северный лёд»",
      lat: 59.9343,
      lng: 30.3351,
      startOffset: 4 * day,
      durationHours: 3,
      capacity: 100,
      ticketPrice: 700,
      isFree: false,
    },
    {
      slug: "volleyball-evening",
      title: "Сбор на волейбол по вечерам",
      description: "Ищем игроков в любительскую волейбольную команду, все уровни приветствуются.",
      format: EventFormat.MEETUP,
      sportSlug: "volleyball",
      citySlug: "spb",
      venueName: "Волейбольный центр «Балтика»",
      lat: 59.9026,
      lng: 30.3186,
      startOffset: 2 * day,
      durationHours: 2,
      capacity: 16,
      ticketPrice: null,
      isFree: true,
    },
    {
      slug: "yoga-sunset-spb",
      title: "Йога на закате у Невы",
      description: "Вечерняя практика на открытом воздухе для снятия напряжения после рабочего дня.",
      format: EventFormat.TICKETED,
      sportSlug: "yoga",
      citySlug: "spb",
      venueName: "Студия «Нева Йога»",
      lat: 59.9311,
      lng: 30.3419,
      startOffset: 36 * hour,
      durationHours: 1,
      capacity: 18,
      ticketPrice: 350,
      isFree: false,
    },
    {
      slug: "pool-group-booking",
      title: "Аренда бассейна для группового заплыва",
      description: "Бронирование дорожек бассейна для тренировки группы пловцов.",
      format: EventFormat.VENUE_BOOKING,
      sportSlug: "swimming",
      citySlug: "kazan",
      venueName: "Плавательный бассейн «Волна»",
      lat: 55.7963,
      lng: 49.1088,
      startOffset: 6 * day,
      durationHours: 1,
      capacity: 20,
      ticketPrice: null,
      isFree: true,
    },
    {
      slug: "workout-tournament",
      title: "Воркаут-турнир среди дворовых команд",
      description: "Соревнования по воркауту на свежем воздухе, призы победителям.",
      format: EventFormat.TICKETED,
      sportSlug: "workout",
      citySlug: "kazan",
      venueName: "Фитнес-парк «Казань Арена»",
      lat: 55.7887,
      lng: 49.1221,
      startOffset: 7 * day,
      durationHours: 3,
      capacity: 50,
      ticketPrice: 300,
      isFree: false,
    },
    {
      slug: "badminton-open",
      title: "Открытый турнир по бадминтону",
      description: "Одиночный разряд, три возрастные категории, судейство по официальным правилам.",
      format: EventFormat.TICKETED,
      sportSlug: "badminton",
      citySlug: "kazan",
      venueName: "Бадминтон-холл «Ак Барс»",
      lat: 55.8231,
      lng: 49.1454,
      startOffset: 9 * day,
      durationHours: 5,
      capacity: 32,
      ticketPrice: 450,
      isFree: false,
    },
    {
      slug: "yoga-sunrise",
      title: "Йога на рассвете",
      description: "Утренняя практика йоги для снятия стресса и заряда энергии на день.",
      format: EventFormat.TICKETED,
      sportSlug: "yoga",
      citySlug: "novosibirsk",
      venueName: "Йога-студия «Гармония»",
      lat: 55.0302,
      lng: 82.9204,
      startOffset: 2 * day,
      durationHours: 1,
      capacity: 15,
      ticketPrice: 400,
      isFree: false,
    },
    {
      slug: "sibir-cup",
      title: "Кубок «Сибири» по мини-футболу",
      description: "Ежегодный турнир среди корпоративных и любительских команд города.",
      format: EventFormat.TICKETED,
      sportSlug: "football",
      citySlug: "novosibirsk",
      venueName: "Футбольная арена «Сибирь»",
      lat: 55.0619,
      lng: 82.9346,
      startOffset: 10 * day,
      durationHours: 6,
      capacity: 60,
      ticketPrice: 600,
      isFree: false,
    },
    {
      slug: "novosib-run-club",
      title: "Беговой клуб по средам",
      description: "Еженедельная пробежка вдоль набережной Оби, темп для новичков.",
      format: EventFormat.MEETUP,
      sportSlug: "running",
      citySlug: "novosibirsk",
      venueName: null,
      lat: 55.028,
      lng: 82.9204,
      startOffset: 30 * hour,
      durationHours: 1,
      capacity: 25,
      ticketPrice: null,
      isFree: true,
    },
    {
      slug: "streetball-3x3",
      title: "Баскетбольный стритбол 3x3",
      description: "Любительский турнир по уличному баскетболу, формат 3 на 3.",
      format: EventFormat.MEETUP,
      sportSlug: "basketball",
      citySlug: "ekaterinburg",
      venueName: "Спортивный клуб «Урал»",
      lat: 56.8375,
      lng: 60.6065,
      startOffset: 3 * day,
      durationHours: 3,
      capacity: 24,
      ticketPrice: null,
      isFree: true,
    },
    {
      slug: "ekb-tennis-open",
      title: "Открытый турнир «Изумруд Опен»",
      description: "Любительский турнир по теннису среди игроков всех уровней подготовки.",
      format: EventFormat.TICKETED,
      sportSlug: "tennis",
      citySlug: "ekaterinburg",
      venueName: "Теннисный центр «Изумруд»",
      lat: 56.8231,
      lng: 60.6118,
      startOffset: 12 * hour,
      durationHours: 4,
      capacity: 20,
      ticketPrice: 800,
      isFree: false,
    },
    {
      slug: "ekb-swim-booking",
      title: "Бронирование дорожек для триатлон-клуба",
      description: "Групповая аренда бассейна для подготовки к соревнованиям по триатлону.",
      format: EventFormat.VENUE_BOOKING,
      sportSlug: "swimming",
      citySlug: "ekaterinburg",
      venueName: "Аквацентр «Исеть»",
      lat: 56.8389,
      lng: 60.6057,
      startOffset: 4 * day,
      durationHours: 2,
      capacity: 12,
      ticketPrice: null,
      isFree: true,
    },
    {
      slug: "ekb-volleyball-meetup",
      title: "Пляжный волейбол выходного дня",
      description: "Дружеские игры 4х4, приходите с любым уровнем подготовки.",
      format: EventFormat.MEETUP,
      sportSlug: "volleyball",
      citySlug: "ekaterinburg",
      venueName: "Спортивный клуб «Урал»",
      lat: 56.8375,
      lng: 60.6065,
      startOffset: 5 * day,
      durationHours: 3,
      capacity: 16,
      ticketPrice: null,
      isFree: true,
    },
  ];

  const eventIds: Record<string, string> = {};
  for (const e of eventsData) {
    const startsAt = new Date(now + e.startOffset);
    const endsAt = new Date(startsAt.getTime() + e.durationHours * 60 * 60 * 1000);
    const created = await prisma.event.create({
      data: {
        title: e.title,
        description: e.description,
        format: e.format,
        status: EventStatus.PUBLISHED,
        sportTypeId: sportTypes.get(e.sportSlug)!,
        cityId: cities.get(e.citySlug)!,
        organizerId: organizer.id,
        venueId: e.venueName ? venueIds[e.venueName] : null,
        lat: e.lat,
        lng: e.lng,
        startsAt,
        endsAt,
        coverImage: photoUrl(e.slug),
        capacity: e.capacity,
        ticketPrice: e.ticketPrice,
        isFree: e.isFree,
      },
    });
    eventIds[e.slug] = created.id;
  }

  // Reviews — mix of filler users so venues/events don't launch with zero social proof.
  const reviewPool = [mainUser, ...fillerUsers];
  const reviewComments = [
    "Отличное место, всё понравилось!",
    "Хорошее покрытие и вежливый персонал.",
    "Немного тесновато, но в целом достойно.",
    "Обязательно вернёмся ещё раз.",
    "Цена соответствует качеству.",
    "Атмосфера супер, рекомендую друзьям.",
  ];
  let reviewCounter = 0;
  const venueEntries = Object.values(venueIds);
  for (const venueId of venueEntries) {
    const reviewsForVenue = 1 + (reviewCounter % 3);
    for (let i = 0; i < reviewsForVenue; i++) {
      const author = reviewPool[reviewCounter % reviewPool.length];
      await prisma.review.create({
        data: {
          userId: author.id,
          venueId,
          rating: 3 + ((reviewCounter + i) % 3),
          comment: reviewComments[reviewCounter % reviewComments.length],
        },
      });
      reviewCounter++;
    }
  }

  const ticketedEventSlugs = eventsData.filter((e) => e.format !== EventFormat.MEETUP).map((e) => e.slug);
  for (const slug of ticketedEventSlugs.slice(0, 8)) {
    const author = reviewPool[reviewCounter % reviewPool.length];
    await prisma.review.create({
      data: {
        userId: author.id,
        eventId: eventIds[slug],
        rating: 4 + (reviewCounter % 2),
        comment: reviewComments[reviewCounter % reviewComments.length],
      },
    });
    reviewCounter++;
  }

  // Give the documented demo account (user@sport.market) some activity out of the box.
  const firstVenueId = venueIds["Теннисный центр «Изумруд»"];
  const bookingDate = new Date(now + 2 * day);
  const confirmedBooking = await prisma.booking.create({
    data: {
      venueId: firstVenueId,
      userId: mainUser.id,
      date: bookingDate,
      startTime: "18:00",
      endTime: "19:00",
      totalPrice: 1900,
      status: BookingStatus.CONFIRMED,
    },
  });
  const confirmedOrder = await prisma.order.create({
    data: { userId: mainUser.id, totalAmount: 1900, status: OrderStatus.PAID, bookingId: confirmedBooking.id },
  });
  await prisma.payment.create({
    data: { orderId: confirmedOrder.id, amount: 1900, status: PaymentStatus.SUCCEEDED, provider: "MOCK", externalId: `mock_seed_${confirmedOrder.id}` },
  });

  const pendingBooking = await prisma.booking.create({
    data: {
      venueId: venueIds["Аквацентр «Исеть»"],
      userId: mainUser.id,
      date: new Date(now + 5 * day),
      startTime: "09:00",
      endTime: "10:00",
      totalPrice: 1600,
      status: BookingStatus.PENDING,
    },
  });
  const pendingOrder = await prisma.order.create({
    data: { userId: mainUser.id, totalAmount: 1600, status: OrderStatus.PENDING, bookingId: pendingBooking.id },
  });
  await prisma.payment.create({ data: { orderId: pendingOrder.id, amount: 1600, status: PaymentStatus.PENDING, provider: "MOCK" } });

  const ticketEventId = eventIds["ekb-tennis-open"];
  const ticketOrder = await prisma.order.create({ data: { userId: mainUser.id, totalAmount: 800, status: OrderStatus.PAID } });
  await prisma.ticket.create({ data: { eventId: ticketEventId, orderId: ticketOrder.id, price: 800 } });
  await prisma.payment.create({
    data: { orderId: ticketOrder.id, amount: 800, status: PaymentStatus.SUCCEEDED, provider: "MOCK", externalId: `mock_seed_${ticketOrder.id}` },
  });

  await prisma.eventParticipant.create({ data: { eventId: eventIds["ekb-volleyball-meetup"], userId: mainUser.id } });

  await prisma.favorite.create({ data: { userId: mainUser.id, venueId: firstVenueId } });
  await prisma.favorite.create({ data: { userId: mainUser.id, venueId: venueIds["Аквацентр «Исеть»"] } });
  await prisma.favorite.create({ data: { userId: mainUser.id, eventId: eventIds["streetball-3x3"] } });

  console.log(
    `Создано городов: ${cities.size}, видов спорта: ${sportTypes.size}, пользователей: ${fillerUsers.length + 3}, площадок: ${venuesData.length}, событий: ${eventsData.length}, отзывов: ${reviewCounter}`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
