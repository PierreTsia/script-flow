import { GlobalSearchEntitiesResult } from "@/convex/search";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import React from "react";

import {
  DialogTitle,
  DialogHeader,
  DialogDescription,
} from "@/components/ui/dialog";
interface SearchFormProps {
  className?: string;
  onSearch: (term: string) => void;
  searchTerm: string;
  results?: GlobalSearchEntitiesResult;
  isLoading: boolean;
}

export function SearchForm({
  onSearch,
  searchTerm,
  results,
  isLoading,
}: SearchFormProps) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <div className="relative ml-auto">
      <Button
        variant="outline"
        className="w-full justify-start text-sm text-muted-foreground sm:w-64 sm:pr-12"
        onClick={() => setOpen(true)}
      >
        <span>Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <DialogHeader className="sr-only">
          <DialogTitle>Search</DialogTitle>
          <DialogDescription>
            Search for characters, locations, scenes, and props.
          </DialogDescription>
        </DialogHeader>
        <CommandInput
          placeholder="Search anything..."
          value={searchTerm}
          onValueChange={onSearch}
        />
        <CommandList>
          {isLoading && <CommandEmpty>Searching...</CommandEmpty>}

          {!isLoading && results && (
            <>
              {results.length > 0 ? (
                <>
                  <CommandGroup heading="Characters">
                    {results
                      .filter((r) => r.entityType === "character")
                      .map((result) => (
                        <CommandItem
                          key={result._id}
                          className="flex items-center px-4 gap-2 w-full"
                        >
                          {result.preview}
                        </CommandItem>
                      ))}
                  </CommandGroup>

                  <CommandGroup heading="Locations">
                    {results
                      .filter((r) => r.entityType === "location")
                      .map((result) => (
                        <CommandItem key={result._id}>
                          {result.preview}
                        </CommandItem>
                      ))}
                  </CommandGroup>
                  <CommandGroup heading="Props">
                    {results
                      .filter((r) => r.entityType === "prop")
                      .map((result) => (
                        <CommandItem key={result._id}>
                          {result.preview}
                        </CommandItem>
                      ))}
                  </CommandGroup>
                  <CommandGroup heading="Scenes">
                    {results
                      .filter((r) => r.entityType === "scene")
                      .map((result) => (
                        <CommandItem key={result._id}>
                          {result.preview}
                        </CommandItem>
                      ))}
                  </CommandGroup>
                </>
              ) : (
                <CommandEmpty>No results found.</CommandEmpty>
              )}
            </>
          )}
        </CommandList>
      </CommandDialog>
    </div>
  );
}
