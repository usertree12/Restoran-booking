package models

import (
	"time"

	"gorm.io/gorm"
)

type Table struct {
	ID           uint           `json:"id" gorm:"primaryKey"`
	RestaurantID uint           `json:"restaurant_id" gorm:"not null"`
	Number       int            `json:"number" gorm:"not null"`
	Capacity     int            `json:"capacity" gorm:"not null"`
	Status       string         `json:"status" gorm:"default:'available'"`
	Location     string         `json:"location"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `json:"-" gorm:"index"`
	
	// Связи
	Restaurant Restaurant `json:"restaurant,omitempty" gorm:"foreignKey:RestaurantID"`
	Bookings   []Booking  `json:"bookings,omitempty" gorm:"foreignKey:TableID"`
} 