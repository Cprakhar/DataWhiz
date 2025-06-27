package llm

import (
	"context"
	"fmt"

	"google.golang.org/genai"
)

func CallGeminiLLM(prompt, dbType string) (string, error) {
	ctx := context.Background()
	client, err := genai.NewClient(ctx, nil)
	if err != nil {
		return "", err
	}
	fullPrompt := fmt.Sprintf("Generate a %s query for: %s", dbType, prompt)
	result, err := client.Models.GenerateContent(
		ctx,
		"gemini-2.5-flash",
		genai.Text(fullPrompt),
		nil,
	)
	if err != nil {
		return "", err
	}
	return result.Text(), nil
}
