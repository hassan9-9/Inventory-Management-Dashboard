"use client";

import { useState, useEffect } from "react";
import Header from "@/app/(components)/Header";
import {
  useGetUsersQuery,
  useDeleteUserMutation,
  useUpdateUserMutation,
} from "@/state/api";

import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
} from "@mui/x-data-grid";

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Snackbar,
  Alert,
  TextField,
  Tooltip,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const Users = () => {
  const { data: users, isLoading, isError } = useGetUsersQuery();

  const [deleteUser, { isLoading: deleting }] =
    useDeleteUserMutation();

  const [updateUser, { isLoading: updating }] =
    useUpdateUserMutation();

  const [selectedUser, setSelectedUser] = useState<any>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  useEffect(() => {
    if (!selectedUser) return;

    // const parts = selectedUser.name?.split(" ") || [];

    setFirstName(selectedUser.firstName ?? "");
    setLastName(selectedUser.lastName ?? "");
    setUsername(selectedUser.username ?? "");
    // setUsername(selectedUser.username || "");
  }, [selectedUser]);

  const handleDelete = async () => {
    if (!selectedUser) return;

    try {
      await deleteUser(selectedUser.userId).unwrap();

      setSnackbar({
        open: true,
        severity: "success",
        message: "User deleted successfully.",
      });

      setDeleteDialogOpen(false);
    } catch {
      setSnackbar({
        open: true,
        severity: "error",
        message: "Failed to delete user.",
      });
    }
  };

  const handleUpdate = async () => {
    if (!selectedUser) return;

    try {
      await updateUser({
        userId: selectedUser.userId,
        firstName,
        lastName,
        username,
      }).unwrap();

      setSnackbar({
        open: true,
        severity: "success",
        message: "User updated successfully.",
      });

      setEditDialogOpen(false);
    } catch {
      setSnackbar({
        open: true,
        severity: "error",
        message: "Failed to update user.",
      });
    }
  };

  const columns: GridColDef[] = [
    {
      field: "userId",
      headerName: "ID",
      width: 240,
    },
    {
      field: "firstName",
      headerName: "First Name",
      flex: 1,
    },
    {
      field: "lastName",
      headerName: "Last Name",
      flex: 1,
    },
    {
      field: "username",
      headerName: "Username",
      flex: 1,
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1.5,
    },
    {
      field: "role",
      headerName: "Role",
      width: 120,
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 140,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => (
        <>
          <Tooltip title="Edit">
            <IconButton
              color="primary"
              onClick={() => {
                setSelectedUser(params.row);
                setEditDialogOpen(true);
              }}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Delete">
            <IconButton
              color="error"
              onClick={() => {
                setSelectedUser(params.row);
                setDeleteDialogOpen(true);
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </>
      ),
    },
  ];

  if (isLoading) {
    return <div className="py-4">Loading...</div>;
  }

  if (isError || !users) {
    return (
      <div className="text-center text-red-500 py-4">
        Failed to fetch users
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <Header name="Users" />

      <Box sx={{ mt: 3, height: 650 }}>
        <DataGrid
          rows={users}
          columns={columns}
          getRowId={(row) => row.userId}
          checkboxSelection
          disableRowSelectionOnClick
        />
      </Box>

      {/* Delete Dialog */}

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete User</DialogTitle>

        <DialogContent>
          Are you sure you want to delete{" "}
          <strong>{selectedUser?.name}</strong>?
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>

          <Button
            color="error"
            variant="contained"
            onClick={handleDelete}
            disabled={deleting}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}

      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit User</DialogTitle>

        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            mt: 1,
          }}
        >
          <TextField
            label="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />

          <TextField
            label="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />

          <TextField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleUpdate}
            disabled={updating}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() =>
          setSnackbar({
            ...snackbar,
            open: false,
          })
        }
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Users;