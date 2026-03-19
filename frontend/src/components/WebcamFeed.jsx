import React, { useRef, useEffect, useState } from 'react';

export default function WebcamFeed() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const refImgCanvas = useRef(null);
  const [status, setStatus] = useState('');
  const [score, setScore] = useState(null);
  const refGrayData = useRef(null);
  const streamRef = useRef(null);

  // Load and process reference image ONCE
  useEffect(() => {
    const img = new window.Image();
    img.src = '/reference.jpg';
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = refImgCanvas.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, 300, 300);
        const frame = ctx.getImageData(0, 0, 300, 300);
        // Convert to grayscale
        for (let i = 0; i < frame.data.length; i += 4) {
          const avg = (frame.data[i] + frame.data[i + 1] + frame.data[i + 2]) / 3;
          frame.data[i] = avg;
          frame.data[i + 1] = avg;
          frame.data[i + 2] = avg;
        }
        ctx.putImageData(frame, 0, 0);
        // Store grayscale data for comparison
        refGrayData.current = new Uint8ClampedArray(frame.data);
      }
    };
  }, []);

  // Start webcam and handle ESC key
  useEffect(() => {
    let stream;
    let escHandler;
    async function startWebcam() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Error accessing webcam:', err);
      }
    }
    startWebcam();

    escHandler = (e) => {
      if (e.key === 'Escape') {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
      }
    };
    window.addEventListener('keydown', escHandler);

    return () => {
      window.removeEventListener('keydown', escHandler);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, []);

  useEffect(() => {
    let animationId;
    function drawAndCompare() {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas && refGrayData.current) {
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, 300, 300);
        const frame = ctx.getImageData(0, 0, 300, 300);
        // Convert frame to grayscale
        for (let i = 0; i < frame.data.length; i += 4) {
          const avg = (frame.data[i] + frame.data[i + 1] + frame.data[i + 2]) / 3;
          frame.data[i] = avg;
          frame.data[i + 1] = avg;
          frame.data[i + 2] = avg;
        }
        // Compare with reference using absdiff and calculate mean difference
        let diffSum = 0;
        let count = 0;
        for (let i = 0; i < frame.data.length; i += 4) {
          const gray = frame.data[i];
          const refGray = refGrayData.current[i];
          diffSum += Math.abs(gray - refGray);
          count++;
        }
        const meanDiff = diffSum / count;
        setScore(meanDiff.toFixed(2));
        const result = meanDiff < 15 ? 'OK' : 'NOT OK';
        setStatus(result);
        // Draw bounding box
        ctx.lineWidth = 6;
        ctx.strokeStyle = result === 'OK' ? 'limegreen' : 'red';
        ctx.strokeRect(10, 10, 280, 280);
        // Draw dot indicator on top right
        ctx.beginPath();
        ctx.arc(270, 30, 18, 0, 2 * Math.PI);
        ctx.fillStyle = result === 'OK' ? 'limegreen' : 'red';
        ctx.globalAlpha = 0.8;
        ctx.fill();
        ctx.globalAlpha = 1.0;
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#fff';
        ctx.stroke();
        // Overlay large, clear result text with label background
        const labelWidth = 180;
        const labelHeight = 60;
        const labelX = 60;
        const labelY = 120;
        ctx.save();
        ctx.globalAlpha = 0.85;
        ctx.fillStyle = result === 'OK' ? 'limegreen' : 'red';
        ctx.fillRect(labelX, labelY, labelWidth, labelHeight);
        ctx.globalAlpha = 1.0;
        ctx.font = 'bold 38px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#fff';
        ctx.fillText(result, labelX + labelWidth / 2, labelY + labelHeight / 2);
        ctx.restore();
      }
      animationId = requestAnimationFrame(drawAndCompare);
    }
    drawAndCompare();
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Hidden video element for webcam stream */}
      <video
        ref={videoRef}
        width={300}
        height={300}
        style={{ display: 'none' }}
        autoPlay
        playsInline
        muted
      />
      <canvas
        ref={canvasRef}
        width={300}
        height={300}
        style={{ width: 300, height: 300, background: '#000', borderRadius: 12, boxShadow: '0 2px 16px #0002', marginBottom: 16 }}
      />
      <canvas
        ref={refImgCanvas}
        width={300}
        height={300}
        style={{ display: 'none' }}
      />
      {score !== null && (
        <div style={{ fontSize: 18, color: '#888', marginTop: 8 }}>
          Mean diff score: <b>{score}</b>
        </div>
      )}
    </div>
  );
}
