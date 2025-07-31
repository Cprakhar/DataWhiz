package llm

import (
	"encoding/json"
	"fmt"
	"strings"

	"golang.org/x/text/cases"
	"golang.org/x/text/language"
)

func ConstructPromptSQL(tableSchema, tables interface{}, dbType string) (string, error) {

	schemaJson, err := json.MarshalIndent(tableSchema, "", "  ")
	if err != nil {
		return "", err
	}

	caser := cases.Title(language.English)

	prompt := fmt.Sprintf(
		`You are an expert %s query generator.
		Below is the database schema and table list:
		Database Type: %s

		All Tables:
		%s

		Schema (JSON):
		%s
		 
		Given a natural language query, generate a valid %s query using the provided schema and tables.
		Return only the query without any explanation or additional text.`,
		caser.String(dbType), dbType, strings.Join(tables.([]string), ", "), string(schemaJson), caser.String(dbType),
	)

	return prompt, nil
}