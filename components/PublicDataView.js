"use client";

import { useSectionData } from "@/lib/useSectionData";
import SectionExplorer from "@/components/SectionExplorer";

export default function PublicDataView({ section, searchLabel }) {
  const { rows, columns, loading, error } = useSectionData(section);
  return (
    <SectionExplorer
      rows={rows}
      columns={columns}
      loading={loading}
      error={error}
      searchLabel={searchLabel}
    />
  );
}
