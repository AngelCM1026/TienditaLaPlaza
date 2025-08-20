// src/components/SearchBar.jsx
import React, { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      onSearch(query); // Solo enviamos el texto, no datos
    }, 300); // 300ms debounce

    return () => clearTimeout(delayDebounce);
  }, [query, onSearch]);

  return (
    <div style={{
      width: '100%',
      background: '#003366',
      padding: '0.5rem 0',
      boxSizing: 'border-box'
    }}>
      <form
        onSubmit={e => e.preventDefault()}
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          background: 'white',
          borderRadius: '4px',
          overflow: 'hidden'
        }}
      >
        <input
          type="text"
          placeholder="Buscar..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{
            flex: 1,
            border: 'none',
            padding: '0.5rem 1rem',
            fontSize: '1rem'
          }}
        />
        <button
          type="button"
          style={{
            background: 'transparent',
            border: 'none',
            padding: '0 1rem',
            cursor: 'pointer'
          }}
        >
          <FaSearch size={18} color="#003366" />
        </button>
      </form>
    </div>
  );
}
