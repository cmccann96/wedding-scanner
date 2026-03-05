import { useState, KeyboardEvent } from 'react';

interface Props {
  onSearch: (categories: string[]) => void;
}

export default function CategoryInput({ onSearch }: Props) {
  const [input, setInput] = useState('');
  const [categories, setCategories] = useState<string[]>([]);

  const addCategory = () => {
    const trimmed = input.trim();
    if (trimmed && !categories.includes(trimmed)) {
      setCategories([...categories, trimmed]);
    }
    setInput('');
  };

  const removeCategory = (cat: string) => {
    setCategories(categories.filter((c) => c !== cat));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') addCategory();
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
        <button onClick={addCategory} className="add-btn">Add</button>
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

      {categories.length > 0 && (
        <button className="search-btn" onClick={() => onSearch(categories)}>
          🔍 Scan Alibaba &amp; AliExpress
        </button>
      )}
    </div>
  );
}
