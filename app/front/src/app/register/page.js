"use client"
import React from "react";
import { Box, Typography, TextField, Button, Card } from "@mui/material";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import axios from "axios";

function Register() {
  const router = useRouter();
  const { register, handleSubmit } = useForm();

  const onSubmit = (data) => {
    console.log(data);
    
    axios.post('http://localhost:8000/register', data).then(
        (response) => {
          router.push('/login');
        },
        (error) => {
          console.log("Error: ", error);
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
          Join our site !
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)} style={{ width: "100%" }}>
          <TextField 
            label="First name"
            {...register("first_name", { required: true })} 
            fullWidth 
            margin="normal" 
          />
          <TextField 
            label="Last name"
            {...register("last_name", { required: true })} 
            fullWidth 
            margin="normal" 
          />
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
            Register
          </Button>
        </form>
      </Card>
    </Box>
  );
}

export default Register;
