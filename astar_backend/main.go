package main

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/joho/godotenv"
	"github.com/rolanveroncruz/astar_reviewer/astar_backend/fbase"
)

type Config struct {
	Addr      string
	JWTSecret string

	// Comma-separated list, e.g.
	// http://localhost:4200,https://app.example.com
	CORSAllowedOrigins []string
}

func loadConfig() Config {
	_ = godotenv.Load()
	addr := getenv("BACKEND_PORT", ":8080")
	secret := getenv("JWT_SECRET", "dev-secret-change-me")

	origins := getenv("CORS_ALLOWED_ORIGINS", "http://localhost:4200")
	originList := splitAndTrim(origins)

	return Config{
		Addr:               addr,
		JWTSecret:          secret,
		CORSAllowedOrigins: originList,
	}
}
func main() {
	// Initialize Firebase stuff
	fbApp, err := fbase.MustInitFirebase()
	if err != nil {
		log.Fatalf("Cannot initialize Firebase in main(): %v", err)
	}
	authClient, err := fbApp.Auth(context.Background())
	if err != nil {
		log.Fatalf("Cannot initialize Firebase Auth in main(): %v", err)
	}

	// Configure GIN and others
	cfg := loadConfig()

	// In prod you might want gin.ReleaseMode
	if os.Getenv("GIN_MODE") == "" {
		gin.SetMode(gin.DebugMode)
	}

	r := gin.New()

	// Basic middlewares
	r.Use(gin.Logger())
	r.Use(gin.Recovery())

	// CORS: allow Angular to call your API
	r.Use(cors.New(cors.Config{
		AllowOrigins:  cfg.CORSAllowedOrigins,
		AllowMethods:  []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:  []string{"Authorization", "Content-Type"},
		ExposeHeaders: []string{
			// optional: if you ever need to expose custom headers
		},
		AllowCredentials: false, // IMPORTANT: with localStorage + Authorization header, you usually keep this false
		MaxAge:           12 * time.Hour,
	}))

	// Health check (no auth)
	r.GET("/healthz", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"ok": true, "ts": time.Now().UTC().Format(time.RFC3339)})
	})

	api := r.Group("/api/v1")
	// Protected routes
	protected := api.Group("")
	protected.Use(fbase.FirebaseAuthMiddleware(authClient))

	protected.GET("/me", func(c *gin.Context) {
		// Claims set by middleware
		userID := c.GetString("user_id")
		email := c.GetString("user_email")
		name := c.GetString("user_name")

		c.JSON(http.StatusOK, gin.H{
			"userId": userID,
			"email":  email,
			"name":   name,
		})
	})

	log.Printf("Listening on %s\n", cfg.Addr)
	if err := r.Run(cfg.Addr); err != nil {
		log.Fatal(err)
	}
}

// --- JWT helpers ---

// CustomClaims is a minimal example. Extend with email, permissions, etc.
type CustomClaims struct {
	UserID string `json:"uid"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

func issueJWT(secret, userID, role string, ttl time.Duration) (string, error) {
	now := time.Now()
	claims := CustomClaims{
		UserID: userID,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(ttl)),
		},
	}
	t := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return t.SignedString([]byte(secret))
}

func parseAndValidateJWT(secret, tokenString string) (*CustomClaims, error) {
	claims := &CustomClaims{}
	// jwt.ParseWithClaims validates signature + exp/nbf if present
	_, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (any, error) {
		// Enforce HS256 (avoid alg=none attacks / surprises)
		if token.Method != jwt.SigningMethodHS256 {
			return nil, errors.New("unexpected signing method")
		}
		return []byte(secret), nil
	})
	if err != nil {
		return nil, err
	}
	return claims, nil
}

// authMiddleware expects: Authorization: Bearer <token>
func authMiddleware(jwtSecret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		auth := c.GetHeader("Authorization")
		tokenString := extractBearer(auth)
		if tokenString == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "missing bearer token"})
			return
		}

		claims, err := parseAndValidateJWT(jwtSecret, tokenString)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid or expired token"})
			return
		}

		// Stash useful values for handlers
		c.Set("user_id", claims.UserID)
		c.Set("role", claims.Role)

		c.Next()
	}
}

func extractBearer(authHeader string) string {
	// Expected: "Bearer <token>"
	if authHeader == "" {
		return ""
	}
	parts := strings.SplitN(authHeader, " ", 2)
	if len(parts) != 2 {
		return ""
	}
	if !strings.EqualFold(parts[0], "bearer") {
		return ""
	}
	return strings.TrimSpace(parts[1])
}

// --- small config helpers ---

func getenv(k, fallback string) string {
	v := os.Getenv(k)
	if v == "" {
		return fallback
	}
	return v
}

func splitAndTrim(s string) []string {
	raw := strings.Split(s, ",")
	out := make([]string, 0, len(raw))
	for _, item := range raw {
		t := strings.TrimSpace(item)
		if t != "" {
			out = append(out, t)
		}
	}
	return out
}
