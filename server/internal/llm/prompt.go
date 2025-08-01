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
		If any column is of type uuid and you need to compare it to a string, always typecast the string to uuid using ::uuid (e.g., column = 'value'::uuid), because you cannot compare uuid and text directly in SQL.
		Return only the query as plain text, without any explanation, markdown, or code block formatting (such as triple backticks or language tags).`,
		caser.String(dbType), dbType, strings.Join(tables, ", "), string(schemaJson), caser.String(dbType),
	)

	return prompt, nil
}