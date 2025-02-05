
"use client"
import React from "react";
import { Box, Typography, TextField, Button, Card } from "@mui/material";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import axios from "axios";


function Login() {
  const router = useRouter();
  const { register, handleSubmit } = useForm();

  const onSubmit = (data) => {
    axios.post('http://localhost:8000/login', data, { withCredentials: true }).then(
      (response) => {
        const role = response.data.role;
        if(role == "Worker") router.push('/user');
        else router.push('/admin/admin_panel');
      },
      (error) => {
        console.log("Error: ", error);
        if (error.response) {

          if (error.response && error.response.status === 401) {
            document.getElementById("statusMessage").innerHTML = "Incorrect username or password!";
          } else if (error.response && error.response.status === 404) {
            document.getElementById("statusMessage").innerHTML = "Username not found!";
          }
        } else {

          document.getElementById("statusMessage").innerHTML = "An unexpected error occurred. Please try again.";
        }
      }
    );
  };
  
  

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
      <Card
        elevation={8}
        sx={{
          padding: 4,
          width: { xs: "90%", sm: "400px" },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          borderRadius: 3,
          backgroundColor: "#ffffff",
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.2)",
        }}
      >
        <Typography variant="h5" fontWeight="bold" color="#333" gutterBottom>
          Enter your credentials
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)} style={{ width: "100%" }}>
          <TextField
            label="Username"
            {...register("username", { required: true })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Password"
            type="password"
            {...register("password", { required: true })}
            fullWidth
            margin="normal"
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2, backgroundColor: "#1E3C72", "&:hover": { backgroundColor: "#162A5A" } }}
          >
            Login
          </Button>
        </form>
        <Typography id="statusMessage" variant="h5" fontWeight="bold" color="red" sx={{ marginTop: 2 }}>

        </Typography>
      </Card>
    </Box>
  );
}

export default Login;
