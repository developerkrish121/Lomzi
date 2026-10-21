import { Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export function SearchBar({
  value = '',
  onSearch,
  placeholder = 'Search groceries…',
  autoFocus = false,
}) {
  const [query, setQuery] = useState(value);
  useEffect(() => setQuery(value), [value]);

  const submit = (event) => {
    event.preventDefault();
    onSearch(query.trim());
  };

  return (
    <form
      role="search"
      onSubmit={submit}
      className="relative flex w-full items-center rounded-2xl border border-forest/10 bg-white shadow-soft transition focus-within:border-leaf focus-within:ring-4 focus-within:ring-leaf/10 dark:border-white/10 dark:bg-white/10"
    >
      <Search
        aria-hidden="true"
        className="ml-4 size-5 shrink-0 text-ink-muted dark:text-white/55"
      />
      <label htmlFor="product-search" className="sr-only">
        Search products
      </label>
      <input
        id="product-search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="min-h-14 min-w-0 flex-1 bg-transparent px-3 text-ink outline-none placeholder:text-ink-muted/65 dark:text-white"
      />
      {query && (
        <button
          type="button"
          onClick={() => {
            setQuery('');
            onSearch('');
          }}
          className="grid size-11 place-items-center rounded-xl text-ink-muted hover:bg-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf"
          aria-label="Clear search"
        >
          <X className="size-4" />
        </button>
      )}
      <button
        type="submit"
        className="m-1.5 min-h-11 rounded-xl bg-forest px-5 text-sm font-bold text-white transition hover:bg-forest-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf"
      >
        Search
      </button>
    </form>
  );
}
