
import { useState } from 'react';
import { X } from 'lucide-react';

export default function ChipInput({ value = [], onChange, placeholder }) {
  const [input, setInput] = useState('');

  const handleAdd = (e) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      if (!value.includes(input.trim())) {
        onChange([...value, input.trim()]);
      }
      setInput('');
    }
  };

  const handleRemove = (item) => {
    onChange(value.filter(v => v !== item));
  };

  return (
    <div className="border border-gray-300 rounded-lg p-2 focus-within:ring-2 focus-within:ring-sky-500 focus-within:border-transparent">
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((item) => (
          <span
            key={item}
            className="inline-flex items-center gap-1 px-2 py-1 bg-sky-100 text-sky-700 rounded-md text-sm"
          >
            {item}
            <button
              type="button"
              onClick={() => handleRemove(item)}
              className="hover:bg-sky-200 rounded"
            >
              <X size={14} />
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleAdd}
        placeholder={placeholder}
        className="w-full outline-none text-sm"
      />
    </div>
  );
}