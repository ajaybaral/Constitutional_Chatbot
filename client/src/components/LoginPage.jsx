import React from 'react';
import { motion } from 'framer-motion';
import { Google } from '@mui/icons-material';
import { Box, Button, Typography, Container, Paper } from '@mui/material';

const LoginPage = ({ onLogin }) => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(-45deg, #4F96B1, #F4CD63, #F5A660, #F06669)`,
        backgroundSize: '400% 400%',
        animation: 'gradientBG 15s ease infinite',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Floating Doodles */}
      <motion.svg
        width="120"
        height="120"
        viewBox="0 0 120 120"
        style={{ position: 'absolute', top: '10%', left: '8%' }}
        animate={{ rotate: [0, 10, -10, 0], y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <path d="M60 20 L80 50 L60 80 L40 50 Z" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="3" strokeLinecap="round" />
        <circle cx="60" cy="50" r="8" fill="rgba(244,205,99,0.6)" />
      </motion.svg>

      <motion.svg
        width="80"
        height="80"
        viewBox="0 0 80 80"
        style={{ position: 'absolute', top: '20%', right: '12%' }}
        animate={{ rotate: 360, scale: [1, 1.1, 1] }}
        transition={{ duration: 20, repeat: Infinity }}
      >
        <circle cx="40" cy="40" r="30" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" strokeDasharray="5,5" />
        <path d="M40 20 L50 35 L40 40 L30 35 Z" fill="rgba(245,166,96,0.5)" />
      </motion.svg>

      <motion.svg
        width="100"
        height="100"
        viewBox="0 0 100 100"
        style={{ position: 'absolute', bottom: '15%', left: '15%' }}
        animate={{ x: [0, 15, 0], y: [0, -15, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      >
        <path d="M20 50 Q30 30 50 50 T80 50" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="3" strokeLinecap="round" />
        <circle cx="20" cy="50" r="5" fill="rgba(240,102,105,0.7)" />
        <circle cx="80" cy="50" r="5" fill="rgba(79,150,177,0.7)" />
      </motion.svg>

      <motion.svg
        width="60"
        height="60"
        viewBox="0 0 60 60"
        style={{ position: 'absolute', bottom: '25%', right: '18%' }}
        animate={{ rotate: [0, -15, 15, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
      >
        <path d="M10 30 L30 10 L50 30 L30 50 Z" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2.5" />
        <circle cx="30" cy="30" r="3" fill="rgba(244,205,99,0.8)" />
      </motion.svg>

      {/* Stars */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            fontSize: '24px',
            opacity: 0.3
          }}
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 4 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 2
          }}
        >
          ✨
        </motion.div>
      ))}

      <Container maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <Paper
            elevation={24}
            sx={{
              p: 6,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: 6,
              border: '3px solid rgba(79,150,177,0.3)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
              position: 'relative',
              overflow: 'visible'
            }}
          >
            {/* Hand-drawn circle behind icon */}
            <svg
              width="140"
              height="140"
              viewBox="0 0 140 140"
              style={{ position: 'absolute', top: -30, zIndex: 0 }}
            >
              <path
                d="M70 20 Q95 25 110 45 Q125 65 120 85 Q115 105 95 115 Q75 125 55 120 Q35 115 25 95 Q15 75 20 55 Q25 35 45 25 Q65 15 70 20"
                fill="rgba(79,150,177,0.15)"
                stroke="rgba(79,150,177,0.4)"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              style={{ position: 'relative', zIndex: 1 }}
            >
              {/* Custom hand-drawn style icon */}
              <Box
                sx={{
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #4F96B1 0%, #F4CD63 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 3,
                  boxShadow: '0 10px 25px rgba(79, 150, 177, 0.3)',
                  position: 'relative'
                }}
              >
                <svg width="60" height="60" viewBox="0 0 60 60">
                  {/* Friendly book icon */}
                  <rect x="15" y="12" width="30" height="36" rx="2" fill="white" opacity="0.9" />
                  <line x1="30" y1="12" x2="30" y2="48" stroke="rgba(79,150,177,0.5)" strokeWidth="2" />
                  <path d="M20 22 L26 22 M20 28 L28 28 M20 34 L25 34" stroke="rgba(79,150,177,0.7)" strokeWidth="2" strokeLinecap="round" />
                  <path d="M34 22 L40 22 M34 28 L42 28 M34 34 L39 34" stroke="rgba(79,150,177,0.7)" strokeWidth="2" strokeLinecap="round" />
                </svg>
                
                {/* Small doodle heart */}
                <motion.svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  style={{ position: 'absolute', top: -5, right: -5 }}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <path d="M10 16 C6 12 2 10 2 6 C2 4 3 2 5 2 C7 2 8 3 10 5 C12 3 13 2 15 2 C17 2 18 4 18 6 C18 10 14 12 10 16 Z" fill="#F06669" />
                </motion.svg>
              </Box>
            </motion.div>

            {/* Hand-drawn underline */}
            <svg width="280" height="8" viewBox="0 0 280 8" style={{ position: 'absolute', top: 180 }}>
              <path d="M10 4 Q70 6 140 4 T270 4" fill="none" stroke="rgba(245,166,96,0.4)" strokeWidth="3" strokeLinecap="round" />
            </svg>

            <Typography 
              variant="h3" 
              component="h1" 
              sx={{ 
                fontFamily: '"Comic Sans MS", "Segoe Print", cursive',
                fontWeight: 700, 
                color: '#0F172A',
                mb: 1,
                textAlign: 'center',
                letterSpacing: '-0.01em',
                position: 'relative'
              }}
            >
              Constitutional AI
            </Typography>

            <Typography 
              variant="body1" 
              sx={{ 
                color: '#64748B',
                mb: 5,
                textAlign: 'center',
                fontSize: '1rem',
                fontStyle: 'italic'
              }}
            >
              Your friendly guide to Indian Constitutional knowledge! 📚
            </Typography>

            <Button
              onClick={onLogin}
              variant="contained"
              size="large"
              startIcon={<Google />}
              sx={{
                py: 1.8,
                px: 4,
                width: '100%',
                borderRadius: '50px',
                fontSize: '1.05rem',
                textTransform: 'none',
                fontWeight: 600,
                backgroundColor: '#4F96B1',
                color: 'white',
                boxShadow: '0 4px 14px rgba(79, 150, 177, 0.4)',
                transition: 'all 0.3s',
                '&:hover': {
                  backgroundColor: '#3d7a91',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 20px rgba(79, 150, 177, 0.5)'
                }
              }}
            >
              Let's Get Started! →
            </Button>

            <Box sx={{ mt: 4, display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '20px' }}>🔐</span>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'rgba(0,0,0,0.4)',
                  textAlign: 'center'
                }}
              >
                Safe & secure with Google
              </Typography>
            </Box>

            {/* Corner doodles */}
            <svg width="40" height="40" viewBox="0 0 40 40" style={{ position: 'absolute', top: 10, right: 10 }}>
              <circle cx="20" cy="20" r="3" fill="#F4CD63" />
              <circle cx="10" cy="15" r="2" fill="#F5A660" />
              <circle cx="30" cy="25" r="2" fill="#F06669" />
            </svg>

            <svg width="50" height="50" viewBox="0 0 50 50" style={{ position: 'absolute', bottom: 15, left: 15 }}>
              <path d="M10 25 L20 15 L30 25 L20 35 Z" fill="none" stroke="#4F96B1" strokeWidth="2" opacity="0.3" />
            </svg>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default LoginPage;
