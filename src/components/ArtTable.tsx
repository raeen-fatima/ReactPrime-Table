import { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import axios from 'axios';

import type {
  DataTablePageEvent,
  DataTableFilterEvent,
  DataTableSelectionChangeEvent,
  DataTableSelectAllChangeEvent,
  DataTableFilterMeta
} from 'primereact/datatable';

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
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const [selectedArtworks, setSelectedArtworks] = useState<Artwork[]>([]);
  const [selectAll, setSelectAll] = useState(false);

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
      title: { value: '', matchMode: 'contains' },
      place_of_origin: { value: '', matchMode: 'contains' },
      artist_display: { value: '', matchMode: 'contains' }
    }
  });

  useEffect(() => {
    const loadLazyData = async () => {
      setLoading(true);
      try {
        const page = lazyState.first / lazyState.rows + 1;
        const res = await axios.get(`${import.meta.env.VITE_API_URL}?page=${page}`);

        const parsed: Artwork[] = res.data.data.map((item: any) => ({
          id: item.id,
          title: item.title,
          place_of_origin: item.place_of_origin,
          artist_display: item.artist_display,
          inscriptions: item.inscriptions,
          date_start: item.date_start,
          date_end: item.date_end
        }));

        setArtworks(parsed);
        setTotalRecords(res.data.pagination.total);
      } catch (err) {
        console.error('Error loading data:', err);
      }
      setLoading(false);
    };

    loadLazyData();
  }, [lazyState]);

  const onPage = (event: DataTablePageEvent) => {
    setLazyState({ ...lazyState, ...event });
  };

  const onFilter = (event: DataTableFilterEvent) => {
    setLazyState({ ...lazyState, first: 0, filters: event.filters });
  };

  const onSelectionChange = (event: DataTableSelectionChangeEvent<Artwork[]>) => {
    setSelectedArtworks(event.value as Artwork[]);
    setSelectAll((event.value as Artwork[]).length === totalRecords);
  };

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
      <h3 className="text-center mb-4 text-black text-4xl font-extrabold">Artwork Table</h3>

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
        overlayVisible={true}
        dataKey="id"
        showGridlines
        tableStyle={{ minWidth: '70rem' }}
      >
        <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} />
        <Column field="title" header="Title"  />
        <Column field="place_of_origin" header="Origin"  />
        <Column field="artist_display" header="Artist"  />
        <Column field="inscriptions" header="Inscriptions" />
        <Column field="date_start" header="Date Start" />
        <Column field="date_end" header="Date End" />
      </DataTable>

      <div className="text-center mt-4 text-lg font-semibold text-black">
        ✅ Selected Rows: {selectedArtworks.length}
      </div>
    </div>
  );
};

export default ArtTable;
