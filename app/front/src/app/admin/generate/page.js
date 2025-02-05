"use client"
import React from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Grid } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';

function GeneratePairs() {
    const router = useRouter();
    const [userList, setUserList] = useState([]);
    const [pairList, setPairList] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get("http://localhost:8000/get_all_users");
                setUserList(response.data);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []);


    useEffect(() => {
        if (userList.length === 0) return;
        let newPairList = [];
        let isValid = false;

        while (!isValid) {
            const shuffledList = [...userList];
            let currentIndex = shuffledList.length;
            while (currentIndex !== 0) {
                let randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex--;
                [shuffledList[currentIndex], shuffledList[randomIndex]] = [shuffledList[randomIndex], shuffledList[currentIndex]];
            }

            isValid = true;
            newPairList = [];
            let usedPartners = new Set();

            for (let i = 0; i < userList.length; i++) {
                let first_person = userList[i].username;
                let second_person = shuffledList[i].username;

                if (first_person === second_person || usedPartners.has(second_person) ) {
                    isValid = false;
                    break;
                } else {
                    usedPartners.add(second_person);
                    newPairList.push([
                        {username: first_person},{username: second_person},
                    ]);
                }
            }

        }

        setPairList(newPairList);

    }, [userList]);

    
    useEffect(() => {
        if (userList.length !== 0 && pairList.length > 0) {
            const sendData = async () => {
                try {
                    const shuffleId = uuidv4();
                    await axios.post(`http://localhost:8000/create_shuffle/${shuffleId}`);
                    let santaPairList = [];
                    pairList.map((pair) => {
                            const firstUsername = pair[0].username;
                            const secondUsername = pair[1].username;
                            santaPairList.push({first_username : firstUsername, second_username: secondUsername});
                    });

                    const obj = { shuffleID: shuffleId, santaList: santaPairList };
                     await axios.post("http://localhost:8000/add_shuffle_users", obj);

                } catch (error) {
                    console.error("Error in requests:", error);
                }
            };

            sendData();
        }
    }, [pairList]);


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
                        <Card sx={{ backgroundColor: pair.length === 2 ? "#2A5298" : "#1E3C72" }}>
                            <CardContent sx={{ textAlign: "center", color: "#fff", padding: "20px", borderRadius: "8px" }}>
                                <>
                                    <Typography variant="h6">{`Pair ${index + 1}:`}</Typography>
                                    <Typography variant="body1">
                                        {`username: ${pair[0].username}`}
                                        <br />
                                        <span>&</span>
                                        <br />
                                        {`username: ${pair[1].username}`}
                                    </Typography>
                                </>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}

export default GeneratePairs;
