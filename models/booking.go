package models

import (
	"time"

	"gorm.io/gorm"
)

type Booking struct {
	ID         uint           `json:"id" gorm:"primaryKey"`
	UserID     uint           `json:"user_id" gorm:"not null"`
	TableID    uint           `json:"table_id" gorm:"not null"`
	RestaurantID uint          `json:"restaurant_id" gorm:"not null"`
	Date       string         `json:"date" gorm:"not null"`
	Time       string         `json:"time" gorm:"not null"`
	Duration   int            `json:"duration" gorm:"default:120"` // в минутах
	Guests     int            `json:"guests" gorm:"not null"`
	Status     string         `json:"status" gorm:"default:'pending'"` // pending, confirmed, cancelled, completed
	Notes      string         `json:"notes"`
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `json:"-" gorm:"index"`
	
	// Связи
	User       User       `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Table      Table      `json:"table,omitempty" gorm:"foreignKey:TableID"`
	Restaurant Restaurant `json:"restaurant,omitempty" gorm:"foreignKey:RestaurantID"`
} 