import { useCallback, useState } from "react";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";

type Severity = "success" | "error" | "info" | "warning";

export function useSnackbar() {
  const [state, setState] = useState<{
    open: boolean;
    message: string;
    severity: Severity;
  }>({ open: false, message: "", severity: "success" });

  const showSnackbar = useCallback((message: string, severity: Severity = "success") => {
    setState({ open: true, message, severity });
  }, []);

  const close = useCallback(() => {
    setState((s) => ({ ...s, open: false }));
  }, []);

  const snackbar = (
    <Snackbar
      open={state.open}
      autoHideDuration={4000}
      onClose={close}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert severity={state.severity} onClose={close}>
        {state.message}
      </Alert>
    </Snackbar>
  );

  return { showSnackbar, snackbar };
}
