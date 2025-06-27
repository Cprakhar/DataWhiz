package handlers

import (
	"net/http"
	"strconv"

	"datawhiz/internal/db"
	"datawhiz/internal/models"

	"github.com/gin-gonic/gin"
)

func QueryHistoryHandler(c *gin.Context) {
	userIDParam := c.Param("user_id")
	userID, err := strconv.ParseUint(userIDParam, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user_id"})
		return
	}
	jwtUserID, ok := getUserIDFromContext(c)
	if !ok || jwtUserID != uint(userID) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Forbidden"})
		return
	}
	var history []models.QueryHistory
	if err := db.DB.Where("user_id = ?", jwtUserID).Order("executed_at desc").Find(&history).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch history"})
		return
	}
	c.JSON(http.StatusOK, history)
}
