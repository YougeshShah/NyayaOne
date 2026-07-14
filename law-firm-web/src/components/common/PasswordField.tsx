import { useState, forwardRef } from "react";
import { IconButton, InputAdornment, TextField, TextFieldProps } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

/**
 * Drop-in replacement for MUI TextField when the field holds a password.
 * Adds a show/hide eye-icon toggle. Accepts all normal TextField props
 * (including react-hook-form's {...register(...)} spread) via forwardRef.
 */
export const PasswordField = forwardRef<HTMLInputElement, TextFieldProps>((props, ref) => {
  const [visible, setVisible] = useState(false);

  return (
    <TextField
      {...props}
      inputRef={ref}
      type={visible ? "text" : "password"}
      InputProps={{
        ...props.InputProps,
        endAdornment: (
          <InputAdornment position="end">
            <IconButton onClick={() => setVisible((v) => !v)} edge="end" tabIndex={-1}>
              {visible ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
});

PasswordField.displayName = "PasswordField";
