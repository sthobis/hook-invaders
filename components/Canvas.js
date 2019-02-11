import throttle from "lodash/throttle";
import React, { useEffect, useRef, useState } from "react";

const CANVAS_SIZE = 400
const BLOCK_SIZE = 20
const CANVAS_DIMENSION = CANVAS_SIZE / BLOCK_SIZE

const Canvas = () => {
  const canvasRef = useRef();

  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleMouseMove = throttle(e => {
      setMouse({ x: e.clientX - canvasRef.current.getBoundingClientRect().left, y: e.clientY  - canvasRef.current.getBoundingClientRect().top})
    }, 10)
    canvasRef.current.addEventListener("mousemove", handleMouseMove)
    return () => {
      canvasRef.current.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])
  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    // drawGrid()
    drawPointer()
  }, [mouse])

  const drawGrid = () => {
    const ctx = canvasRef.current.getContext("2d");
    for (let i = 1; i < CANVAS_SIZE / BLOCK_SIZE; i++) {
      ctx.lineWidth = 1;

      ctx.beginPath();
      ctx.moveTo(i * BLOCK_SIZE, 0)
      ctx.lineTo(i * BLOCK_SIZE, CANVAS_SIZE)
      ctx.closePath()
      ctx.stroke()

      ctx.beginPath();
      ctx.moveTo(0, i * BLOCK_SIZE)
      ctx.lineTo(CANVAS_SIZE, i * BLOCK_SIZE)
      ctx.closePath()
      ctx.stroke()
    }
  }

  const drawPointer = () => {
    const ctx = canvasRef.current.getContext("2d");
    const row = CANVAS_DIMENSION - 1
    const column = Math.floor(mouse.x / (CANVAS_DIMENSION))
    ctx.fillStyle = "#ccc"
    ctx.fillRect(BLOCK_SIZE * column, BLOCK_SIZE * row, BLOCK_SIZE, BLOCK_SIZE)
    console.log(mouse.x)
  }

  return (
    <div className="canvas-container">
      <canvas ref={canvasRef} width={CANVAS_SIZE} height={CANVAS_SIZE}/>
      <style jsx>{`
        .canvas-container {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100vw;
          height: 100vh;
        }

        canvas {
          background: #000;
        }
      `}</style>
      <style jsx global>{`
        body {
          margin: 0;
          box-sizing: border-box;
        }
      `}</style>
    </div>
  )
}

export default Canvas