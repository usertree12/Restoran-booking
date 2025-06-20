package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
	"gopkg.in/yaml.v3"
)

type Config struct {
	App struct {
		Env  string `yaml:"env"`
		Port int    `yaml:"port"`
	} `yaml:"app"`
	Database struct {
		Host     string `yaml:"host"`
		Port     int    `yaml:"port"`
		User     string `yaml:"user"`
		Password string `yaml:"password"`
		DBName   string `yaml:"dbname"`
		SSLMode  string `yaml:"sslmode"`
	} `yaml:"database"`
	JWT struct {
		Secret string `yaml:"secret"`
	} `yaml:"jwt"`
}

var AppConfig *Config

func LoadConfig() {
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	configFile := GetEnv("CONFIG_FILE", "config/config.yaml")
	AppConfig, err = LoadYAMLConfig(configFile)
	if err != nil {
		log.Printf("Error loading YAML config: %v", err)
		AppConfig = &Config{}
	}

	overrideWithEnvVars(AppConfig)
}

func overrideWithEnvVars(config *Config) {
	if env := GetEnv("APP_ENV", ""); env != "" {
		config.App.Env = env
	}
	if port := GetEnv("SERVER_PORT", ""); port != "" {
		config.App.Port = 8080
	}
	if host := GetEnv("DB_HOST", ""); host != "" {
		config.Database.Host = host
	}
	if port := GetEnv("DB_PORT", ""); port != "" {
		config.Database.Port = 5432
	}
	if user := GetEnv("DB_USER", ""); user != "" {
		config.Database.User = user
	}
	if password := GetEnv("DB_PASSWORD", ""); password != "" {
		config.Database.Password = password
	}
	if dbname := GetEnv("DB_NAME", ""); dbname != "" {
		config.Database.DBName = dbname
	}
	if sslmode := GetEnv("DB_SSLMODE", ""); sslmode != "" {
		config.Database.SSLMode = sslmode
	}
	if secret := GetEnv("JWT_SECRET", ""); secret != "" {
		config.JWT.Secret = secret
	}
}

func GetEnv(key string, defaultValue string) string {
	value, exists := os.LookupEnv(key)
	if !exists {
		return defaultValue
	}
	return value
}

func LoadYAMLConfig(filename string) (*Config, error) {
	data, err := os.ReadFile(filename)
	if err != nil {
		return nil, err
	}

	var config Config
	err = yaml.Unmarshal(data, &config)
	if err != nil {
		return nil, err
	}

	return &config, nil
} 