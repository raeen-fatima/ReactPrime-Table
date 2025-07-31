import { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import axios from "axios";
// import { Dropdown } from "primereact/dropdown";
import { OverlayPanel } from "primereact/overlaypanel";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import type { DataTableSelectionMultipleChangeEvent } from "primereact/datatable";

import type {
  DataTablePageEvent,
  // DataTableFilterEvent,
  // DataTableSelectionChangeEvent,
  DataTableSelectAllChangeEvent,
  DataTableFilterMeta,
} from "primereact/datatable";

interface Artwork {
  id: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions: string;
  date_start: number;
  date_end: number;
}

const ArtTable = () => {
  // Data and loading state
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  // Ref for overlay panel
  const op = useRef<OverlayPanel>(null);

  // Selected artworks state
  const [selectedArtworks, setSelectedArtworks] = useState<Artwork[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // State for number of rows user wants to select
  const [rowCount, setRowCount] = useState<string>("");

  // Lazy loading state
  const [lazyState, setLazyState] = useState<{
    first: number;
    rows: number;
    page: number;
    filters: DataTableFilterMeta;
  }>({
    first: 0,
    rows: 12,
    page: 0,
    filters: {
      title: { value: "", matchMode: "contains" },
      place_of_origin: { value: "", matchMode: "contains" },
      artist_display: { value: "", matchMode: "contains" },
    },
  });

  // Fetch artwork data
  useEffect(() => {
    const loadLazyData = async () => {
      setLoading(true);
      try {
        const page = lazyState.first / lazyState.rows + 1;
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}?page=${page}`
        );

        const parsed: Artwork[] = res.data.data.map((item: Artwork) => ({
          id: item.id,
          title: item.title,
          place_of_origin: item.place_of_origin,
          artist_display: item.artist_display,
          inscriptions: item.inscriptions,
          date_start: item.date_start,
          date_end: item.date_end,
        }));

        setArtworks(parsed);
        setTotalRecords(res.data.pagination.total);
      } catch (err) {
        console.error("Error loading data:", err);
      }
      setLoading(false);
    };

    loadLazyData();
  }, [lazyState]);

  // Pagination handler
  const onPage = (event: DataTablePageEvent) => {
    setLazyState({ ...lazyState, ...event });
  };

  // Checkbox selection handler
  const onSelectionChange = (
    event: DataTableSelectionMultipleChangeEvent<Artwork[]>
  ) => {
    setSelectedArtworks(event.value as Artwork[]);
    setSelectAll((event.value as Artwork[]).length === totalRecords);
  };

  // Select-all checkbox handler
  const onSelectAllChange = (event: DataTableSelectAllChangeEvent) => {
    const checked = event.checked;
    if (checked) {
      setSelectedArtworks([...artworks]);
    } else {
      setSelectedArtworks([]);
    }
    setSelectAll(checked);
  };

  return (
    <div className="card p-5">
      <h3 className="text-center mb-4 text-black text-4xl font-extrabold">
        Artwork Table
      </h3>

      <DataTable
        value={artworks}
        lazy
        paginator
        first={lazyState.first}
        rows={12}
        totalRecords={totalRecords}
        onPage={onPage}
        loading={loading}
        selection={selectedArtworks}
        onSelectionChange={onSelectionChange}
        selectAll={selectAll}
        onSelectAllChange={onSelectAllChange}
        dataKey="id"
        showGridlines
        tableStyle={{ minWidth: "70rem" }}
        selectionMode="multiple"
      >
        <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />
        <Column
          header={() => (
            <Button
              icon="pi pi-chevron-down"
              onClick={(e) => op.current?.toggle(e)}
            />
          )}
          headerStyle={{ width: "3rem" }}
        />
        <Column field="title" header="Title" />
        <Column field="place_of_origin" header="Origin" />
        <Column field="artist_display" header="Artist" />
        <Column field="inscriptions" header="Inscriptions" />
        <Column field="date_start" header="Date Start" />
        <Column field="date_end" header="Date End" />
      </DataTable>
      {/* Overlay panel with input and submit */}
      <OverlayPanel ref={op}>
        <div className="flex flex-col gap-2 p-2  w-52 border border-gray-300 rounded">
          <InputText
            placeholder="Select rows..."
            value={rowCount}
            onChange={(e) => setRowCount(e.target.value)}
            className="w-full border border-gray-300 rounded py-1 px-2 "
          />

          <div className="flex justify-end">
            <Button
              label="Submit"
              size="small"
              className="border border-gray-300 rounded py-1 px-2 justify-end "
              onClick={() => {
                const num = parseInt(rowCount, 10);
                if (!isNaN(num) && num > 0) {
                  const selected = artworks.slice(0, num);
                  setSelectedArtworks(selected);
                  setSelectAll(selected.length === totalRecords);
                }
                op.current?.hide();
              }}
            />
          </div>
        </div>
      </OverlayPanel>

      <div className="text-center mt-4 text-lg font-semibold text-black">
        Selected Rows: {selectedArtworks.length}
      </div>
    </div>
  );
};

export default ArtTable;
