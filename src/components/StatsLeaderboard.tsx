import { useEffect, useState } from "react";
import { Box, CircularProgress, IconButton, Tooltip, Select, MenuItem } from "@mui/material";
import { DataGrid, GridToolbarContainer, GridToolbarExport } from "@mui/x-data-grid";
import RefreshIcon from "@mui/icons-material/Refresh";
import type { GridColDef } from "@mui/x-data-grid";

type StatsRow = {
  id: number;
  player_name: string;
  total_matches: number;
  xp: number;
  KPG: number;
  FPG: number;
  final_skill_rating: number;
  overall_win_ratio: number;
  last_updated_player_level: number;
  country_flag: string;
  XPG: number;
  red_team_win_rate: number;
  blue_team_win_rate: number;
};

const SORT_OPTIONS = [
  { label: "XP / Game", value: "XPG" },
  { label: "Kills / Game", value: "KPG" },
  { label: "Flags / Game", value: "FPG" },
  { label: "Skill Rating", value: "final_skill_rating" },
  { label: "Win %", value: "overall_win_ratio" },
];

// Custom toolbar with refresh button + sort select + export
function CustomToolbar({ onRefresh, sort, setSort }: { onRefresh: () => void; sort: string; setSort: (s: string) => void }) {
  return (
    <GridToolbarContainer sx={{ justifyContent: "space-between", px: 1 }}>
      <Box display="flex" alignItems="center">
        <Tooltip title="Refresh Leaderboard">
          <IconButton onClick={onRefresh}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
        <Select value={sort} onChange={(e) => setSort(e.target.value)} size="small" sx={{ ml: 2 }}>
          {SORT_OPTIONS.map((o) => (
            <MenuItem key={o.value} value={o.value}>
              Sort by {o.label}
            </MenuItem>
          ))}
        </Select>
      </Box>
      <GridToolbarExport />
    </GridToolbarContainer>
  );
}

export default function StatsLeaderboard() {
  const [data, setData] = useState<StatsRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("overall_win_ratio");

  const loadData = async (sortField = sort) => {
    setLoading(true);
    const res = await fetch(`/.netlify/functions/leaderboard-stats?sort=${sortField}`);
    const json = await res.json();
    setData(json.map((row: any, idx: number) => ({ id: idx + 1, ...row })));
    setLoading(false);
  };

  useEffect(() => { loadData(sort); }, [sort]);

  const columns: GridColDef<StatsRow>[] = [
    { field: "id", headerName: "#", width: 70, align: "center", headerAlign: "center" },
    { field: "player_name", headerName: "Player", flex: 1, minWidth: 140 },
    { field: "total_matches", headerName: "Matches", width: 100, align: "center" },
    { field: "XPG", headerName: "XPG", width: 100, align: "center" },
    { field: "KPG", headerName: "KPG", width: 100, align: "center" },
    { field: "FPG", headerName: "FPG", width: 100, align: "center" },
    { field: "overall_win_ratio", headerName: "Win %", width: 100, align: "center", valueFormatter: (v) => `${Number(v).toFixed(2)}%` },
    { field: "red_team_win_rate", headerName: "Red %", width: 100, align: "center", valueFormatter: (v) => `${Number(v).toFixed(2)}%` },
    { field: "blue_team_win_rate", headerName: "Blue %", width: 100, align: "center", valueFormatter: (v) => `${Number(v).toFixed(2)}%` },
    { field: "last_updated_player_level", headerName: "Level", width: 80, align: "center" },
    {
      field: "country_flag",
      headerName: "Flag",
      width: 100,
      align: "center",
      sortable: false,
      renderCell: (params) => {
        const code = params.value?.replace(".png", "").toLowerCase();
        if (!code) return null;
        return (
          <img
            src={`/flags/${code}.png`}
            alt={code}
            width={34}
            height={22}
            style={{ borderRadius: 4, boxShadow: "0 1px 4px rgba(0,0,0,0.25)", background: "transparent" }}
            onError={(e) => ((e.currentTarget as HTMLImageElement).src = "/flags/unknown.png")}
          />
        );
      },
    },
  ];

  return (
    <Box sx={{ width: "100%", p: 2 }}>
      {loading ? (
        <Box display="flex" justifyContent="center" mt={6}>
          <CircularProgress />
        </Box>
      ) : (
        <DataGrid
          autoHeight
          rows={data}
          columns={columns}
          pagination
          pageSizeOptions={[5, 10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 8, page: 0 } } }}
          slots={{ toolbar: () => <CustomToolbar onRefresh={() => loadData()} sort={sort} setSort={setSort} /> }}
          disableRowSelectionOnClick
          disableMultipleRowSelection
          hideFooterSelectedRowCount
          sx={{
            width: "100%",
            border: "none",
            background: "linear-gradient(180deg,rgb(88, 78, 78) 0%, #f4f4f4 100%)",
            "& .MuiDataGrid-columnHeaders": { background: "#f0f0f0", fontWeight: "bold", fontSize: 15, borderBottom: "1px solid #ddd" },
            "& .MuiDataGrid-cell": { borderBottom: "1px solid #e3e3e3", color: "#1a1a1a" },
            "& .MuiDataGrid-row:hover": { background: "#ececec", transform: "scale(1.008)", transition: "0.12s ease-in-out" },
            "& .MuiDataGrid-row.Mui-selected": { opacity: 1, background: "linear-gradient(90deg, #ffffff, #f2f2f2)" },
            "& .MuiDataGrid-row.Mui-selected:hover": { background: "#eaeaea" },
            "& .MuiDataGrid-cell img": { opacity: 1, filter: "none", mixBlendMode: "normal", pointerEvents: "none", background: "transparent" },
            "& .MuiDataGrid-footerContainer": { borderTop: "1px solid #ddd" },
          }}
        />
      )}
    </Box>
  );
}
