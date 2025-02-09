"use client"
import React from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Grid } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';

function GeneratePairs() {
    const router = useRouter();
    const [pairList, setPairList] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get("http://localhost:8000/last_shuffle");
                setPairList(response.data);
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
            <Grid container spacing={4}>
                {pairList.map((pair, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card sx={{ backgroundColor: "#2A5298" }}>
                            <CardContent sx={{ textAlign: "center", color: "#fff", padding: "20px", borderRadius: "8px" }}>
                                {pair.second_pair_member_username == "NONE" ? <>
                                    <Typography variant="h6">Unpaired</Typography>
                                    <Typography variant="body1">
                                        {`username: ${pair.first_pair_member_username}`}
                                        <br />
                                        <span>&</span>
                                        <br />
                                        {`username: ${pair.second_pair_member_username}`}
                                    </Typography>
                                </> :<>
                                    <Typography variant="h6">{`Pair ${index + 1}:`}</Typography>
                                    <Typography variant="body1">
                                        {`username: ${pair.first_pair_member_username}`}
                                        <br />
                                        <span>&</span>
                                        <br />
                                        {`username: ${pair.second_pair_member_username}`}
                                    </Typography>
                                </> }
                                
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}

export default GeneratePairs;
