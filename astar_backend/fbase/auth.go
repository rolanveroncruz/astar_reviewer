package fbase

import (
	"context"
	"log"
	"net/http"
	"strings"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/auth"
	"github.com/gin-gonic/gin"
	"google.golang.org/api/option"
)

func MustInitFirebase() (*firebase.App, error) {
	ctx := context.Background()
	app, err := firebase.NewApp(ctx, nil, option.WithAuthCredentialsFile(option.ServiceAccount, "./serviceAccountKey.json"))
	if err != nil {
		log.Fatalf("Cannot initialize Firebase app: %v", err)
		return nil, err
	}
	return app, nil

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

func FirebaseAuthMiddleware(authClient *auth.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString := extractBearer(c.GetHeader("Authorization"))
		if tokenString == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "missing bearer token"})
			return
		}

		ctx := c.Request.Context()
		decoded, err := authClient.VerifyIDToken(ctx, tokenString)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid or expired fbase token"})
			return
		}

		// decoded.UID is the Firebase uid
		log.Printf("\n\n claims: %+v\n", decoded)
		c.Set("user_id", decoded.UID)
		c.Set("user_email", decoded.Claims["email"].(string))
		c.Set("user_name", decoded.Claims["name"].(string))

		// custom claims live in decoded.Claims (map[string]any)
		if role, ok := decoded.Claims["role"].(string); ok {
			c.Set("role", role)
		}

		c.Next()
	}
}
