package handlers

import (
	"net/http"
	"strconv"
	"restaurant-booking/database"
	"restaurant-booking/models"

	"github.com/gin-gonic/gin"
)

// Получить все рестораны
func GetRestaurants(c *gin.Context) {
	var restaurants []models.Restaurant
	
	if err := database.DB.Find(&restaurants).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch restaurants"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"restaurants": restaurants,
	})
}

// Получить ресторан по ID
func GetRestaurant(c *gin.Context) {
	id := c.Param("id")
	restaurantID, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid restaurant ID"})
		return
	}

	var restaurant models.Restaurant
	if err := database.DB.Preload("Tables").First(&restaurant, restaurantID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Restaurant not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"restaurant": restaurant,
	})
}

// Создать новый ресторан
func CreateRestaurant(c *gin.Context) {
	var restaurant models.Restaurant
	if err := c.ShouldBindJSON(&restaurant); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := database.DB.Create(&restaurant).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create restaurant"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Restaurant created successfully",
		"restaurant": restaurant,
	})
}

// Обновить ресторан
func UpdateRestaurant(c *gin.Context) {
	id := c.Param("id")
	restaurantID, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid restaurant ID"})
		return
	}

	var restaurant models.Restaurant
	if err := database.DB.First(&restaurant, restaurantID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Restaurant not found"})
		return
	}

	var updateData models.Restaurant
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := database.DB.Model(&restaurant).Updates(updateData).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update restaurant"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Restaurant updated successfully",
		"restaurant": restaurant,
	})
}

// Удалить ресторан
func DeleteRestaurant(c *gin.Context) {
	id := c.Param("id")
	restaurantID, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid restaurant ID"})
		return
	}

	var restaurant models.Restaurant
	if err := database.DB.First(&restaurant, restaurantID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Restaurant not found"})
		return
	}

	if err := database.DB.Delete(&restaurant).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete restaurant"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Restaurant deleted successfully",
	})
} 