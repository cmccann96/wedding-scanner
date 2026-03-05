import { useState, type KeyboardEvent } from 'react';

interface Props {
  onSearch: (categories: string[]) => void;
}

export default function CategoryInput({ onSearch }: Props) {
  const [input, setInput] = useState('');
  const [categories, setCategories] = useState<string[]>([]);

  const addAndSearch = (currentCategories: string[], newInput: string) => {
    const trimmed = newInput.trim();
    let updated = currentCategories;
    if (trimmed && !currentCategories.includes(trimmed)) {
      updated = [...currentCategories, trimmed];
      setCategories(updated);
    }
    setInput('');
    if (updated.length > 0) onSearch(updated);
  };

  const removeCategory = (cat: string) => {
    setCategories(categories.filter((c) => c !== cat));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') addAndSearch(categories, input);
  };

  return (
    <div className="category-input-container">
      <div className="input-row">
        <input
          type="text"
          placeholder="e.g. party cups, tablecloths..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="category-text-input"
        />
        <button onClick={() => addAndSearch(categories, input)} className="add-btn">
          🔍 Search
        </button>
      </div>

      {categories.length > 0 && (
        <div className="tags-row">
          {categories.map((cat) => (
            <span key={cat} className="tag">
              {cat}
              <button className="tag-remove" onClick={() => removeCategory(cat)}>×</button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
