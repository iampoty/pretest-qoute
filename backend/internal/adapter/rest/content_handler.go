package rest

import (
	"log"
	"net/http"
	"pretest/qoute/internal/domain"
	"strconv"

	"github.com/labstack/echo/v4"
)

func getCurrentUser(c echo.Context) string {
	if c.Get("user_id") != nil {
		return c.Get("user_id").(string)
	}
	return ""
}

func (h *Handler) ListContent(c echo.Context) error {

	currentUser := getCurrentUser(c)
	// log.Printf("rest.ListContent.currentUser : %#v", currentUser)

	// vote, _ := strconv.Atoi(c.QueryParam("vote"))
	filter := &domain.ContentFilter{
		UserID:    c.QueryParam("user_id"),
		ContentID: c.QueryParam("content_id"),
		Title:     c.QueryParam("title"),
		Vote:      c.QueryParam("vote"),
		CreatedAt: c.QueryParam("date"),
	}
	// log.Printf("handler.ListContent.filter: %v", filter)
	// page, _ := strconv.Atoi(c.QueryParam("page"))
	// limit, _ := strconv.Atoi(c.QueryParam("page"))
	option := &domain.ContentOption{
		Sort:  c.QueryParam("sort"),
		Page:  c.QueryParam("page"),
		Limit: c.QueryParam("limit"),
		Last:  c.QueryParam("last"),
	}

	// log.Printf("handler.ListContent.option: %v", option)

	contents, lastid, total, err := h.ContentUsecase.ListContent(currentUser, filter, option)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, err.Error())
	}
	// if len(contents) == 0 {
	// 	return c.JSON(http.StatusNotFound, "No contents found")
	// }
	next := 2
	page, _ := strconv.Atoi(c.QueryParam("page"))
	if page > 0 {
		next = page + 1
	}
	if lastid == "" {
		next = 0
	}

	return c.JSON(http.StatusCreated, map[string]interface{}{"data": contents, "lastid": lastid, "total": total, "next": next}) // Placeholder for actual content listing
}

func (h *Handler) EditContent(c echo.Context) error {
	req := new(struct {
		ContentID string `json:"-"`
		UserID    string `json:"-"`
		Title     string `json:"title"`
		// Vote   string `json:"vote"`
	})

	if err := c.Bind(req); err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	req.ContentID = c.Param("contentid")
	// req.UserID = c.Get("user_id").(string)
	req.UserID = getCurrentUser(c)

	content, err := h.ContentUsecase.UpdateContent(req.ContentID, req.UserID, req.Title)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, map[string]string{
		"contentid":     req.ContentID,
		"title":         req.Title,
		"user_id":       req.UserID,
		"content.Title": content.Title,
	})
}

func (h *Handler) VoteContentV2(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]interface{}{})
}

func (h *Handler) VoteContent(c echo.Context) error {
	// contentID := c.Param("contentid")
	// if contentID == "" {
	// 	return c.JSON(http.StatusBadRequest, "Content ID is required")
	// }

	req := new(struct {
		// Vote      int    `json:"vote"`
		ContentID string `json:"-"`
		UserID    string `json:"-"`
	})
	if err := c.Bind(req); err != nil {
		// return c.JSON(http.StatusBadRequest, err.Error())
		return c.JSON(http.StatusBadRequest, map[string]interface{}{"message": err.Error()})
	}

	req.ContentID = c.Param("contentid")
	// req.UserID = c.Get("user_id").(string)
	req.UserID = getCurrentUser(c)

	if err := h.ContentUsecase.ContentVoteV1(req.UserID, req.ContentID); err != nil {
		log.Printf("rest.VoteContent.err: %s", err.Error())
		return c.JSON(http.StatusBadRequest, map[string]interface{}{"message": err.Error()})
	}
	// h.ContentUsecase.ContentVoteV2(req.UserID, req.ContentID)

	return c.JSON(http.StatusOK, map[string]interface{}{
		"contentid": req.ContentID,
		"user_id":   req.UserID,
		// "vote":      req.Vote,
	})
}

func (h *Handler) CreateContent(c echo.Context) error {
	req := new(struct {
		UserID string `json:"user_id"`
		Title  string `json:"title"`
		Author string `json:"author"`
	})

	if err := c.Bind(req); err != nil {
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	// if req.Title == "" {
	// 	return c.JSON(http.StatusBadRequest, "Title is required")
	// }

	// userid := c.Get("user_id").(string)
	userid := getCurrentUser(c)
	req.UserID = userid // ใช้ user_id จาก context แทน
	// vote := conv.Atoi(req.Vote)
	// Vote := conv.Atoi(req.Vote)
	content, err := h.ContentUsecase.CreateContent(req.UserID, req.Title, req.Author, 0)
	content.CanEdit = true
	content.CanDelete = true
	content.CanVote = true
	if err != nil {
		// return c.JSON(http.StatusInternalServerError, err.Error())
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{"message": err.Error()})
	}
	return c.JSON(http.StatusCreated, content)
}
