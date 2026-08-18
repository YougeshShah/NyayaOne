import { useState, useEffect } from "react";
import { Autocomplete, TextField, CircularProgress } from "@mui/material";

interface PersonOption {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
}

interface PersonSearchSelectProps {
  label: string;
  searchFn: (q: string) => Promise<PersonOption[]>;
  onSelect: (personId: string | null) => void;
}

export function PersonSearchSelect({ label, searchFn, onSelect }: PersonSearchSelectProps) {
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState<PersonOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<PersonOption | null>(null);

  useEffect(() => {
    if (inputValue.length < 2) {
      setOptions([]);
      return;
    }
    let active = true;
    setLoading(true);
    const timer = setTimeout(() => {
      searchFn(inputValue)
        .then((results) => {
          if (active) setOptions(results);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 300); // debounce -- avoid firing a request on every keystroke

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [inputValue, searchFn]);

  return (
    <Autocomplete
      options={options}
      loading={loading}
      value={selected}
      getOptionLabel={(o) => `${o.fullName} (${o.email})`}
      isOptionEqualToValue={(o, v) => o.id === v.id}
      filterOptions={(x) => x} // server already filters -- don't re-filter client-side
      onInputChange={(_, value) => setInputValue(value)}
      onChange={(_, value) => {
        setSelected(value);
        onSelect(value?.id ?? null);
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          size="small"
          fullWidth
          placeholder="Type a name, email, or phone..."
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading && <CircularProgress size={16} />}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
}
