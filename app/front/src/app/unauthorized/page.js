import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import Link from 'next/link';

const Unauthorized = () => {
  return (
    <Box sx={{ textAlign: 'center', marginTop: '50px' }}>
      <Typography variant="h3" sx={{ color: '#FF0000', fontWeight: 'bold' }}>
        403 - Unauthorized
      </Typography>
      <Typography variant="body1" sx={{ fontSize: '1.2rem', marginBottom: '20px' }}>
        You do not have access to this page.
      </Typography>
      <Link href="/login" passHref>
        <Button 
          variant="contained" 
          sx={{
            backgroundColor: '#4CAF50',
            color: '#fff',
            '&:hover': {
              backgroundColor: '#45a049',
            },
          }}
        >
          Go to Login
        </Button>
      </Link>
    </Box>
  );
};

export default Unauthorized;
