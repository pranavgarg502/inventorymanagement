import { Search } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function SearchBar({ placeholder = 'Search...', onSearch, debounce = 400, value: externalValue }) {
  const [value, setValue] = useState(externalValue || '');

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(value);
    }, debounce);
    return () => clearTimeout(timer);
  }, [value, debounce, onSearch]);

  return (
    <div className="relative">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="input pl-9 w-64"
      />
    </div>
  );
}
