import React, { useState, useEffect } from 'react';

export const ScarletMonastery = () => {
  const targetDate = new Date(Date.UTC(2026, 0, 1)); // January 1st, 2026 at 00:00 UTC
  const [timeLeft, setTimeLeft] = useState('');
  const [footerDetail, setDetail] = useState('');

  useEffect(() => {
    const now = new Date();
    const diff: number = targetDate.getTime() - now.getTime();
    if (diff <= 0) {
      setTimeLeft("Scarlet Monastery releases in 2 more weeks!*");
      setDetail("*release date may vary, please check with with the developers to confirm");
    } else {
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      setDetail('');
    };
    const interval = setInterval(() => {
      const now = new Date();
      const diff: number = targetDate.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft("Scarlet Monastery releases in 2 more weeks!*");
        setDetail("*release date may vary, please check with with the developers to confirm");
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        setDetail('');
      }
    }, 1000);

    return () => clearInterval(interval); // Clean up interval on unmount
  }, []);


  return (
    <div
      style={{
        position: 'absolute',
        zIndex: 999,
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#333', // Nice dark gray background
        color: '#f0f0f0', // Light text color for contrast
        height: '100%', // Full viewport height
        top: 0,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center', // Center vertically
        alignItems: 'center', // Center horizontally
        overflow: 'hidden', // Prevent scrolling
      }}
    >
      <h1 style={{ color: '#ff6347' }}>Scarlet Monastery Patch Release</h1> {/* Nice red title */}
      <p style={{ fontSize: '2em', fontWeight: 'bold' }}>{timeLeft}</p>
      <footer style={{ fontSize: '0.8em', fontWeight: 'bold', color: 'grey', position: 'fixed', bottom: 0, paddingBottom: '0.1em' }}>{footerDetail}</footer>
    </div>
  );
};