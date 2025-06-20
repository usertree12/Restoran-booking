package utils

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

var jwtSecret []byte

func SetJWTSecret(secret string) {
	jwtSecret = []byte(secret)
}

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func GenerateToken(userID uint, username string) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id":  userID,
		"username": username,
		"exp":      time.Now().Add(time.Hour * 24).Unix(),
		"iat":      time.Now().Unix(),
	})
	return token.SignedString(jwtSecret)
}

func ValidateToken(tokenString string) (*jwt.Token, error) {
	if len(jwtSecret) == 0 {
		return nil, errors.New("JWT secret not set")
	}
	
	return jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return jwtSecret, nil
	})
}

func ExtractUserIDFromToken(tokenString string) (uint, error) {
	token, err := ValidateToken(tokenString)
	if err != nil {
		return 0, err
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		if userID, exists := claims["user_id"]; exists {
			if id, ok := userID.(float64); ok {
				return uint(id), nil
			}
		}
	}
	
	return 0, errors.New("invalid token claims")
} 