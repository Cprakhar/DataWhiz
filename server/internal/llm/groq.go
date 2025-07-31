package llm

import (
	"bytes"
	"encoding/json"
	"errors"
	"io"
	"net/http"
)

type groqMessage struct {
	Role string `json:"role"`
	Content string `json:"content"`
}

type groqRequest struct {
	Model string `json:"model"`
	Messages []groqMessage `json:"messages"`
}

type groqResponse struct {
	Choices []struct {
		Message struct {
			Content string `json:"content"`
		} `json:"message"`
	} `json:"choices"`
}

func GenerateQuery(systemPrompt, userPrompt, apiKey, model string) (string, error) {

	reqBody := groqRequest{
		Model: model,
		Messages: []groqMessage{
			{ Role: "system", Content: systemPrompt },
			{ Role: "user", Content: userPrompt },
		},
	}

	bodyBytes, err := json.Marshal(reqBody)
	if err != nil {
		return "", err
	}

	req, err := http.NewRequest("POST", "https://api.groq.com/openai/v1/chat/completions", 
				bytes.NewBuffer(bodyBytes))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+apiKey)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		b, _ := io.ReadAll(resp.Body)
		return "", errors.New("groq API error: " + string(b))
	}

	var groqResp groqResponse
	if err := json.NewDecoder(resp.Body).Decode(&groqResp); err != nil {
		return "", err
	}
	if len(groqResp.Choices) == 0 {
		return "", errors.New("no choices returned from groq API")
	}
	return groqResp.Choices[0].Message.Content, nil
}

func GetTableNamesFromQuery(query string) ([]string, error) {
	// This is a placeholder function. The actual implementation should parse the query
	// and extract table names based on the SQL dialect.
	// For now, we return an empty slice.
	return []string{}, nil
}