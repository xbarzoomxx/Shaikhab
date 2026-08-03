"use client";

import { useCallback, useEffect, useState } from "react";

export function useSectionData(section) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(() => {
    setLoading(true);
    setError("");
    fetch(`/api/sheet?section=${section}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setRows(data.rows || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [section]);

  useEffect(() => {
    reload();
  }, [reload]);

  const columns = rows.length > 0 ? Object.keys(rows[0]).filter((k) => k !== "_row") : [];

  return { rows, columns, loading, error, reload };
}
