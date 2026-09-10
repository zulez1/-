import { PrismaClient, EventFormat, EventStatus, UserRole, VenueStatus } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const CITIES = [
  { name: "Москва", slug: "moscow", lat: 55.7558, lng: 37.6173, zoom: 10 },
  { name: "Санкт-Петербург", slug: "spb", lat: 59.9311, lng: 30.3609, zoom: 10 },
  { name: "Казань", slug: "kazan", lat: 55.7963, lng: 49.1088, zoom: 11 },
  { name: "Новосибирск", slug: "novosibirsk", lat: 55.0084, lng: 82.9357, zoom: 11 },
  { name: "Екатеринбург", slug: "ekaterinburg", lat: 56.8389, lng: 60.6057, zoom: 11 },
];

const SPORT_TYPES = [
  { name: "Футбол", slug: "football", icon: "⚽" },
  { name: "Баскетбол", slug: "basketball", icon: "🏀" },
  { name: "Теннис", slug: "tennis", icon: "🎾" },
  { name: "Волейбол", slug: "volleyball", icon: "🏐" },
  { name: "Плавание", slug: "swimming", icon: "🏊" },
  { name: "Бег", slug: "running", icon: "🏃" },
  { name: "Йога", slug: "yoga", icon: "🧘" },
  { name: "Хоккей", slug: "hockey", icon: "🏒" },
  { name: "Бадминтон", slug: "badminton", icon: "🏸" },
  { name: "Воркаут", slug: "workout", icon: "💪" },
];

async function main() {
  console.log("Seeding database...");

  const cities = new Map<string, string>();
  for (const city of CITIES) {
    const created = await prisma.city.upsert({
      where: { slug: city.slug },
      update: {},
      create: city,
    });
    cities.set(city.slug, created.id);
  }

  const sportTypes = new Map<string, string>();
  for (const sport of SPORT_TYPES) {
    const created = await prisma.sportType.upsert({
      where: { slug: sport.slug },
      update: {},
      create: sport,
    });
    sportTypes.set(sport.slug, created.id);
  }

  const passwordHash = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@sport.market" },
    update: {},
    create: {
      email: "admin@sport.market",
      passwordHash,
      name: "Администратор",
      role: UserRole.ADMIN,
      cityId: cities.get("moscow"),
    },
  });

  const organizer = await prisma.user.upsert({
    where: { email: "organizer@sport.market" },
    update: {},
    create: {
      email: "organizer@sport.market",
      passwordHash,
      name: "Алексей Организатов",
      role: UserRole.ORGANIZER,
      cityId: cities.get("moscow"),
    },
  });

  const regularUser = await prisma.user.upsert({
    where: { email: "user@sport.market" },
    update: {},
    create: {
      email: "user@sport.market",
      passwordHash,
      name: "Мария Иванова",
      role: UserRole.USER,
      cityId: cities.get("spb"),
    },
  });

  console.log("Пользователи:", { admin: admin.email, organizer: organizer.email, user: regularUser.email });

  const venuesData = [
    {
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
        photos: [],
        sportTypes: {
          create: v.sports.map((slug) => ({ sportTypeId: sportTypes.get(slug)! })),
        },
      },
    });
    venueIds[v.name] = venue.id;
  }

  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  const eventsData = [
    {
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
      title: "Утренняя пробежка в парке Горького",
      description: "Бесплатная любительская пробежка для всех уровней подготовки. Присоединяйтесь!",
      format: EventFormat.MEETUP,
      sportSlug: "running",
      citySlug: "moscow",
      venueName: null,
      lat: 55.7298,
      lng: 37.6015,
      startOffset: 1 * day,
      durationHours: 2,
      capacity: 30,
      ticketPrice: null,
      isFree: true,
    },
    {
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
  ];

  for (const e of eventsData) {
    const startsAt = new Date(now + e.startOffset);
    const endsAt = new Date(startsAt.getTime() + e.durationHours * 60 * 60 * 1000);
    await prisma.event.create({
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
        capacity: e.capacity,
        ticketPrice: e.ticketPrice,
        isFree: e.isFree,
      },
    });
  }

  console.log(`Создано городов: ${cities.size}, видов спорта: ${sportTypes.size}, площадок: ${venuesData.length}, событий: ${eventsData.length}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
