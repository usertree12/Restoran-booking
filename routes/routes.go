package routes

import (
	"restaurant-booking/handlers"
	"restaurant-booking/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes() *gin.Engine {
	r := gin.Default()

	// Публичные маршруты
	public := r.Group("/api")
	{
		// Аутентификация
		public.POST("/register", handlers.Register)
		public.POST("/login", handlers.Login)
		
		// Рестораны (публичные)
		public.GET("/restaurants", handlers.GetRestaurants)
		public.GET("/restaurants/id/:id", handlers.GetRestaurant)
		public.GET("/restaurants/:restaurant_id/tables/available", handlers.GetAvailableTables)
	}

	// Защищенные маршруты
	protected := r.Group("/api")
	protected.Use(middleware.AuthMiddleware())
	{
		// Бронирования
		protected.GET("/bookings", handlers.GetUserBookings)
		protected.GET("/bookings/id/:id", handlers.GetBooking)
		protected.POST("/bookings", handlers.CreateBooking)
		protected.PUT("/bookings/id/:id", handlers.UpdateBooking)
		protected.DELETE("/bookings/id/:id", handlers.CancelBooking)
	}

	// Админские маршруты
	admin := r.Group("/api/admin")
	admin.Use(middleware.AdminMiddleware())
	{
		// Управление ресторанами
		admin.POST("/restaurants", handlers.CreateRestaurant)
		admin.PUT("/restaurants/id/:id", handlers.UpdateRestaurant)
		admin.DELETE("/restaurants/id/:id", handlers.DeleteRestaurant)
		
		admin.GET("/bookings", handlers.GetRestaurantBookings)
		admin.PUT("/bookings/id/:id/status", handlers.UpdateBookingStatus)
	}

	return r
} 