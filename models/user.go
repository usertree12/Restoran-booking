package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID           uint           `json:"id" gorm:"primaryKey"`
	Username     string         `json:"username" gorm:"uniqueIndex;not null"`
	Email        string         `json:"email" gorm:"uniqueIndex;not null"`
	Password     string         `json:"-" gorm:"not null"`
	FirstName    string         `json:"first_name"`
	LastName     string         `json:"last_name"`
	Phone        string         `json:"phone"`
	Role         string         `json:"role" gorm:"default:'customer'"`
	RestaurantID *uint          `json:"restaurant_id"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `json:"-" gorm:"index"`
	
	Restaurant Restaurant `json:"restaurant,omitempty" gorm:"foreignKey:RestaurantID"`
} 