"use client"
import React from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

import { useCookies } from 'next-client-cookies';


function UserPanel() {
    const router = useRouter();
    const [secretSanta, setsecretSanta] = useState([]);
    const cookies = useCookies();
    const cookieObj = cookies.get("login-cookie");
    const jsonCookie = JSON.parse(cookieObj);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const username = jsonCookie.username;
                const response = await axios.get(`http://localhost:8000/get_santa/${username}`);
                setsecretSanta(response.data);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []);


    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                background: "linear-gradient(135deg, #1E3C72, #2A5298)",
                padding: "20px",
            }}
        >

            <Typography variant="h6">{`Your secret Santa is: ${secretSanta}`}</Typography>

        </Box>
    );
}

export default UserPanel;
