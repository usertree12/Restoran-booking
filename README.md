# Система бронирования ресторанов

Полнофункциональная платформа для бронирования столиков в ресторанах с современным веб-интерфейсом.

## Технологии

### Backend
- **Go** - основной язык программирования
- **Gin** - веб-фреймворк
- **GORM** - ORM для работы с базой данных
- **PostgreSQL** - основная база данных
- **Redis** - кэширование и сессии
- **JWT** - аутентификация

### Frontend
- **React** - пользовательский интерфейс
- **TypeScript** - типизация
- **Material-UI** - компоненты интерфейса
- **React Query** - управление состоянием
- **React Router** - маршрутизация
- **Vite** - сборка и разработка

### Инфраструктура
- **Docker** - контейнеризация
- **Nginx** - reverse proxy и балансировка нагрузки
- **GitHub Actions** - CI/CD

## Функциональность

### Для пользователей
- Регистрация и аутентификация
- Просмотр списка ресторанов
- Детальная информация о ресторанах
- Бронирование столиков с выбором даты, времени и количества гостей
- Просмотр и управление своими бронированиями
- Отмена бронирований

### Для администраторов
- Управление ресторанами
- Просмотр всех бронирований
- Подтверждение/отмена бронирований

## Быстрый старт

### Предварительные требования
- Docker и Docker Compose
- Git

### Установка и запуск

1. Клонируйте репозиторий:
```bash
git clone <repository-url>
cd restaurant-booking-system
```

2. Создайте SSL сертификаты:
```bash
./generate-ssl.sh
```

3. Запустите приложение:
```bash
docker-compose up -d
```

4. Откройте браузер и перейдите по адресу:
   - HTTP: http://localhost
   - HTTPS: https://localhost

### Структура проекта

```
├── frontend/                 # React приложение
│   ├── src/
│   │   ├── components/      # React компоненты
│   │   ├── pages/          # Страницы приложения
│   │   ├── contexts/       # React контексты
│   │   ├── services/       # API сервисы
│   │   └── types/          # TypeScript типы
│   ├── package.json
│   └── Dockerfile
├── config/                  # Конфигурация приложения
├── database/               # Настройки базы данных
├── handlers/               # HTTP обработчики
├── middleware/             # Middleware
├── models/                 # GORM модели
├── routes/                 # Маршруты API
├── utils/                  # Утилиты
├── nginx/                  # Конфигурация Nginx
├── docker-compose.yaml     # Docker Compose
├── Dockerfile             # Dockerfile для backend
├── go.mod                 # Go модули
└── main.go                # Точка входа
```

## API Endpoints

### Аутентификация
- `POST /api/login` - вход в систему
- `POST /api/register` - регистрация

### Рестораны
- `GET /api/restaurants` - список ресторанов
- `GET /api/restaurants/:id` - информация о ресторане
- `GET /api/restaurants/:id/tables/available` - доступные столики

### Бронирования
- `GET /api/bookings` - список бронирований пользователя
- `POST /api/bookings` - создание бронирования
- `PUT /api/bookings/:id` - обновление бронирования
- `DELETE /api/bookings/:id` - отмена бронирования

## Разработка

### Backend
```bash
# Установка зависимостей
go mod download

# Запуск в режиме разработки
go run main.go
```

### Frontend
```bash
cd frontend

# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev

# Сборка для продакшена
npm run build
```

## Конфигурация

### Переменные окружения
Создайте файл `.env` в корне проекта:

```env
APP_ENV=development
SERVER_PORT=8080
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=restaurant_booking
DB_SSLMODE=disable
JWT_SECRET=your-secret-key
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

## CI/CD

Проект включает GitHub Actions workflow для автоматической сборки и деплоя:

- Автоматическая сборка при push в main ветку
- Тестирование кода
- Сборка Docker образов
- Деплой на сервер
