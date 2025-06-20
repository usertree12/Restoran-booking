package database

import (
	"fmt"
	"log"
	"restaurant-booking/config"
	"restaurant-booking/models"
	"restaurant-booking/utils"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func ConnectDB() {
	cfg := config.AppConfig
	
	dsn := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		cfg.Database.Host,
		cfg.Database.Port,
		cfg.Database.User,
		cfg.Database.Password,
		cfg.Database.DBName,
		cfg.Database.SSLMode,
	)

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	log.Println("Database connected successfully")
}

func AutoMigrate() {
	err := DB.AutoMigrate(
		&models.User{},
		&models.Restaurant{},
		&models.Table{},
		&models.Booking{},
	)
	
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}
	
	log.Println("Database migrated successfully")
}

func SeedData() {
	var userCount int64
	DB.Model(&models.User{}).Count(&userCount)
	log.Printf("Current user count: %d", userCount)
	
	if userCount == 0 {
		hashedPassword, _ := utils.HashPassword("password123")
		
		adminUser := models.User{
			Username:  "admin",
			Email:     "admin@restaurant.com",
			Password:  hashedPassword,
			FirstName: "Admin",
			LastName:  "User",
			Role:      "admin",
		}
		if err := DB.Create(&adminUser).Error; err != nil {
			log.Printf("Error creating admin user: %v", err)
		} else {
			log.Println("Created admin user")
		}

		italianAdmin := models.User{
			Username:  "italian_admin",
			Email:     "admin@italiancourtyard.ru",
			Password:  hashedPassword,
			FirstName: "Итальянский",
			LastName:  "Админ",
			Role:      "restaurant_admin",
		}
		if err := DB.Create(&italianAdmin).Error; err != nil {
			log.Printf("Error creating italian admin user: %v", err)
		} else {
			log.Println("Created italian admin user")
		}

		sakuraAdmin := models.User{
			Username:  "sakura_admin",
			Email:     "admin@sakura-sushi.ru",
			Password:  hashedPassword,
			FirstName: "Сакура",
			LastName:  "Админ",
			Role:      "restaurant_admin",
		}
		if err := DB.Create(&sakuraAdmin).Error; err != nil {
			log.Printf("Error creating sakura admin user: %v", err)
		} else {
			log.Println("Created sakura admin user")
		}
	}

	var restaurantCount int64
	DB.Model(&models.Restaurant{}).Count(&restaurantCount)
	if restaurantCount == 0 {
		restaurants := []models.Restaurant{
			{
				Name:        "Итальянский дворик",
				Description: "Аутентичная итальянская кухня в уютной атмосфере. Свежие пасты, пицца из дровяной печи и отличное вино.",
				Address:     "ул. Тверская, 15, Москва",
				Phone:       "+7 (495) 123-45-67",
				Email:       "info@italiancourtyard.ru",
				Website:     "https://italiancourtyard.ru",
				OpeningTime: "11:00",
				ClosingTime: "23:00",
			},
			{
				Name:        "Суши-бар Сакура",
				Description: "Современный японский ресторан с традиционными суши, роллами и горячими блюдами. Идеально для романтического ужина.",
				Address:     "Кутузовский проспект, 28, Москва",
				Phone:       "+7 (495) 987-65-43",
				Email:       "reserve@sakura-sushi.ru",
				Website:     "https://sakura-sushi.ru",
				OpeningTime: "12:00",
				ClosingTime: "00:00",
			},
		}
		
		for i, restaurant := range restaurants {
			DB.Create(&restaurant)
			log.Printf("Created restaurant: %s", restaurant.Name)
			
			tables := []models.Table{
				{RestaurantID: restaurant.ID, Number: 1, Capacity: 2, Status: "available", Location: "У окна"},
				{RestaurantID: restaurant.ID, Number: 2, Capacity: 4, Status: "available", Location: "В центре"},
				{RestaurantID: restaurant.ID, Number: 3, Capacity: 6, Status: "available", Location: "У стены"},
				{RestaurantID: restaurant.ID, Number: 4, Capacity: 8, Status: "available", Location: "VIP зона"},
				{RestaurantID: restaurant.ID, Number: 5, Capacity: 2, Status: "available", Location: "Терраса"},
			}
			DB.Create(&tables)
			log.Printf("Created %d tables for restaurant: %s", len(tables), restaurant.Name)

			if i == 0 {
				var italianAdmin models.User
				if err := DB.Where("username = ?", "italian_admin").First(&italianAdmin).Error; err != nil {
					log.Printf("Error finding italian admin: %v", err)
				} else {
					italianAdmin.RestaurantID = &restaurant.ID
					if err := DB.Save(&italianAdmin).Error; err != nil {
						log.Printf("Error assigning italian admin: %v", err)
					} else {
						log.Printf("Assigned italian admin to restaurant: %s", restaurant.Name)
					}
				}
			} else if i == 1 {
				var sakuraAdmin models.User
				if err := DB.Where("username = ?", "sakura_admin").First(&sakuraAdmin).Error; err != nil {
					log.Printf("Error finding sakura admin: %v", err)
				} else {
					sakuraAdmin.RestaurantID = &restaurant.ID
					if err := DB.Save(&sakuraAdmin).Error; err != nil {
						log.Printf("Error assigning sakura admin: %v", err)
					} else {
						log.Printf("Assigned sakura admin to restaurant: %s", restaurant.Name)
					}
				}
			}
		}
	}
} 