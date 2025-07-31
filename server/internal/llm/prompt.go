package llm

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/cprakhar/datawhiz/internal/database/schema"
	"golang.org/x/text/cases"
	"golang.org/x/text/language"
)

// ConstructPromptSQL constructs a SQL prompt based on the provided table schemas and database type.
func ConstructPromptSQL(tablesSchema map[string][]schema.ColumnSchema, tables []string, dbType string) (string, error) {

	schemaJson, err := json.MarshalIndent(tablesSchema, "", "  ")
	if err != nil {
		return "", err
	}

	caser := cases.Title(language.English)

	prompt := fmt.Sprintf(
		`You are an expert %s query generator.
		Below is the relevent schemas of table and table list:
		Database Type: %s

		All Tables:
		%s

		Schemas (JSON):
		%s
		 
		Given a natural language query, generate a valid %s query using the provided schemas and tables.
		Return only the query without any explanation or additional text.`,
		caser.String(dbType), dbType, strings.Join(tables, ", "), string(schemaJson), caser.String(dbType),
	)

	return prompt, nil
}