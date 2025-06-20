package handlers

import (
	"net/http"
	"strconv"
	"restaurant-booking/database"
	"restaurant-booking/models"

	"github.com/gin-gonic/gin"
)

type CreateBookingRequest struct {
	TableID    uint   `json:"table_id" binding:"required"`
	RestaurantID uint  `json:"restaurant_id" binding:"required"`
	Date       string `json:"date" binding:"required"`
	Time       string `json:"time" binding:"required"`
	Duration   int    `json:"duration"`
	Guests     int    `json:"guests" binding:"required"`
	Notes      string `json:"notes"`
}

// Получить все бронирования пользователя
func GetUserBookings(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var bookings []models.Booking
	if err := database.DB.Where("user_id = ? AND status != ?", userID, "cancelled").Preload("Restaurant").Preload("Table").Find(&bookings).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch bookings"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"bookings": bookings,
	})
}

// Получить бронирование по ID
func GetBooking(c *gin.Context) {
	id := c.Param("id")
	bookingID, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid booking ID"})
		return
	}

	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var booking models.Booking
	if err := database.DB.Where("id = ? AND user_id = ?", bookingID, userID).Preload("Restaurant").Preload("Table").First(&booking).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Booking not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"booking": booking,
	})
}

// Создать новое бронирование
func CreateBooking(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var req CreateBookingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Проверяем, доступен ли столик
	var table models.Table
	if err := database.DB.Where("id = ? AND restaurant_id = ?", req.TableID, req.RestaurantID).First(&table).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Table not found"})
		return
	}

	if table.Status != "available" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Table is not available"})
		return
	}

	// Проверяем, нет ли конфликтующих бронирований
	var existingBooking models.Booking
	if err := database.DB.Where("table_id = ? AND date = ? AND status IN (?)", 
		req.TableID, req.Date, []string{"pending", "confirmed"}).First(&existingBooking).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Table is already booked for this date"})
		return
	}

	// Создаем бронирование
	booking := models.Booking{
		UserID:       userID.(uint),
		TableID:      req.TableID,
		RestaurantID: req.RestaurantID,
		Date:         req.Date,
		Time:         req.Time,
		Duration:     req.Duration,
		Guests:       req.Guests,
		Notes:        req.Notes,
		Status:       "pending",
	}

	if err := database.DB.Create(&booking).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create booking"})
		return
	}

	// Обновляем статус столика
	database.DB.Model(&table).Update("status", "booked")

	c.JSON(http.StatusCreated, gin.H{
		"message": "Booking created successfully",
		"booking": booking,
	})
}

// Обновить бронирование
func UpdateBooking(c *gin.Context) {
	id := c.Param("id")
	bookingID, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid booking ID"})
		return
	}

	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var booking models.Booking
	if err := database.DB.Where("id = ? AND user_id = ?", bookingID, userID).First(&booking).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Booking not found"})
		return
	}

	var updateData models.Booking
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := database.DB.Model(&booking).Updates(updateData).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update booking"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Booking updated successfully",
		"booking": booking,
	})
}

// Отменить бронирование
func CancelBooking(c *gin.Context) {
	id := c.Param("id")
	bookingID, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid booking ID"})
		return
	}

	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var booking models.Booking
	if err := database.DB.Where("id = ? AND user_id = ?", bookingID, userID).First(&booking).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Booking not found"})
		return
	}

	if booking.Status == "cancelled" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Booking is already cancelled"})
		return
	}

	// Отменяем бронирование
	if err := database.DB.Model(&booking).Update("status", "cancelled").Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to cancel booking"})
		return
	}

	// Освобождаем столик
	database.DB.Model(&models.Table{}).Where("id = ?", booking.TableID).Update("status", "available")

	c.JSON(http.StatusOK, gin.H{
		"message": "Booking cancelled successfully",
	})
}

// Получить доступные столики для ресторана
func GetAvailableTables(c *gin.Context) {
	restaurantID := c.Param("restaurant_id")
	date := c.Query("date")
	time := c.Query("time")
	guests := c.Query("guests")

	if date == "" || time == "" || guests == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Date, time and guests are required"})
		return
	}

	guestsCount, err := strconv.Atoi(guests)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid guests count"})
		return
	}

	var tables []models.Table
	query := database.DB.Where("restaurant_id = ? AND capacity >= ? AND status = ?", 
		restaurantID, guestsCount, "available")
	
	if err := query.Find(&tables).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch tables"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"tables": tables,
	})
}

func GetRestaurantBookings(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var user models.User
	if err := database.DB.Where("id = ?", userID).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}

	if user.Role != "restaurant_admin" && user.Role != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	var bookings []models.Booking
	query := database.DB.Preload("User").Preload("Table").Preload("Restaurant")
	
	if user.Role == "restaurant_admin" && user.RestaurantID != nil {
		query = query.Where("restaurant_id = ?", *user.RestaurantID)
	}
	
	if err := query.Find(&bookings).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch bookings"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"bookings": bookings,
	})
}

func UpdateBookingStatus(c *gin.Context) {
	id := c.Param("id")
	bookingID, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid booking ID"})
		return
	}

	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var user models.User
	if err := database.DB.Where("id = ?", userID).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}

	if user.Role != "restaurant_admin" && user.Role != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	var req struct {
		Status string `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var booking models.Booking
	query := database.DB.Where("id = ?", bookingID)
	if user.Role == "restaurant_admin" && user.RestaurantID != nil {
		query = query.Where("restaurant_id = ?", *user.RestaurantID)
	}
	
	if err := query.First(&booking).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Booking not found"})
		return
	}

	if err := database.DB.Model(&booking).Update("status", req.Status).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update booking status"})
		return
	}

	if req.Status == "cancelled" {
		database.DB.Model(&models.Table{}).Where("id = ?", booking.TableID).Update("status", "available")
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Booking status updated successfully",
		"booking": booking,
	})
} 