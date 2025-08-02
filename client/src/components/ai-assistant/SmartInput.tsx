import { GetTables } from "@/api/table/table";
import React, { useState, useRef, useEffect, Dispatch, SetStateAction } from "react";

interface SmartInputProps {
  nlQuery: string;
  setNLQuery: Dispatch<SetStateAction<string>>;
  selectedDatabase: { connID: string; dbType: string } | null;
}


export default function SmartInput({selectedDatabase = null, nlQuery, setNLQuery}: SmartInputProps) {
  const [cursorPos, setCursorPos] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filtered, setFiltered] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [suggestions, setSuggestions] = useState<string[]>([])
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
  (async () => {
    if (!selectedDatabase) return;
    const res = await GetTables(selectedDatabase.connID);
    setSuggestions(res.data);
  })();

  }, [selectedDatabase]);


  const updateCursor = () => {
    if (inputRef.current) {
      setCursorPos(inputRef.current.selectionStart || 0);
    }
  };

  const getCurrentToken = () => {
    const left = nlQuery.slice(0, cursorPos);
    const match = left.match(/\{([a-z]*)$/i);
    return match ? match[1] : null;
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNLQuery(val);
    updateCursor();

    const token = getCurrentToken();
    if (token !== null) {
      const newFiltered = suggestions.filter((s) =>
        s.startsWith(token.toLowerCase())
      );
      setFiltered(newFiltered);
      setSelectedIndex(0);
      setShowSuggestions(newFiltered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionSelect = (suggestion: string) => {
    const left = nlQuery.slice(0, cursorPos);
    const right = nlQuery.slice(cursorPos);

    const match = left.match(/\{([a-z]*)$/i);
    if (!match) return;

    const start = match.index!;
    const updated = left.slice(0, start) + `{${suggestion}}` + right;
    const newCursor = start + suggestion.length + 2;

    setNLQuery(updated);
    setCursorPos(newCursor);
    setShowSuggestions(false);

    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(newCursor, newCursor);
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showSuggestions) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => (i + 1) % filtered.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => (i - 1 + filtered.length) % filtered.length);
      } else if (e.key === "Tab" || e.key === "Enter") {
        e.preventDefault();
        handleSuggestionSelect(filtered[selectedIndex]);
      }
    }

    if (e.key === "Backspace") {
      const left = nlQuery.slice(0, cursorPos);
      const match = left.match(/(\{[^}]*\})$/);
      if (match) {
        const start = match.index!;
        const before = nlQuery.slice(0, start);
        const after = nlQuery.slice(cursorPos);
        setNLQuery(before + after);
        setCursorPos(start);
        setTimeout(() => {
          inputRef.current?.setSelectionRange(start, start);
        }, 0);
        e.preventDefault();
      }
    }
  };

  const highlightText = (str: string) =>
    str.replace(
      /{([^}]+)}/g,
      (_, word) =>
        `<span class="text-blue-600 font-semibold">{${word}}</span>`
    );

  return (
    <div className="relative w-full">
      <div
        className="absolute inset-0 p-2 whitespace-pre-wrap break-words font-mono text-sm pointer-events-none text-black"
        dangerouslySetInnerHTML={{ __html: highlightText(nlQuery) + "\u200b" }}
      />
      <textarea
        ref={inputRef}
        value={nlQuery}
        placeholder="Type your natural language query..."
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onClick={updateCursor}
        onKeyUp={updateCursor}
        onBlur={() => setShowSuggestions(false)}
        className={`relative z-10 w-full p-2 font-mono text-sm border border-gray-300 rounded ${nlQuery !== "" ? "text-transparent" : null} caret-black bg-transparent focus:outline-none`}
        spellCheck={false}
      />

      {showSuggestions && (
        <ul className="absolute z-20 mt-1 bg-white border border-gray-300 rounded shadow-md w-60 max-h-40 overflow-auto">
          {filtered.map((s, i) => (
            <li
              key={s}
              onMouseDown={() => handleSuggestionSelect(s)}
              className={`px-3 py-1 cursor-pointer hover:bg-gray-100 ${
                i === selectedIndex ? "bg-blue-100" : ""
              }`}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}