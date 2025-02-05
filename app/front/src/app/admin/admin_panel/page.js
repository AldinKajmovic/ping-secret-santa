"use client"
import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import { v4 as uuidv4 } from 'uuid';
import { useEffect } from 'react';
import { useRouter } from "next/navigation";
import axios from 'axios';
import {
  GridRowModes,
  DataGrid,
  GridToolbarContainer,
  GridActionsCellItem,
  GridRowEditStopReasons,
} from '@mui/x-data-grid';
import { Router } from 'next/router';



const initialRows = [];

function EditToolbar(props) {
  const { setRows, setRowModesModel } = props;

  const handleClick = () => {
    const user_id = uuidv4();
    setRows((oldRows) => [
      ...oldRows,
      { id: user_id, first_name: '', last_name: '', username: '', password: '', isNew: true },
    ]);
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [user_id]: { mode: GridRowModes.Edit, fieldToFocus: 'first_name' },
    }));
  };

  return (
    <GridToolbarContainer>
      <Button color="primary" startIcon={<AddIcon />} onClick={handleClick}>
        Add user
      </Button>
    </GridToolbarContainer>
  );
}

export default function AdminPanel() {
  const router = useRouter();
  const [rows, setRows] = React.useState(initialRows);
  const [rowModesModel, setRowModesModel] = React.useState({});


  const handleRowEditStop = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleEditClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleDeleteClick = (id) => () => {
    axios.delete(`http://localhost:8000/delete_user/${id}`);
    setRows(rows.filter((row) => row.id !== id));
  };

  const handleCancelClick = (id) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });

    const editedRow = rows.find((row) => row.id === id);
    if (editedRow.isNew) {
      setRows(rows.filter((row) => row.id !== id));
    }
  };

  const processRowUpdate = (newRow) => {
    const updatedRow = { ...newRow, isNew: false };
    const updatedUser = {
      user_id: newRow.id,
      first_name: newRow.first_name,
      last_name: newRow.last_name,
      username: newRow.username,
      password: newRow.password,
    };

    axios.put(`http://localhost:8000/update_user`, updatedUser);
    setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
    return updatedRow;
  };

  const handleRowModesModelChange = (newRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };
  const handleClick = () =>{
    
    router.push('/admin/generate');
  }
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:8000/get_all_users');
        const users = response.data;

          const mappedRows = users.map((user) => ({
            id: user.user_id,
            first_name: user.first_name,
            last_name: user.last_name,
            username: user.username,
            password: user.password
          }));
        

        setRows(mappedRows);
      } catch (error) {
        console.error('Error fetching users ', error);
      }
    };

    fetchData();
  }, []);

  const columns = [
    { field: 'first_name', headerName: 'First name', width: 140, editable: true },
    { field: 'last_name', headerName: 'Last name', width: 250, editable: true },
    { field: 'username', headerName: 'Username', width: 180, editable: true },
    { field: 'password', headerName: 'Password', width: 250, editable: true },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      cellClassName: 'actions',
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              icon={<SaveIcon />}
              label="Save"
              sx={{
                color: 'primary.main',
              }}
              onClick={handleSaveClick(id)}
            />,
            <GridActionsCellItem
              icon={<CancelIcon />}
              label="Cancel"
              className="textPrimary"
              onClick={handleCancelClick(id)}
              color="inherit"
            />,
          ];
        }

        return [
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            className="textPrimary"
            onClick={handleEditClick(id)}
            color="inherit"
          />,
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            onClick={handleDeleteClick(id)}
            color="inherit"
          />,
        ];
      },
    },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "linear-gradient(135deg, #1E3C72, #2A5298)",
      }}
    >
      <Box
        sx={{
          height: 500,

          width: '80%',
          display: 'flex',
          flexDirection: 'column',
          '& .actions': {
            color: 'text.secondary',
          },
          '& .textPrimary': {
            color: 'text.primary',
          },
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          editMode="row"
          sx={{
            padding: 4,
            borderRadius: 3,
            backgroundColor: "#ffffff",
            boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.2)",
          }}
          rowModesModel={rowModesModel}
          onRowModesModelChange={handleRowModesModelChange}
          onRowEditStop={handleRowEditStop}
          processRowUpdate={processRowUpdate}
          slots={{ toolbar: EditToolbar }}
          slotProps={{
            toolbar: { setRows, setRowModesModel },
          }}
        />
        
      <Button
            variant="contained"
            onClick={()=> handleClick()}
            sx={{ mt: 5,  "&:hover": { backgroundColor: "#162A5A" } }}
          >
            Generate pairs
          </Button>
      </Box>


    </Box>
  );
}