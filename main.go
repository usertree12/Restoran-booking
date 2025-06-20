package main

import (
	"fmt"
	"os"
	"restaurant-booking/config"
	"restaurant-booking/database"
	"restaurant-booking/routes"
	"restaurant-booking/utils"

	"github.com/sirupsen/logrus"
)

func main() {
	log := logrus.New()
	log.SetFormatter(&logrus.JSONFormatter{})
	log.SetLevel(logrus.InfoLevel)

	file, err := os.OpenFile("app.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err == nil {
		log.SetOutput(file)
	} else {
		log.Warn("Не удалось открыть файл логов, логирование в консоль")
	}

	log.Info("Запуск приложения Restaurant Booking System")

	config.LoadConfig()
	log.Info("Конфигурация загружена")

	utils.SetJWTSecret(config.AppConfig.JWT.Secret)
	log.Info("JWT секрет установлен")

	database.ConnectDB()
	log.Info("Подключение к базе данных установлено")

	database.AutoMigrate()
	log.Info("Миграции базы данных выполнены")

	database.SeedData()
	log.Info("Тестовые данные добавлены")

	r := routes.SetupRoutes()
	log.Info("Маршруты настроены")

	port := fmt.Sprintf(":%d", config.AppConfig.App.Port)
	log.Infof("Сервер запускается на порту %s", port)
	
	if err := r.Run(port); err != nil {
		log.Fatal("Ошибка запуска сервера:", err)
	}
} 