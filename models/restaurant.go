package models

import (
	"time"

	"gorm.io/gorm"
)

type Restaurant struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	Name        string         `json:"name" gorm:"not null"`
	Description string         `json:"description"`
	Address     string         `json:"address" gorm:"not null"`
	Phone       string         `json:"phone"`
	Email       string         `json:"email"`
	Website     string         `json:"website"`
	OpeningTime string         `json:"opening_time"`
	ClosingTime string         `json:"closing_time"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
	
	// Связи
	Tables []Table `json:"tables,omitempty" gorm:"foreignKey:RestaurantID"`
} 