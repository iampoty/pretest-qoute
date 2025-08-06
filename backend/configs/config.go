package configs

import (
	"fmt"
	"strings"

	"github.com/spf13/viper"
)

type (
	Config struct {
		Server *Server
		Db     *Db
	}

	Server struct {
		Port int
	}

	Db struct {
		Host string
		Port int
		Name string
	}
)

var (
	configInstance *Config
)

func GetConfig() *Config {
	config := viper.New()

	config.SetConfigName("config")
	config.SetConfigType("yaml")
	// config.AddConfigPath("./../")
	// config.AddConfigPath("./")
	config.AddConfigPath("./")
	config.AutomaticEnv()
	config.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))
	if err := config.ReadInConfig(); err != nil {
		panic(fmt.Errorf("fatal error config file: %s", err))
	}

	if err := config.Unmarshal(&configInstance); err != nil {
		panic(err)
	}

	// log.Printf("Config loaded server: %#v", configInstance.Server)
	// log.Printf("Config loaded db: %#v", configInstance.Db)

	return configInstance
	// return &Config{
	// 	Server: &Server{
	// 		Port: 8881,
	// 	},
	// 	Db: &Db{
	// 		Host: "localhost",
	// 		Port: 27017,
	// 		Name: "cag_db",
	// 	},
	// }
}
