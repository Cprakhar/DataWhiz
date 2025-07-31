package llm

import (
	"bytes"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"regexp"
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

// GenerateQuery sends a request to the Groq API to generate a SQL query based on the provided system and user prompts.
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

// GetTableNamesFromQuery extracts table names from a SQL query using a regex pattern.
func GetTableNamesFromQuery(query string) ([]string, error) {
	// Regex to match table names in SQL queries as {table_name}
	re := regexp.MustCompile(`\{\w+\}`)
	matches := re.FindAllString(query, -1)
	if matches == nil {
		return nil, errors.New("no table names found in query")
	}
	tableNames := make([]string, len(matches))
	for i, match := range matches {
		tableNames[i] = match[1 : len(match)-1] // Remove the curly braces
	}
	if len(tableNames) == 0 {
		return nil, errors.New("no valid table names found in query")
	}

	return tableNames, nil
}