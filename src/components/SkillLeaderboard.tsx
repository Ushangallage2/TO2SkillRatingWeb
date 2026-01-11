import { useEffect, useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";

type SkillRow = {
  id: number;
  player_name: string;
  total_matches: number;
  kills: number;
  flags_captured: number;
  final_skill_rating: number;
  overall_win_ratio: number;
  last_updated_player_level: number;
  country_flag: string;
};

const TIER_DEFINITIONS = [
    { name: "Bronze", min: 0.01, max: 4.0, badge: "bronze_badge.png" },
    { name: "Silver", min: 4.0, max: 6.5, badge: "silver_badge.png" },
    { name: "Gold", min: 6.5, max: 8.5, badge: "gold_badge.png" },
    { name: "Master", min: 8.5, max: Infinity, badge: "master_badge.png" }, // Infinity for no upper limit
  ];
  
  function getTierBadge(rating: number) {
    if (rating == null) return null;
  
    const tier = TIER_DEFINITIONS.find(t => rating >= t.min && rating < t.max);
    return tier ? `/badges/${tier.badge}` : null;
  }
  

export default function SkillLeaderboard() {
  const [data, setData] = useState<SkillRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [_height, setHeight] = useState(window.innerHeight - 96);

  useEffect(() => {
    const onResize = () => setHeight(window.innerHeight - 96);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  async function load() {
    setLoading(true);
    const res = await fetch("/.netlify/functions/leaderboard-skill");
    const json = await res.json();
    setData(json.map((row: any, idx: number) => ({ id: idx + 1, ...row })));
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);


  console.log(import.meta.env.BASE_URL);


  const columns: GridColDef<SkillRow>[] = [
    {
      field: "row",
      headerName: "#",
      width: 70,
      sortable: false,
      filterable: false,
      align: "center",
      headerAlign: "center",
      valueGetter: (_v, row, _c, apiRef) =>
        apiRef.current.getRowIndexRelativeToVisibleRows(row.id) + 1,
    },
    {
      field: "player_name",
      headerName: "Player",
      flex: 1,
      minWidth: 140,
    },
    {
        field: "tier",
        headerName: "Tier",
        width: 100,
        align: "center",
        headerAlign: "center",
        sortable: false,
        renderCell: (params) => {
          const src = getTierBadge(params.row.final_skill_rating);
          if (!src) return null;
          return (
            <img
              src={src}
              alt="Tier Badge"
              width={32}
              height={32}
              style={{ borderRadius: 4, boxShadow: "0 1px 4px rgba(0,0,0,0.25)" }}
              onError={(e) => ((e.currentTarget as HTMLImageElement).src = "/badges/unknown.png")}
            />
          );
        },
      }
      ,
    { field: "total_matches", headerName: "Matches", width: 100, align: "center" },
    { field: "kills", headerName: "Kills", width: 80, align: "center" },
    { field: "flags_captured", headerName: "Flags", width: 80, align: "center" },
    {
      field: "final_skill_rating",
      headerName: "Skill",
      width: 100,
      align: "center",
    },
    {
      field: "overall_win_ratio",
      headerName: "Win %",
      width: 120,
      align: "center",
      valueFormatter: (v) => `${Number(v).toFixed(2)}%`,
    },
    {
      field: "last_updated_player_level",
      headerName: "Level",
      width: 80,
      align: "center",
    },
    {
        field: "country_flag",
        headerName: "Flag",
        width: 100,
        align: "center",
        sortable: false,
        renderCell: (params) => {
            const code = params.value?.replace(".png","").toLowerCase();
            if (!code) return null;
          
            return (
              <img
                src={`/flags/${code}.png`}
                alt={code}
                width={34}
                height={22}
                style={{ borderRadius: 4, boxShadow: "0 1px 4px rgba(0,0,0,0.25)" }}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/flags/unknown.png";
                }}
              />
            );
          }
          
      }
      
      
      ,
  ];

  return (
    <Box sx={{ width: "100%", p: 2 }}>
  {loading ? (
    <Box display="flex" justifyContent="center" mt={6}>
      <CircularProgress />
    </Box>
  ) : (
    <DataGrid
      autoHeight   // <-- add this
      rows={data}
      columns={columns}
      pagination
      pageSizeOptions={[5, 10, 25, 50]}
      initialState={{
        pagination: { paginationModel: { pageSize: 8, page: 0 } },
      }}
      slots={{ toolbar: GridToolbar }}
      disableRowSelectionOnClick
      disableMultipleRowSelection
      hideFooterSelectedRowCount
      sx={{
        width: "100%",
        border: "none",
        background: "linear-gradient(180deg,rgb(100, 97, 97) 0%, #f4f4f4 100%)",
        "& .MuiDataGrid-columnHeaders": {
          backgroundColor: "#4a9e2",
          fontWeight: "bold",
          fontSize: 17,
          borderBottom: "1px solid #ddd",
        },
        "& .MuiDataGrid-cell": {
          borderBottom: "1px solid rgb(142, 122, 122)",
          color: "#1a1a1a",
        },
        "& .MuiDataGrid-row:hover": {
          background: "#ececec",
          transform: "scale(1.008)",
          transition: "0.12s ease-in-out",
        },
        "& .MuiDataGrid-row.Mui-selected": {
          opacity: 1,
          background: "linear-gradient(90deg, #ffffff, #f2f2f2)",
        },
        "& .MuiDataGrid-row.Mui-selected:hover": {
          background: "#eaeaea",
        },
        "& .MuiDataGrid-cell img": {
          opacity: 1,
          filter: "none",
          mixBlendMode: "normal",
          pointerEvents: "none",
          background: "transparent",
        },
        "& .MuiDataGrid-footerContainer": {
          borderTop: "1px solid #ddd",
        },
      }}
    />
  )}
</Box>
  );
};